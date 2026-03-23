# Hướng Dẫn Import Người Dùng Từ Excel

## Mô Tả Chức Năng

Tính năng này cho phép nhập dữ liệu người dùng từ file Excel (.xlsx) và tự động:
- Tạo tài khoản người dùng trong hệ thống
- Sinh mật khẩu random 16 ký tự cho mỗi người dùng
- Gửi email chứa thông tin đăng nhập cho từng người dùng
- Ghi lại lỗi nếu có vấn đề trong quá trình import

## Kiến Trúc Giải Pháp

### 1. Cấu Trúc File

```
controllers/
  └─ importUsers.js          # Controller xử lý logic import
routes/
  └─ importUsers.js          # Route handler
utils/
  └─ sendMailHandler.js      # (Cập nhật) Xử lý gửi email
scripts/
  └─ createSampleExcel.js    # Script tạo file Excel mẫu
uploads/
  └─ user.xlsx              # File Excel cần import
```

### 2. File Excel Mẫu

**Tên file:** `user.xlsx`  
**Tên sheet:** Bất kỳ (sẽ đọc sheet đầu tiên)  
**Cấu trúc:**

| Username | Email |
|----------|-------|
| john_doe | john.doe@example.com |
| jane_smith | jane.smith@example.com |

**Yêu cầu:**
- Dòng đầu tiên là header (Username, Email)
- Từ dòng 2 trở đi là dữ liệu người dùng
- Username và Email không được để trống
- Email phải là định dạng hợp lệ

## Hướng Dẫn Sử Dụng

### Bước 1: Chuẩn Bị File Excel

#### Cách 1: Tạo file mẫu tự động
```bash
node scripts/createSampleExcel.js
```

Lệnh này sẽ tạo file `uploads/user.xlsx` với dữ liệu mẫu.

#### Cách 2: Tạo file Excel thủ công
1. Mở Excel hoặc Google Sheets
2. Tạo 2 cột: **Username** và **Email**
3. Nhập dữ liệu người dùng, bắt đầu từ dòng 2
4. Lưu file với tên `user.xlsx` vào thư mục `uploads/`

### Bước 2: Cấu Hình Email (Mailtrap)

Cập nhật file `utils/sendMailHandler.js`:

```javascript
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,  // hoặc 25
    secure: false,
    auth: {
        user: "YOUR_MAILTRAP_USER",      // ← Thay bằng user của bạn
        pass: "YOUR_MAILTRAP_PASSWORD",  // ← Thay bằng password của bạn
    },
});
```

Lấy thông tin từ: https://mailtrap.io/

### Bước 3: Gọi API Import

#### Sử dụng Postman hoặc Curl

**POST** endpoint:
```
http://localhost:YOUR_PORT/api/v1/import/import-users
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Yêu cầu:** 
- Người gọi phải là ADMIN (có role ADMIN)
- File `user.xlsx` phải tồn tại trong thư mục `uploads/`

#### Ví dụ Curl:
```bash
curl -X POST http://localhost:3000/api/v1/import/import-users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Bước 4: Phản Hồi API

**Thành công (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "totalRows": 5,
    "importedCount": 5,
    "importedUsers": [
      {
        "username": "john_doe",
        "email": "john.doe@example.com",
        "status": "success"
      },
      {
        "username": "jane_smith",
        "email": "jane.smith@example.com",
        "status": "success"
      }
    ],
    "errors": []
  }
}
```

**Có lỗi (200 với errors):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "totalRows": 5,
    "importedCount": 3,
    "importedUsers": [
      {
        "username": "john_doe",
        "email": "john.doe@example.com",
        "status": "success"
      }
    ],
    "errors": [
      {
        "row": 3,
        "username": "existing_user",
        "message": "User already exists"
      },
      {
        "row": 4,
        "message": "Username or email is missing"
      }
    ]
  }
}
```

**Lỗi (400/500):**
```json
{
  "success": false,
  "message": "File user.xlsx not found in uploads folder"
}
```

## Chi Tiết Implement

### 1. Controller: `importUsers.js`

**Chức năng chính:**

```javascript
ImportUsersFromExcel(filePath)
```

**Quy trình:**
1. ✓ Đọc file Excel từ `filePath`
2. ✓ Lấy role "user" từ database
3. ✓ Duyệt qua từng dòng dữ liệu (bỏ qua header)
4. ✓ Kiểm tra trùng username hoặc email
5. ✓ Tạo mật khẩu ngẫu nhiên 16 ký tự
6. ✓ Lưu người dùng vào database (mật khẩu tự động hash)
7. ✓ Gửi email với credentials
8. ✓ Ghi lại kết quả thành công/lỗi

**Mật khẩu:**
- Độ dài: 16 ký tự
- Bao gồm: Chữ hoa, chữ thường, số, ký tự đặc biệt
- Random mỗi lần

### 2. Email Handler: `sendMailHandler.js`

**Hàm mới:**
```javascript
sendMailPassword(to, username, password)
```

**Nội dung email:**
- HTML template đầy đủ
- Hiển thị username và password
- Nhắc người dùng đổi mật khẩu sau khi đăng nhập

### 3. Route: `importUsers.js`

**Endpoint:**
```
POST /api/v1/import/import-users
```

**Middleware:**
- `checkLogin`: Người dùng phải đã đăng nhập
- `checkRole("ADMIN")`: Chỉ ADMIN mới được import

**Logic:**
- Kiểm tra file `uploads/user.xlsx` tồn tại
- Gọi controller import
- Trả về kết quả

## Xử Lý Lỗi

### Lỗi Có Thể Gặp

1. **File không tồn tại**
   - Lỗi: `File user.xlsx not found in uploads folder`
   - Giải pháp: Kiểm tra file đã được lưu trong `uploads/`

2. **Role "user" không tồn tại**
   - Lỗi: `Role "user" not found in database`
   - Giải pháp: Tạo role "user" trước

3. **Username/Email trùng**
   - Lỗi: `User already exists` (ghi vào errors, tiếp tục)
   - Giải pháp: Kiểm tra dữ liệu Excel

4. **Dữ liệu không hợp lệ**
   - Lỗi: `Username or email is missing` (ghi vào errors)
   - Giải pháp: Kiểm tra dòng trong file Excel

5. **Email không gửi được**
   - Lỗi: `User created but email sending failed` (ghi vào errors)
   - Giải pháp: Kiểm tra cấu hình Mailtrap

## Kiểm Tra Email Trên Mailtrap

1. Đăng nhập vào https://mailtrap.io
2. Vào **Inbox** → **Integrations**
3. Chọn **NodeJS** để lấy credentials
4. Cập nhật `sendMailHandler.js` với user/pass
5. Sau khi import, emails sẽ xuất hiện trong Mailtrap

**Email sẽ chứa:**
- Username
- Mật khẩu tạm thời (16 ký tự)
- Nhắc nhở đổi mật khẩu

## Workflow Hoàn Chỉnh

```
1. Admin chuẩn bị file user.xlsx
   ↓
2. Admin gọi POST /api/v1/import/import-users
   ↓
3. Server đọc file Excel
   ↓
4. Với mỗi user trong file:
   - Tạo mật khẩu random
   - Lưu user vào MongoDB
   - Gửi email credentials
   ↓
5. Admin check email trên Mailtrap
   ↓
6. User nhận email, đăng nhập, đổi mật khẩu
```

## Testing

### Test thủ công

```bash
# 1. Tạo file mẫu
node scripts/createSampleExcel.js

# 2. Khởi động server
npm start

# 3. Gọi API (sử dụng Postman)
POST http://localhost:3000/api/v1/import/import-users
Header: Authorization: Bearer YOUR_ADMIN_TOKEN

# 4. Check Mailtrap inbox
```

### Kết quả mong đợi

- Tất cả users được tạo trong database
- Emails được gửi (0 lỗi hoặc một số lỗi tùy dữ liệu)
- Có thể xem email trong Mailtrap inbox
- Mỗi user nhận email với username/password

## Git Commit

```bash
git add .
git commit -m "feat: Implement user import from Excel with email notification"
git status
```

## Ghi Chú Quan Trọng

1. **Bảo mật:** Mật khẩu được gửi qua email lần đầu, người dùng phải đổi ngay
2. **Charset Excel:** Đảm bảo file Excel lưu với encoding UTF-8 nếu có ký tự Tiếng Việt
3. **Email:** Cần cấu hình Mailtrap/SMTP trước khi import
4. **Database:** Đảm bảo MongoDB đang chạy
5. **Role:** Role "user" phải tồn tại trong database trước khi import

## API Endpoints

| Method | Endpoint | Yêu Cầu | Giải Thích |
|--------|----------|---------|-----------|
| POST | `/api/v1/import/import-users` | ADMIN | Import users từ Excel |

## Files Được Tạo/Cập Nhật

- ✓ `controllers/importUsers.js` - NEW
- ✓ `routes/importUsers.js` - NEW
- ✓ `utils/sendMailHandler.js` - UPDATED
- ✓ `app.js` - UPDATED
- ✓ `scripts/createSampleExcel.js` - NEW
- ✓ `uploads/user.xlsx` - CREATED (sau khi chạy script)

---

**Hỗ trợ:** Kiểm tra logs server để debug lỗi.
