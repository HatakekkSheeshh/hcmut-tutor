// File: lib/cron/notificationCron.ts

import { storage } from '../storage.js';
import { NotificationJob } from '../services/notificationQueue.js';
// Đây là hàm của bạn!
import { createNotification } from '../notification.js'; 

const QUEUE_FILE = 'notification_queue.json';

/**
 * Xử lý hàng đợi:
 * 1. Đọc tất cả các job từ file queue
 * 2. Lọc ra các job đã đến giờ xử lý
 * 3. Gọi `createNotification` để tạo thông báo chính thức
 * 4. Xóa các job đã xử lý khỏi file queue
 */
export async function processNotificationQueue() {
  console.log('[Cron] Đang chạy tiến trình xử lý hàng đợi thông báo...');
  
  try {
    const now = new Date();
    const allJobs = await storage.find<NotificationJob>(QUEUE_FILE, () => true);

    const jobsToProcess: NotificationJob[] = [];
    const jobsToKeep: NotificationJob[] = [];

    // 1. Phân loại jobs
    for (const job of allJobs) {
      const processAtTime = new Date(job.processAt);
      if (processAtTime <= now) {
        jobsToProcess.push(job);
      } else {
        jobsToKeep.push(job);
      }
    }

    if (jobsToProcess.length === 0) {
      console.log('[Cron] Không có job nào cần xử lý.');
      return;
    }

    console.log(`[Cron] Phát hiện ${jobsToProcess.length} job cần xử lý...`);

    // 2. Xử lý các job đến hạn
    for (const job of jobsToProcess) {
      try {
        // 3. GỌI HÀM CỦA BẠN (lib/notifications.ts)
        await createNotification(job.data);
        console.log(`[Cron] Đã xử lý thành công job ${job.id}`);
      } catch (error) {
        console.error(`[Cron] Lỗi khi xử lý job ${job.id}:`, error);
        // Quyết định: có thể giữ lại job để thử lại sau, hoặc bỏ qua
      }
    }

    // 4. Cập nhật lại file queue (chỉ giữ lại các job chưa đến hạn)
    await storage.write(QUEUE_FILE, jobsToKeep);
    console.log(`[Cron] Hàng đợi đã được cập nhật. Còn lại ${jobsToKeep.length} job.`);

  } catch (error) {
    console.error('[Cron] Lỗi nghiêm trọng trong tiến trình cron:', error);
  }
}

/**
 * Thiết lập để chạy hàm này mỗi X phút
 * (Phần này sẽ được gọi trong server.ts)
 * @param minutes Số phút
 */
export function setupNotificationCron(minutes: number) {
  console.log(`[Cron] Bật tiến trình xử lý thông báo mỗi ${minutes} phút.`);
  // Chạy lần đầu ngay khi khởi động (để xử lý các job cũ nếu server sập)
  processNotificationQueue();
  
  // Thiết lập chạy định kỳ
  setInterval(processNotificationQueue, minutes * 60 * 1000);
}