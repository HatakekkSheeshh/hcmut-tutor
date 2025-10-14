# Hướng dẫn thiết lập Weather API

## Bước 1: Đăng ký tài khoản OpenWeatherMap
1. Truy cập: https://openweathermap.org/api
2. Click "Sign Up" để tạo tài khoản miễn phí
3. Xác thực email

## Bước 2: Lấy API Key
1. Sau khi đăng nhập, vào "My API Keys"
2. Copy API Key (dạng: abc123def456...)
3. Thay thế `your_api_key_here` trong file `TutorDashboard.tsx` dòng 76

## Bước 3: Cập nhật code
```typescript
const API_KEY = 'your_actual_api_key_here' // Thay thế bằng API key thật
```

## Lưu ý:
- API miễn phí cho phép 1000 calls/ngày
- Có thể thay đổi thành phố bằng cách sửa `q=Ho%20Chi%20Minh%20City`
- Nếu không có API key, app sẽ hiển thị dữ liệu mẫu

## Các API thời tiết miễn phí khác:
1. **OpenWeatherMap** (đã sử dụng) - 1000 calls/ngày
2. **WeatherAPI** - 1 triệu calls/tháng
3. **AccuWeather** - 50 calls/ngày
4. **Weatherbit** - 500 calls/ngày
