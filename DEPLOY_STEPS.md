# 🚀 Hướng dẫn Deploy lên Vercel - Step by Step

## Bước 1: Tạo Blob Storage ✅ (Hoàn thành)
- Đã tạo blob store: `tutor-system-data`

## Bước 2: Lấy Blob Token

Trên trang Blob store của bạn:

1. Tìm button **"Connect Project"** hoặc **"Settings"**
2. Tìm mục **"Blob Read/Write Token"**
3. Click vào để hiển thị token
4. **Copy token** (bắt đầu bằng `vercel_blob_rw_...`)

> ⚠️ **Quan trọng:** Đừng để lộ token này, giống như password!

## Bước 3: Tạo Vercel Project

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Chọn repository GitHub của bạn
4. Cấu hình:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (để trống hoặc gõ `.`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**

> Đợi deploy xong (có thể lỗi lần đầu, bình thường)

## Bước 4: Thêm Environment Variables

1. Vào project vừa tạo trên Vercel
2. Click tab **"Settings"**
3. Click **"Environment Variables"** ở sidebar
4. Thêm từng biến sau (click **"Add New"** cho mỗi biến):

### Biến 1: JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:** `tutor-support-system-secret-key-2025-production`
- Chọn: ✅ **Production** (và Preview/Development nếu muốn)

### Biến 2: BLOB_READ_WRITE_TOKEN
- **Name:** `BLOB_READ_WRITE_TOKEN`
- **Value:** `<paste-token-từ-bước-2>`
- Chọn: ✅ **Production** (và Preview/Development nếu muốn)

### Biến 3: NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`
- Chọn: ✅ **Production** (chỉ Production)

### Biến 4: FRONTEND_URL (Optional - Vercel tự set)
- Không cần set, Vercel tự động

## Bước 5: Redeploy Project

1. Vào tab **"Deployments"**
2. Find deployment gần nhất
3. Click **"..."** (3 dots) → **"Redeploy"**
4. Đợi deploy xong

## Bước 6: Upload Initial Data

Sau khi deploy xong, cần upload dữ liệu ban đầu:

### Option A: Upload thủ công (Dễ nhất)

1. Vào Vercel Dashboard → **Storage** → **Blob** → **tutor-system-data**
2. Click **"Browser"** tab
3. Click button **"Upload"**
4. Upload các file JSON từ thư mục `data/` (tất cả 21 files):
   ```
   ✅ users.json
   ✅ sessions.json
   ✅ classes.json
   ✅ enrollments.json
   ✅ quizzes.json
   ✅ quiz-submissions.json
   ✅ assignments.json
   ✅ assignment-submissions.json
   ✅ grades.json
   ✅ analytics.json
   ✅ approvals.json
   ✅ availability.json
   ✅ conversations.json
   ✅ course-contents.json
   ✅ evaluations.json
   ✅ forum-comments.json
   ✅ forum-posts.json
   ✅ library.json
   ✅ messages.json
   ✅ notifications.json
   ✅ progress.json
   ```

### Option B: Dùng Vercel CLI (Nâng cao)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd "C:\Users\LG\Desktop\Study Material\SE\UI_Design\v1"
vercel link

# Pull environment variables
vercel env pull .env.local

# Seed data
npm run seed
```

## Bước 7: Test Website

1. Vào URL: `https://your-project.vercel.app`
2. Test login:
   - Email: `student1@example.com`
   - Password: `password123`
3. Nếu login thành công → **Done!** 🎉

## Troubleshooting

### Lỗi: "Cannot read property 'data' of undefined"
- **Giải pháp:** Data chưa upload, upload các file JSON vào Blob

### Lỗi: "Authentication failed"
- **Giải pháp:** Check `BLOB_READ_WRITE_TOKEN` đã set đúng chưa

### Lỗi: "Cannot connect to database"
- **Giải pháp:** Check `NODE_ENV=production` đã set

### Website load nhưng không có data
- **Giải pháp:** Upload data files vào Blob storage (Bước 6)

## Next Steps

- Test các features: Login, View Sessions, Create Quiz, etc.
- Monitor qua Vercel dashboard
- Setup custom domain (nếu muốn)

