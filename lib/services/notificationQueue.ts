// File: lib/services/notificationQueue.ts

import { storage } from '../storage.js';
import { nanoid } from 'nanoid';
import { NotificationType } from '../types.js';

export type NotificationPayload = Omit<CreateNotificationData, 'userId'>;
/**
 * Đây là dữ liệu thô mà các API routes sẽ gọi
 */
interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Đây là cấu trúc của một "job" trong hàng đợi,
 * nó bao gồm dữ liệu và thời điểm cần xử lý
 */
export interface NotificationJob {
  id: string;
  processAt: string; // Thời điểm xử lý (ISO string)
  data: CreateNotificationData;
}

const QUEUE_FILE = 'notification_queue.json';

/**
 * Thêm một thông báo vào hàng đợi với thời gian trễ
 * @param data Dữ liệu thông báo thô
 * @param delayMinutes Số phút trễ (ví dụ: 5)
 */
export async function addToQueue(data: CreateNotificationData, delayMinutes: number = 5) {
  try {
    // 1. Tính toán thời điểm xử lý
    const now = new Date();
    const processAt = new Date(now.getTime() + delayMinutes * 60 * 1000);

    // 2. Tạo đối tượng "job"
    const newJob: NotificationJob = {
      id: `job_${nanoid()}`,
      processAt: processAt.toISOString(),
      data: data,
    };

    // 3. Lưu job này vào file queue (không phải file notifications.json)
    await storage.create<NotificationJob>(QUEUE_FILE, newJob);

    console.log(`[Queue] Đã thêm job ${newJob.id} vào hàng đợi, xử lý lúc ${newJob.processAt}`);
    
  } catch (error) {
    console.error('[Queue] Lỗi nghiêm trọng khi thêm vào hàng đợi:', error);
  }
}


/**
 * Hàm "tiết kiệm sức" để gửi thông báo cho 1 hoặc NHIỀU người.
 * (Các API routes của bạn sẽ gọi hàm này)
 * @param target - Một userId (dạng string) HOẶC một mảng [userId, userId, ...]
 * @param payload - Nội dung thông báo (title, message, link, type)
 * @param delayMinutes - Thời gian trễ (mặc định 5 phút)
 */
export async function queueNotification(
  target: string | string[],
  payload: NotificationPayload,
  delayMinutes: number = 5
) {
  const userIds = Array.isArray(target) ? target : [target];

  if (userIds.length === 0) {
    return;
  }

  console.log(`[QueueService] Đang xếp hàng ${userIds.length} thông báo...`);

  try {
    const queuePromises = userIds.map((userId) => {
      // Ghép userId vào payload
      const fullData: CreateNotificationData = {
        ...payload,
        userId: userId,
      };
      
      // Gọi hàm addToQueue gốc (ở trên)
      return addToQueue(fullData, delayMinutes);
    });

    await Promise.all(queuePromises);
    
  } catch (error) {
    console.error('[QueueService] Lỗi khi thêm nhiều thông báo:', error);
  }
}