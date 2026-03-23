const ExcelJS = require('exceljs');
const path = require('path');

// Create a new workbook
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Users');

// Add header row with styling
worksheet.columns = [
    { header: 'Username', key: 'username', width: 15 },
    { header: 'Email', key: 'email', width: 25 }
];

const headerRow = worksheet.getRow(1);
headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0070C0' }
};
headerRow.alignment = { horizontal: 'center', vertical: 'center' };

// Add sample data
worksheet.addRows([
    { username: 'john_doe', email: 'john.doe@example.com' },
    { username: 'jane_smith', email: 'jane.smith@example.com' },
    { username: 'bob_wilson', email: 'bob.wilson@example.com' },
    { username: 'alice_brown', email: 'alice.brown@example.com' },
    { username: 'charlie_davis', email: 'charlie.davis@example.com' }
]);

// Save to file
const uploadDir = path.join(__dirname, '../uploads');
const filePath = path.join(uploadDir, 'user.xlsx');

workbook.xlsx.writeFile(filePath).then(() => {
    console.log('Sample user.xlsx file created at:', filePath);
}).catch(err => {
    console.error('Error creating Excel file:', err);
});
