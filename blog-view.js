// Blog view functionality
let currentBlog = null;
let currentCategory = null;
let currentBlogId = null;

// Load blog data from URL parameters
function loadBlogFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const blogId = parseInt(urlParams.get('id'));
    
    if (!category || !blogId) {
        showError('Blog not found');
        return;
    }
    
    currentCategory = category;
    currentBlogId = blogId;
    
    // Load blogs from localStorage
    const savedBlogs = localStorage.getItem('hks-perspective-blogs');
    if (savedBlogs) {
        const blogs = JSON.parse(savedBlogs);
        currentBlog = blogs[category].find(blog => blog.id === blogId);
        
        if (currentBlog) {
    displayBlog();
    loadComments();
        } else {
            showError('Blog not found');
        }
    } else {
        showError('No blogs found');
    }
}

// Display blog content
function displayBlog() {
    if (!currentBlog) return;
    
    document.getElementById('blog-title').textContent = currentBlog.title;
    document.getElementById('blog-date').textContent = `Published: ${currentBlog.date}`;
    document.getElementById('blog-category').textContent = `Category: ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1).replace('-', ' ')}`;
    
    // Display featured image if available
    const blogBody = document.getElementById('blog-body');
    let imageHtml = '';
    if (currentBlog.image) {
        const imageData = getImageData(currentBlog.image);
        if (imageData) {
            imageHtml = `<div class="featured-image" style="text-align: center; margin-bottom: 2rem;">
                <img src="${imageData}" alt="${currentBlog.title}" style="max-width: 100%; max-height: 400px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            </div>`;
        }
    }
    
    // Convert markdown-like content to HTML
    let content = currentBlog.content
        .replace(/^# (.*$)/gim, (match, title) => {
            // Skip the first heading if it matches the blog title to avoid duplication
            if (title.trim() === currentBlog.title) {
                return ''; // Remove the duplicate title
            }
            return `<h1>${title}</h1>`;
        })
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle lists properly - convert bullet points to HTML lists (both - and -- formats)
    content = content.replace(/(^|\n)(\-+ .*?)(?=\n\-+ |\n\n|\n$|$)/gms, function(match, prefix, listItem) {
        const items = listItem.split(/\n-+ /).map(item => 
            item.replace(/^\-+ /, '').trim()
        ).filter(item => item.length > 0);
        
        const listItems = items.map(item => `<li>${item}</li>`).join('');
        return prefix + '<ul>' + listItems + '</ul>';
    });
    
    // Split content into blocks and handle paragraphs vs lists separately
    const blocks = content.split(/\n\n/);
    const processedBlocks = blocks.map(block => {
        if (block.includes('<ul>')) {
            return block; // Don't wrap lists in <p> tags
        } else {
            return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        }
    });
    
    const wrappedContent = processedBlocks.join('');
    
    document.getElementById('blog-body').innerHTML = imageHtml + wrappedContent;
}

// Load comments
function loadComments() {
    const blogKey = `${currentCategory}-${currentBlogId}`;
    const savedComments = localStorage.getItem('hks-perspective-comments');
    const comments = savedComments ? JSON.parse(savedComments) : {};
    
    const commentsList = document.getElementById('comments-list');
    
    if (!comments[blogKey] || comments[blogKey].length === 0) {
        commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentsList.innerHTML = '';
    comments[blogKey].forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        commentDiv.innerHTML = `
            <div class="comment-text">${comment.text}</div>
            <div class="comment-meta">
                <span>By: ${comment.author}</span>
                <span>${comment.date}</span>
                <button class="btn btn-small btn-danger" onclick="deleteComment(${comment.id})" style="margin-left: 10px;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        commentsList.appendChild(commentDiv);
    });
}


// Add comment
function addComment() {
    const commentText = document.getElementById('new-comment').value.trim();
    
    if (!commentText) {
        alert('Please enter a comment!');
        return;
    }
    
    const blogKey = `${currentCategory}-${currentBlogId}`;
    const savedComments = localStorage.getItem('hks-perspective-comments');
    const comments = savedComments ? JSON.parse(savedComments) : {};
    
    if (!comments[blogKey]) {
        comments[blogKey] = [];
    }
    
    const comment = {
        id: Date.now(),
        text: commentText,
        author: 'Anonymous',
        date: new Date().toLocaleDateString()
    };
    
    comments[blogKey].push(comment);
    localStorage.setItem('hks-perspective-comments', JSON.stringify(comments));
    
    document.getElementById('new-comment').value = '';
    loadComments();
}

// Delete comment
function deleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        const blogKey = `${currentCategory}-${currentBlogId}`;
        const savedComments = localStorage.getItem('hks-perspective-comments');
        const comments = savedComments ? JSON.parse(savedComments) : {};
        
        if (comments[blogKey]) {
            comments[blogKey] = comments[blogKey].filter(comment => comment.id !== commentId);
            localStorage.setItem('hks-perspective-comments', JSON.stringify(comments));
            loadComments();
        }
    }
}


// Edit blog
function editBlog() {
    // Redirect to main page with edit parameters
    window.location.href = `index.html?edit=${currentCategory}&id=${currentBlogId}`;
}

// Delete blog
function deleteBlog() {
    if (confirm('Are you sure you want to delete this blog post?')) {
        const savedBlogs = localStorage.getItem('hks-perspective-blogs');
        const blogs = JSON.parse(savedBlogs);
        
        blogs[currentCategory] = blogs[currentCategory].filter(blog => blog.id !== currentBlogId);
        localStorage.setItem('hks-perspective-blogs', JSON.stringify(blogs));
        
        // Delete associated comments and likes
        const blogKey = `${currentCategory}-${currentBlogId}`;
        const savedComments = localStorage.getItem('hks-perspective-comments');
        const savedLikes = localStorage.getItem('hks-perspective-likes');
        
        if (savedComments) {
            const comments = JSON.parse(savedComments);
            delete comments[blogKey];
            localStorage.setItem('hks-perspective-comments', JSON.stringify(comments));
        }
        
        if (savedLikes) {
            const likes = JSON.parse(savedLikes);
            delete likes[blogKey];
            localStorage.setItem('hks-perspective-likes', JSON.stringify(likes));
        }
        
        // Redirect back to main page
        window.location.href = 'index.html';
    }
}

// Show error
function showError(message) {
    document.getElementById('blog-title').textContent = 'Error';
    document.getElementById('blog-body').innerHTML = `<p style="color: #e74c3c;">${message}</p>`;
}

// Theme management (same as main page)
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    function applyTheme(theme) {
        if (theme === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // Update icon
        if (theme === 'light') {
            themeIcon.className = 'fas fa-sun';
        } else if (theme === 'dark') {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-desktop';
        }
    }
    
    function cycleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'system';
        let nextTheme;
        
        if (currentTheme === 'system') {
            nextTheme = 'light';
        } else if (currentTheme === 'light') {
            nextTheme = 'dark';
        } else {
            nextTheme = 'system';
        }
        
        localStorage.setItem('theme', nextTheme);
        applyTheme(nextTheme);
    }
    
    // Apply saved theme
    applyTheme(savedTheme);
    
    // Add click listener
    themeToggle.addEventListener('click', cycleTheme);
}

// Clear localStorage to ensure fresh start
function clearAllData() {
    localStorage.removeItem('blogs');
    localStorage.removeItem('comments');
    localStorage.removeItem('likes');
}

// Get image data from localStorage
function getImageData(filename) {
    const images = JSON.parse(localStorage.getItem('blog-images') || '{}');
    return images[filename] || '';
}

// Load blog when page loads
window.onload = function() {
    // Clear old data to ensure fresh start
    clearAllData();
    
    initTheme();
    loadBlogFromURL();
};
