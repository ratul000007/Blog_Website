// Import required packages
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());  // To parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files from 'public'

// Nodemailer setup (use credentials from .env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,  // Replace with your email
        pass: process.env.EMAIL_PASSWORD,  // Replace with your email password or app password
    },
});

// Contact Form Route (POST request)
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Email options for sending message
    const mailOptions = {
        from: email,
        to: process.env.EMAIL,  // Your email address
        subject: `Contact Form Submission from ${name}`,
        text: `You have received a message from ${name} (${email}): \n\n${message}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending message.');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Message sent successfully!');
        }
    });
});

// Subscription Route (POST request)
app.post('/subscribe', (req, res) => {
    const { email } = req.body;

    // Subscription email options
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Subscription Confirmation',
        text: `Thank you for subscribing to our newsletter!`,
    };

    // Send subscription email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending subscription email:', error);
            res.status(500).send('Subscription failed.');
        } else {
            console.log('Subscription email sent:', info.response);
            res.status(200).send('Subscription successful!');
        }
    });
});

// Serve your static files (like HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Frontend JavaScript (if applicable in 'public/js/app.js' or inline in HTML)

// Dynamically update the copyright year
const copyrightYear = document.getElementById('copyright-year');
if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}

// Event listener for contact form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
        const response = await fetch('/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, message }),
        });

        if (response.ok) {
            alert('Message sent successfully!');
            e.target.reset();
        } else {
            alert('Failed to send the message.');
        }
    } catch (error) {
        console.error(error);
        alert('Error sending the message.');
    }
});

// Event listener for subscription form
document.getElementById('subscribe-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            alert('Subscription successful!');
            e.target.reset();
        } else {
            alert('Failed to subscribe.');
        }
    } catch (error) {
        console.error(error);
        alert('Error subscribing.');
    }
});

// Blog-related logic for fetching and displaying posts (index.html or main blog page)
if (document.getElementById("blog-posts")) {
    const postContainer = document.getElementById("blog-posts");
    const postsPerPage = 5;
    let currentPage = 1;
    let allPosts = [];

    const fetchPosts = async () => {
        try {
            const response = await fetch("posts.json");
            if (!response.ok) throw new Error("Failed to fetch posts");
            allPosts = await response.json();
        } catch (error) {
            console.error("Error fetching posts:", error);
            postContainer.innerHTML = "<p>Error loading posts.</p>";
        }
    };

    const renderPosts = (page) => {
        const start = (page - 1) * postsPerPage;
        const end = page * postsPerPage;
        const currentPosts = allPosts.slice(start, end);

        currentPosts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("blog-post");
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p><small>By ${post.author} on ${post.date}</small></p>
                <p>${post.content.substring(0, 100)}...</p>
                <a href="post.html?id=${post.id}" class="read-more-btn">Read More</a>
            `;
            postContainer.appendChild(postElement);
        });
    };

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
            if ((currentPage - 1) * postsPerPage < allPosts.length) {
                currentPage++;
                renderPosts(currentPage);
            }
        }
    };

    const init = async () => {
        await fetchPosts();
        renderPosts(currentPage);
        window.addEventListener("scroll", handleScroll);
    };

    init();
}

// Full Post Logic (for post.html)
if (document.getElementById("full-post-container")) {
    const fullPostContainer = document.getElementById("full-post-container");

    const loadFullPost = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get("id");

        try {
            const response = await fetch("posts.json");
            if (!response.ok) throw new Error("Failed to fetch posts");
            const posts = await response.json();
            const post = posts.find(p => p.id == postId);

            if (post) {
                fullPostContainer.innerHTML = `
                    <h1>${post.title}</h1>
                    <p><small>By ${post.author} on ${post.date}</small></p>
                    <p>${post.content}</p>
                `;
            } else {
                fullPostContainer.innerHTML = "<p>Post not found.</p>";
            }
        } catch (error) {
            fullPostContainer.innerHTML = "<p>Error loading post.</p>";
            console.error(error);
        }
    };

    loadFullPost();
}
