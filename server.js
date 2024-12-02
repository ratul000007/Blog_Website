const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Contact Form Route
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Configure nodemailer transporter using environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Use email from .env file
            pass: process.env.EMAIL_PASSWORD, // Use password from .env file
        },
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAIL, // Use email from .env file
        subject: `Message from ${name}`,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Message sent successfully');
        }
    });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
