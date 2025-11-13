/**
 * Rooms Management APIs
 * GET /api/rooms - List all buildings and rooms
 * GET /api/rooms/availability - Check room availability for a time period
 */

import { Response } from 'express';
import { storage } from '../../lib/storage.js';
import { Building, Room, Session, SessionStatus, Class } from '../../lib/types.js';
import { AuthRequest } from '../../lib/middleware.js';
import { successResponse, errorResponse } from '../../lib/utils.js';

/**
 * GET /api/rooms
 * List all buildings and rooms
 */
export async function listRoomsHandler(req: AuthRequest, res: Response) {
  try {
    const buildings = await storage.read<Building>('rooms.json');
    
    return res.json(successResponse(buildings));
  } catch (error: any) {
    console.error('List rooms error:', error);
    return res.status(500).json(
      errorResponse('Lỗi lấy danh sách phòng học: ' + error.message)
    );
  }
}

/**
 * GET /api/rooms/availability
 * Check room availability for a time period
 * Query params: startTime, endTime, excludeSessionId (optional)
 */
export async function checkRoomAvailabilityHandler(req: AuthRequest, res: Response) {
  try {
    const { startTime, endTime, excludeSessionId, equipmentRequirements } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json(errorResponse('startTime và endTime là bắt buộc'));
    }
    
    const sessionStart = new Date(startTime as string);
    const sessionEnd = new Date(endTime as string);
    
    if (sessionStart >= sessionEnd) {
      return res.status(400).json(errorResponse('startTime phải nhỏ hơn endTime'));
    }
    
    // Parse equipment requirements if provided
    let requiredEquipment: string[] = [];
    if (equipmentRequirements) {
      try {
        if (typeof equipmentRequirements === 'string') {
          requiredEquipment = JSON.parse(equipmentRequirements);
        } else if (Array.isArray(equipmentRequirements)) {
          requiredEquipment = equipmentRequirements;
        }
      } catch (e) {
        console.warn('Failed to parse equipmentRequirements:', e);
      }
    }
    
    // Load all buildings and rooms
    const buildings = await storage.read<Building>('rooms.json');
    
    // Load all sessions and classes that have location (offline sessions)
    const allSessions = await storage.read<Session>('sessions.json');
    const allClasses = await storage.read<Class>('classes.json');
    
    // Filter sessions that overlap with the requested time period
    const conflictingSessions = allSessions.filter((session: Session) => {
      // Exclude cancelled and completed sessions
      if (session.status === SessionStatus.CANCELLED || session.status === SessionStatus.COMPLETED) {
        return false;
      }
      
      // Exclude the session being checked (if provided)
      if (excludeSessionId && session.id === excludeSessionId) {
        return false;
      }
      
      // Only check offline sessions with location
      if (session.isOnline || !session.location) {
        return false;
      }
      
      const existingStart = new Date(session.startTime);
      const existingEnd = new Date(session.endTime);
      
      // Check if sessions overlap
      return sessionStart < existingEnd && sessionEnd > existingStart;
    });
    
    // Filter classes that overlap with the requested time period
    // Note: Classes are recurring, so we need to check if the requested date falls on the class day
    const sessionDate = new Date(sessionStart);
    const dayOfWeek = sessionDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const conflictingClasses = allClasses.filter((classItem: Class) => {
      // Only check offline classes with location
      if (classItem.isOnline || !classItem.location) {
        return false;
      }
      
      // Check if class day matches
      if (classItem.day.toLowerCase() !== dayOfWeek) {
        return false;
      }
      
      // Parse class time
      const [classStartHour, classStartMin] = classItem.startTime.split(':').map(Number);
      const [classEndHour, classEndMin] = classItem.endTime.split(':').map(Number);
      
      const classStart = new Date(sessionDate);
      classStart.setHours(classStartHour, classStartMin, 0, 0);
      
      const classEnd = new Date(sessionDate);
      classEnd.setHours(classEndHour, classEndMin, 0, 0);
      
      // Check if class time overlaps with requested time
      return sessionStart < classEnd && sessionEnd > classStart;
    });
    
    // Create a map of busy rooms
    const busyRooms = new Set<string>();
    
    conflictingSessions.forEach((session: Session) => {
      if (session.location) {
        busyRooms.add(session.location);
      }
    });
    
    conflictingClasses.forEach((classItem: Class) => {
      if (classItem.location) {
        busyRooms.add(classItem.location);
      }
    });
    
    // Map equipment names to IDs for matching
    const equipmentNameToId: { [key: string]: string } = {
      'Bảng trắng': 'whiteboard',
      'Máy chiếu': 'projector',
      'Máy tính': 'computer',
      'Hệ thống âm thanh': 'sound_system',
      'Micro': 'microphone',
      'Camera': 'camera'
    };
    
    // Convert equipment requirements from IDs to names for matching
    const requiredEquipmentNames = requiredEquipment.map((eqId: string) => {
      // If it's already a name, return as is
      if (Object.values(equipmentNameToId).includes(eqId)) {
        return Object.keys(equipmentNameToId).find(key => equipmentNameToId[key] === eqId) || eqId;
      }
      // If it's an ID, convert to name
      return Object.keys(equipmentNameToId).find(key => equipmentNameToId[key] === eqId) || eqId;
    });
    
    // Helper function to check if room has all required equipment
    const roomHasRequiredEquipment = (room: Room, required: string[]): boolean => {
      if (required.length === 0) return true; // No requirements = all rooms match
      
      const roomEquipment = room.equipment || [];
      // Check if room has all required equipment
      return required.every((reqEq: string) => {
        // Try to match by name (case-insensitive)
        return roomEquipment.some((roomEq: string) => 
          roomEq.toLowerCase().includes(reqEq.toLowerCase()) || 
          reqEq.toLowerCase().includes(roomEq.toLowerCase())
        );
      });
    };
    
    // Separate rooms into: matching equipment (available), matching equipment (busy), others (available), others (busy)
    let roomsWithMatchingEquipment: Room[] = [];
    let roomsWithoutMatchingEquipment: Room[] = [];
    
    // Enrich buildings with room availability and equipment matching
    const buildingsWithAvailability = buildings.map((building: Building) => ({
      ...building,
      floors: building.floors.map((floor: any) => ({
        ...floor,
        rooms: floor.rooms.map((room: Room) => {
          const roomName = room.name || room.code;
          const isBusy = busyRooms.has(roomName);
          const hasRequiredEquipment = roomHasRequiredEquipment(room, requiredEquipmentNames);
          
          // Find conflicting session/class info
          let conflictingInfo = null;
          if (isBusy) {
            const conflictingSession = conflictingSessions.find((s: Session) => s.location === roomName);
            const conflictingClass = conflictingClasses.find((c: Class) => c.location === roomName);
            
            if (conflictingSession) {
              conflictingInfo = {
                type: 'session',
                id: conflictingSession.id,
                subject: conflictingSession.subject,
                startTime: conflictingSession.startTime,
                endTime: conflictingSession.endTime
              };
            } else if (conflictingClass) {
              conflictingInfo = {
                type: 'class',
                id: conflictingClass.id,
                code: conflictingClass.code,
                subject: conflictingClass.subject,
                startTime: conflictingClass.startTime,
                endTime: conflictingClass.endTime
              };
            }
          }
          
          // Categorize rooms
          if (hasRequiredEquipment) {
            roomsWithMatchingEquipment.push(room);
          } else {
            roomsWithoutMatchingEquipment.push(room);
          }
          
          return {
            ...room,
            isAvailable: !isBusy,
            hasRequiredEquipment,
            conflictingInfo,
            priority: hasRequiredEquipment ? (isBusy ? 2 : 1) : (isBusy ? 4 : 3) // Lower number = higher priority
          };
        })
      }))
    }));
    
    // If we have equipment requirements, prioritize rooms with matching equipment
    // If no rooms match equipment, show all rooms
    const hasMatchingRooms = roomsWithMatchingEquipment.length > 0;
    const shouldFilterByEquipment = requiredEquipmentNames.length > 0 && hasMatchingRooms;
    
    if (shouldFilterByEquipment) {
      // Filter to show only rooms with matching equipment (prioritize available ones)
      buildingsWithAvailability.forEach((building: any) => {
        building.floors.forEach((floor: any) => {
          floor.rooms = floor.rooms.filter((room: any) => room.hasRequiredEquipment);
          // Sort: available first, then by capacity
          floor.rooms.sort((a: any, b: any) => {
            if (a.isAvailable !== b.isAvailable) {
              return a.isAvailable ? -1 : 1;
            }
            return b.capacity - a.capacity;
          });
        });
      });
    } else if (requiredEquipmentNames.length > 0 && !hasMatchingRooms) {
      // No rooms match equipment, show all rooms (but mark them)
      console.log('No rooms match equipment requirements, showing all rooms');
    }
    
    return res.json(successResponse({
      buildings: buildingsWithAvailability,
      requestedTime: {
        startTime: sessionStart.toISOString(),
        endTime: sessionEnd.toISOString()
      },
      equipmentRequirements: requiredEquipmentNames,
      hasMatchingRooms: hasMatchingRooms,
      filterByEquipment: shouldFilterByEquipment
    }));
  } catch (error: any) {
    console.error('Check room availability error:', error);
    return res.status(500).json(
      errorResponse('Lỗi kiểm tra tính khả dụng phòng học: ' + error.message)
    );
  }
}

