var express = require("express");
var router = express.Router();
const path = require('path');
let importController = require('../controllers/importUsers');
let { checkLogin, checkRole } = require('../utils/authHandler.js');

// Import users from Excel file
router.post("/import-users", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        // Check if user.xlsx exists in uploads folder
        const uploadDir = path.join(__dirname, '../uploads');
        const filePath = path.join(uploadDir, 'user.xlsx');

        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            return res.status(400).json({
                success: false,
                message: 'File user.xlsx not found in uploads folder'
            });
        }

        // Import users from Excel
        const result = await importController.ImportUsersFromExcel(filePath);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
