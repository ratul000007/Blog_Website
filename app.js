document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        const expanded = hamburger.getAttribute("aria-expanded") === "true" || false;

        hamburger.setAttribute("aria-expanded", !expanded);

        navLinks.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
        if(!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
        }
    });
    
    // Function to fetch posts from the JSON file
    const postContainer = document.getElementById("blog-posts");
    const postsPerPage = 5;
    let currentPage = 1;

    const fetchPosts = async () => {
        try {
            const response = await fetch("posts.json");
            const posts = await response.json();
        }
        catch (error){
            console.error("Error fetching posts:", error);
            
        }
    };

    // Function to render posts
    const renderPosts = (posts, page) => {
        const start = (page -1) * postsPerPage;
        const end = page * postsPerPage;
        const currentPosts =  posts.slice(start, end);

        currentPosts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("blog-post");
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p><small>By ${post.author} on ${post.date}</small></p>
                <p>${post.content.substring(0,100)}...</p>
                <a href="post.html?id=${post.id}" class="read-more-btn">Read More</a>
            `;
            postContainer.appendChild(postElement);
        });
    };

    //Infinite Scrolling
    const handleScroll = async () => {
        const {scrollTop, scrollHeight, clientHeight} = document.documentElement;

        if (scrollTop + clientHeight >= scrollHeight - 10) {
            const posts = await fetchPosts();
            currentPage++;
            if ((currentPage - 1) * postsPerPage < posts.length) {
                renderPosts(posts, currentPage);
            }
        }
    };

    // Initialize
    const init = async () => {
        const posts =  await fetchPosts();
        renderPosts(posts, currentPage);
        window.addEventListener("scroll", handleScroll);    
    };
    
    init();
})


