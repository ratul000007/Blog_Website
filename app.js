document.addEventListener("DOMContentLoaded", async () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    // Hamburger menu toggle
    hamburger.addEventListener("click", () => {
        const expanded = hamburger.getAttribute("aria-expanded") === "true" || false;
        hamburger.setAttribute("aria-expanded", !expanded);
        navLinks.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
        }
    });

    // Blog posts container (only for index.html or main blog page)
    if (document.getElementById("blog-posts")) {
        const postContainer = document.getElementById("blog-posts");
        const postsPerPage = 5;
        let currentPage = 1;
        let allPosts = []; // Store all fetched posts here

        // Fetch posts from the JSON file
        const fetchPosts = async () => {
            try {
                const response = await fetch("posts.json");
                if (!response.ok) throw new Error("Failed to fetch posts");
                allPosts = await response.json();
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        // Render posts for the current page
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

        // Handle infinite scrolling
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

            if (scrollTop + clientHeight >= scrollHeight - 10) {
                if ((currentPage - 1) * postsPerPage < allPosts.length) {
                    currentPage++;
                    renderPosts(currentPage);
                }
            }
        };

        // Initialize the blog
        const init = async () => {
            await fetchPosts(); // Fetch posts and populate `allPosts`
            renderPosts(currentPage); // Render the first page
            window.addEventListener("scroll", handleScroll); // Add infinite scroll
        };

        // Initialize blog only
        init();
    }

    // Full Post Logic (only for post.html)
    if (document.getElementById("full-post-container")) {
        const fullPostContainer = document.getElementById("full-post-container");

        // Function to load the full post
        const loadFullPost = async () => {
            // Get the post ID from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get("id");

            try {
                // Fetch posts from the JSON file
                const response = await fetch("posts.json");
                if (!response.ok) throw new Error("Failed to fetch posts");

                const posts = await response.json();

                // Find the post based on the postId
                const post = posts.find(p => p.id == postId);

                if (post) {
                    // If the post is found, display the full content
                    fullPostContainer.innerHTML = `
                        <h1>${post.title}</h1>
                        <p><small>By ${post.author} on ${post.date}</small></p>
                        <p>${post.content}</p>
                    `;
                } else {
                    // If post not found
                    fullPostContainer.innerHTML = "<p>Post not found.</p>";
                }
            } catch (error) {
                // Handle errors (e.g., failed fetch)
                fullPostContainer.innerHTML = "<p>Error loading post.</p>";
                console.error(error);
            }
        };

        // Load the post when the page is ready
        loadFullPost();
    }
});
