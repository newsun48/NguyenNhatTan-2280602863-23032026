let nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "",
        pass: "",
    },
});
module.exports = {
    sendMail: async function (to, url) {
        await transporter.sendMail({
            from: '"admin@" <admin@nnptud.com>',
            to: to,
            subject: "mail reset passwrod",
            text: "lick vo day de doi passs", // Plain-text version of the message
            html: "lick vo <a href=" + url + ">day</a> de doi passs", // HTML version of the message
        });
    },
    sendMailPassword: async function (to, username, password) {
        await transporter.sendMail({
            from: '"admin@" <admin@nnptud.com>',
            to: to,
            subject: "Your Account Credentials - NNPTUD System",
            text: `Hello ${username},\n\nYour account has been created on NNPTUD System.\n\nUsername: ${username}\nPassword: ${password}\n\nPlease log in and change your password.\n\nBest regards,\nAdmin Team`,
            html: `
                <h2>Welcome to NNPTUD System</h2>
                <p>Hello <strong>${username}</strong>,</p>
                <p>Your account has been successfully created.</p>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Username:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${username}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Password:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;"><code>${password}</code></td>
                    </tr>
                </table>
                <p style="margin-top: 20px; color: #d32f2f;"><strong>Please log in and change your password immediately.</strong></p>
                <p>Best regards,<br/>Admin Team</p>
            `,
        });
    }
}