## ✅ SETUP & VERIFICATION CHECKLIST

### 🎯 Implementation Complete

Your user import from Excel feature has been successfully implemented!

---

## 📦 WHAT WAS CREATED

### ✨ New Files Created:

1. **`controllers/importUsers.js`** - Main import logic
   - Reads Excel file
   - Validates data
   - Creates users with random passwords
   - Sends emails

2. **`routes/importUsers.js`** - API endpoint
   - Route: `POST /api/v1/import/import-users`
   - Middleware: checkLogin, checkRole(ADMIN)
   - Request validation

3. **`scripts/createSampleExcel.js`** - Sample data generator
   - Creates `uploads/user.xlsx`
   - 5 sample users with headers
   - Ready to test

4. **`uploads/user.xlsx`** - Sample Excel file
   - Columns: Username, Email
   - 5 test users included

5. **`IMPORT_USERS_GUIDE.md`** - Detailed Vietnamese documentation
   - Full implementation explanation
   - Step-by-step instructions
   - API documentation
   - Email setup guide

6. **`IMPLEMENTATION_SUMMARY.md`** - Technical summary
   - Architecture overview
   - File descriptions
   - Process flow diagram
   - Testing guide

7. **`QUICK_START.sh`** - Quick reference
   - One-page setup instructions
   - Quick commands
   - Troubleshooting tips

---

## 📝 FILES MODIFIED

### Updated:

1. **`utils/sendMailHandler.js`**
   - Added `sendMailPassword(to, username, password)` function
   - Beautiful HTML email template
   - Includes credentials and reminder

2. **`app.js`**
   - Added route: `app.use('/api/v1/import', require('./routes/importUsers'))`

---

## 🔧 SETUP REQUIREMENTS

### Prerequisites ✓

```
✓ Node.js & npm (already installed)
✓ MongoDB (must be running on localhost:27017)
✓ Express.js (already in package.json)
✓ exceljs (already in package.json)
✓ nodemailer (already in package.json)
✓ bcrypt (already in package.json)
```

### Setup Steps

#### Step 1: Configure Mailtrap Email

Edit `utils/sendMailHandler.js`:

```javascript
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,  // or 25, 465, 587
    secure: false,
    auth: {
        user: "YOUR_MAILTRAP_USERNAME",    // ← GET FROM MAILTRAP
        pass: "YOUR_MAILTRAP_PASSWORD",    // ← GET FROM MAILTRAP
    },
});
```

**How to get Mailtrap credentials:**
1. Go to https://mailtrap.io
2. Sign up (free account)
3. Create a new Inbox or use default
4. Click "Integrations" → "NodeJS"
5. Copy the username and password

#### Step 2: Create "user" Role (if not exists)

MongoDB command:
```javascript
db.roles.insertOne({ name: "user", description: "Normal user role" })
```

Or via API:
```bash
POST /api/v1/roles
Body: { "name": "user", "description": "Normal user role" }
```

#### Step 3: Ensure MongoDB is Running

```bash
# For Windows with MongoDB service
net start MongoDB

# Or manual start
mongod
```

---

## 🚀 USAGE GUIDE

### ① Prepare Excel File

**Option A: Use Sample File (Quick)**
```bash
node scripts/createSampleExcel.js
```
This creates `uploads/user.xlsx` with 5 sample users.

**Option B: Use Your Own Data**
Create/place your Excel file at `uploads/user.xlsx` with:
- Column A: Username
- Column B: Email
- Start data from row 2 (row 1 = headers)

### ② Start the Server

```bash
npm start
```

Output should show:
```
connected  # MongoDB connected
```

### ③ Call the Import API

**Using Postman:**

1. Set Method: **POST**
2. Set URL: `http://localhost:3000/api/v1/import/import-users`
3. Go to **Headers** tab:
   - Key: `Authorization`
   - Value: `Bearer YOUR_ADMIN_JWT_TOKEN`
   - Key: `Content-Type`
   - Value: `application/json`
4. Click **Send**

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/import/import-users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Using Node.js/Axios:**
```javascript
const axios = require('axios');

axios.post('http://localhost:3000/api/v1/import/import-users', {}, {
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  }
})
.then(res => console.log(res.data))
.catch(err => console.error(err.response.data));
```

### ④ Check Results

**In Database:**
```bash
# MongoDB command
db.users.find({})
```

Should show newly created users.

**In Mailtrap:**

1. Go to https://mailtrap.io
2. Click on your Inbox
3. You should see emails for each user
4. Click email to view content

Example email shows:
```
Hello john_doe,

Your account has been created on NNPTUD System.

Username: john_doe
Password: RandomString16Char!

Please log in and change your password.
```

---

## 📊 API RESPONSE FORMAT

### Success Response

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

### With Errors Response

```json
{
  "success": true,
  "data": {
    "success": true,
    "totalRows": 6,
    "importedCount": 4,
    "importedUsers": [...],
    "errors": [
      {
        "row": 3,
        "username": "duplicate_user",
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

---

## 🔒 SECURITY FEATURES

✅ **Authentication Required**
- Must be logged in with ADMIN role
- Uses JWT Bearer token

✅ **Password Security**
- 16 random characters
- Mix of letters, numbers, symbols
- Hashed with bcrypt (10 salt rounds)
- Never stored in plain text

✅ **Email Validation**
- Email format checked
- Unique email constraint
- Case-insensitive stored

✅ **Duplicate Prevention**
- Username must be unique
- Email must be unique
- Checked before creation

---

## 🐛 TROUBLESHOOTING

### Problem: "File user.xlsx not found"

**Solution:**
```bash
node scripts/createSampleExcel.js
```

### Problem: "Role 'user' not found in database"

**Solution: Create the role**

MongoDB:
```javascript
db.roles.insertOne({ 
  name: "user", 
  description: "Normal user role",
  isDeleted: false 
})
```

Or via API with ADMIN token:
```bash
POST /api/v1/roles
{
  "name": "user",
  "description": "Normal user role"
}
```

### Problem: "User already exists"

**Solution:** Edit the Excel file to use different username/email

### Problem: "Unauthorized (401)"

**Solution:** Check your token
- Token must be from an ADMIN user
- Token might be expired
- Use correct Authorization header format

### Problem: "Emails not showing in Mailtrap"

**Solution:** Check credentials in `utils/sendMailHandler.js`

```bash
# Verify Mailtrap credentials
cat utils/sendMailHandler.js | grep -A 5 "auth:"
```

Should show:
```javascript
auth: {
    user: "xxxxx",   // NOT empty
    pass: "xxxxx",   // NOT empty
}
```

### Problem: MongoDB Connection Error

**Solution:** Start MongoDB
```bash
# Windows
net start MongoDB

# Linux/Mac
mongod
```

Or check connection string in `app.js`:
```javascript
mongoose.connect('mongodb://localhost:27017/NNPTUD-C2');
```

---

## 📈 EXPECTED WORKFLOW

```
┌─────────────────────────────────────┐
│ 1. Prepare Excel File               │
│    uploads/user.xlsx                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Start Server                     │
│    npm start                        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Call API                         │
│    POST /api/v1/import/import-users │
│    Header: Authorization: Bearer... │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Server Processing                │
│    ✓ Read Excel                     │
│    ✓ Validate data                  │
│    ✓ Generate passwords             │
│    ✓ Create users in DB             │
│    ✓ Send emails                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Check Results                    │
│    ✓ MongoDB: users created         │
│    ✓ Mailtrap: emails received      │
│    ✓ Users can login with new pwd   │
└─────────────────────────────────────┘
```

---

## 📚 DOCUMENTATION

| Document | Purpose | Language |
|----------|---------|----------|
| `IMPORT_USERS_GUIDE.md` | Full detailed guide | Vietnamese |
| `IMPLEMENTATION_SUMMARY.md` | Technical summary | English/Vietnamese |
| `QUICK_START.sh` | Quick reference | English |
| `SETUP_VERIFICATION.md` | This file | English |

---

## ✅ VERIFICATION CHECKLIST

Before running the import, make sure:

- [ ] Mailtrap account created and credentials copied
- [ ] `utils/sendMailHandler.js` updated with Mailtrap credentials
- [ ] MongoDB is running
- [ ] "user" role exists in database
- [ ] `uploads/user.xlsx` file exists
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Server is running (`npm start`)
- [ ] Admin JWT token available (for Authorization header)

---

## 🎬 QUICK START (5 MINUTES)

```bash
# 1. Create sample Excel
node scripts/createSampleExcel.js

# 2. Update Mailtrap credentials in utils/sendMailHandler.js
# (Open the file and paste your Mailtrap user and password)

# 3. Start server
npm start

# 4. In another terminal, test the API
# Replace YOUR_ADMIN_TOKEN with actual token
curl -X POST http://localhost:3000/api/v1/import/import-users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 5. Check Mailtrap inbox
# Open https://mailtrap.io and view incoming emails
```

---

## 🔍 HOW TO GET ADMIN TOKEN

### Option 1: Use Login API

```bash
POST /api/v1/auth/login
{
  "username": "admin_user",
  "password": "admin_password"
}
```

Response will include token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Option 2: Use Postman

1. Set up in Postman
2. Use GET request to your login endpoint
3. Copy the token from response
4. Paste in Authorization header

---

## 📞 SUPPORT

If you encounter issues:

1. Check the **IMPORT_USERS_GUIDE.md** for detailed solutions
2. Review server logs for error messages
3. Verify Mailtrap credentials and connection
4. Check mongoDB is running
5. Ensure user has ADMIN role

---

## 🏁 NEXT STEPS

After successful testing:

1. Update Excel file with real user data
2. Run import again with production data
3. Verify all users in database
4. Verify all emails sent successfully
5. Share credentials with users securely

---

**Status:** ✅ Ready for Testing  
**Version:** 1.0  
**Last Updated:** 2026-03-23

