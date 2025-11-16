// File: lib/notifications.ts

import { storage } from './storage.js'; 
import { Notification, NotificationType } from './types.js'; // Đảm bảo 'Notification' trong types.ts
                                         // khớp với cấu trúc bạn gửi
import { nanoid } from 'nanoid'; 

/**
 * Dữ liệu đầu vào MỚI để tạo thông báo
 */
interface CreateNotificationData {
  userId: string;
  type: NotificationType;   // Ví dụ: 'session_booking', 'new_message', 'evaluation'
  title: string;  // Ví dụ: 'Yêu cầu đặt lịch mới', 'Thông báo về buổi học'
  message: string; // Ví dụ: 'Học sinh X đã gửi yêu cầu...', 'Bạn có buổi học...'
  link?: string;
}

/**
 * Hàm nội bộ (internal function) để tạo một thông báo mới
 * (Đã cập nhật theo cấu trúc MỚI)
 */
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  console.log(`Đang tạo thông báo [${data.type}] cho user ${data.userId}...`);

  try {
    // 1. Tạo đối tượng thông báo mới
    const newNotification: Notification = {
      id: `notif_${nanoid()}`, // Dùng prefix 'notif_' giống như dữ liệu mẫu của bạn
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      read: false,             // Mặc định là chưa đọc
      link: data.link || '#', 
      createdAt: new Date().toISOString(), 
    };

    // 2. Lưu vào "database" (JSON file)
    const created = await storage.create<Notification>('notifications.json', newNotification);
    
    console.log(`Đã tạo thông báo thành công: ${created.id}`);
    return created;

  } 
  catch (error) {
    console.error('Lỗi nghiêm trọng khi tạo thông báo:', error);
    throw new Error('Không thể tạo thông báo');
  }
}