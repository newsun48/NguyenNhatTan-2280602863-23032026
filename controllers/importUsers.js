const ExcelJS = require('exceljs');
const path = require('path');
let userModel = require('../schemas/users');
let roleModel = require('../schemas/roles');
let { sendMailPassword } = require('../utils/sendMailHandler');

// Generate random 16-character password
function generateRandomPassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

module.exports = {
    ImportUsersFromExcel: async function (filePath) {
        try {
            // Get the "user" role
            const userRole = await roleModel.findOne({ name: 'user', isDeleted: false });
            if (!userRole) {
                throw new Error('Role "user" not found in database');
            }

            // Read Excel file
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1);

            if (!worksheet) {
                throw new Error('No worksheet found in Excel file');
            }

            const importedUsers = [];
            const errors = [];
            let rowIndex = 0;

            worksheet.eachRow(async (row, rowNumber) => {
                try {
                    // Skip header row (row 1)
                    if (rowNumber === 1) {
                        return;
                    }

                    rowIndex++;
                    const username = row.getCell(1).value;
                    const email = row.getCell(2).value;

                    // Validate data
                    if (!username || !email) {
                        errors.push({
                            row: rowNumber,
                            message: 'Username or email is missing'
                        });
                        return;
                    }

                    // Check if user already exists
                    const existingUser = await userModel.findOne({
                        $or: [
                            { username: username },
                            { email: email }
                        ]
                    });

                    if (existingUser) {
                        errors.push({
                            row: rowNumber,
                            username: username,
                            message: 'User already exists'
                        });
                        return;
                    }

                    // Generate random password
                    const plainPassword = generateRandomPassword(16);

                    // Create new user (schema pre-save will hash password)
                    const newUser = new userModel({
                        username: username,
                        email: email,
                        password: plainPassword,
                        role: userRole._id,
                        status: false,
                        fullName: '',
                        avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                        loginCount: 0
                    });

                    await newUser.save();

                    // Send email with password
                    try {
                        await sendMailPassword(email, username, plainPassword);
                    } catch (emailError) {
                        console.error(`Email sending failed for ${email}:`, emailError.message);
                        errors.push({
                            row: rowNumber,
                            username: username,
                            message: 'User created but email sending failed'
                        });
                    }

                    importedUsers.push({
                        username: username,
                        email: email,
                        status: 'success'
                    });

                } catch (rowError) {
                    errors.push({
                        row: rowNumber,
                        message: rowError.message
                    });
                }
            });

            return {
                success: true,
                totalRows: rowIndex,
                importedCount: importedUsers.length,
                importedUsers: importedUsers,
                errors: errors
            };

        } catch (error) {
            throw new Error(`Failed to import users: ${error.message}`);
        }
    }
};
