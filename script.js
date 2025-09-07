// Blog data storage
let blogs = {
    'system-design': [],
    'azure-integration': [],
    'mvp-journey': [],
    'admin': []
};

// Load blogs from localStorage on page load
function loadBlogs() {
    const savedBlogs = localStorage.getItem('hks-perspective-blogs');
    if (savedBlogs) {
        blogs = JSON.parse(savedBlogs);
        updateBlogLists();
    }
}

// Save blogs to localStorage
function saveBlogs() {
    localStorage.setItem('hks-perspective-blogs', JSON.stringify(blogs));
}

// Open popup
function openPopup(category) {
    const popup = document.getElementById(category + '-popup');
    popup.style.display = 'block';
    popup.classList.add('show');
    updateBlogList(category);
}

// Close popup
function closePopup(category) {
    const popup = document.getElementById(category + '-popup');
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 600);
}

// Save blog
function saveBlog(category) {
    const title = document.getElementById(category + '-title').value.trim();
    const content = document.getElementById(category + '-content').value.trim();

    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }

    const blog = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleDateString(),
        category: category
    };

    blogs[category].push(blog);
    saveBlogs();
    updateBlogList(category);
    clearForm(category);
    alert('Blog saved successfully!');
}

// Clear form
function clearForm(category) {
    document.getElementById(category + '-title').value = '';
    document.getElementById(category + '-content').value = '';
}

// Update blog list for specific category
function updateBlogList(category) {
    const blogList = document.getElementById(category + '-blog-list');
    blogList.innerHTML = '';

    if (blogs[category].length === 0) {
        blogList.innerHTML = '<li style="text-align: center; color: #a0a0a0; padding: 20px;">No blogs yet. Start writing!</li>';
        return;
    }

    blogs[category].forEach(blog => {
        const li = document.createElement('li');
        li.className = 'blog-item';
        li.innerHTML = `
            <div>
                <div class="blog-title">${blog.title}</div>
                <div style="font-size: 0.8rem; color: #a0a0a0;">Created: ${blog.date}</div>
            </div>
            <div class="blog-actions">
                <button class="btn btn-small btn-success" onclick="viewBlog('${category}', ${blog.id})">View</button>
                <button class="btn btn-small btn-danger" onclick="deleteBlog('${category}', ${blog.id})">Delete</button>
            </div>
        `;
        blogList.appendChild(li);
    });
}

// Update all blog lists
function updateBlogLists() {
    Object.keys(blogs).forEach(category => {
        updateBlogList(category);
    });
}

// View blog
function viewBlog(category, blogId) {
    const blog = blogs[category].find(b => b.id === blogId);
    if (blog) {
        document.getElementById(category + '-title').value = blog.title;
        document.getElementById(category + '-content').value = blog.content;
    }
}

// Delete blog
function deleteBlog(category, blogId) {
    if (confirm('Are you sure you want to delete this blog?')) {
        blogs[category] = blogs[category].filter(b => b.id !== blogId);
        saveBlogs();
        updateBlogList(category);
    }
}

// Close popup when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('popup-overlay')) {
        event.target.classList.remove('show');
        setTimeout(() => {
            event.target.style.display = 'none';
        }, 600);
    }
}

// Load blogs when page loads
window.onload = loadBlogs;