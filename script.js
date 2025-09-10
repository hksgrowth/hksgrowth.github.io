// Blog data storage
let blogs = {
    'system-design': [],
    'azure-integration': [],
    'mvp-journey': [],
    'admin': []
};

// Comments storage
let comments = {};

// Load blogs from localStorage on page load
function loadBlogs() {
    const savedBlogs = localStorage.getItem('hks-perspective-blogs');
    if (savedBlogs) {
        blogs = JSON.parse(savedBlogs);
        updateBlogLists();
    }
    
    // Load comments
    const savedComments = localStorage.getItem('hks-perspective-comments');
    if (savedComments) {
        comments = JSON.parse(savedComments);
    }
}

// Save blogs to localStorage
function saveBlogs() {
    localStorage.setItem('hks-perspective-blogs', JSON.stringify(blogs));
}

// Save comments to localStorage
function saveComments() {
    localStorage.setItem('hks-perspective-comments', JSON.stringify(comments));
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
async function saveBlog(category) {
    const title = document.getElementById(category + '-title').value.trim();
    const content = document.getElementById(category + '-content').value.trim();
    const imageInput = document.getElementById(category + '-image');

    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }

    let imageFilename = null;
    
    // Handle image upload if present
    if (imageInput.files && imageInput.files[0]) {
        try {
            const blogId = window.editingBlogId || Date.now();
            imageFilename = await saveImageToStorage(imageInput.files[0], category, blogId);
        } catch (error) {
            alert('Error uploading image: ' + error.message);
            return;
        }
    }

    // Check if we're editing an existing blog
    if (window.editingBlogId && window.editingCategory === category) {
        // Update existing blog
        const blogIndex = blogs[category].findIndex(b => b.id === window.editingBlogId);
        if (blogIndex !== -1) {
            blogs[category][blogIndex].title = title;
            blogs[category][blogIndex].content = content;
            blogs[category][blogIndex].date = new Date().toLocaleDateString();
            if (imageFilename) {
                blogs[category][blogIndex].image = imageFilename;
            }
            saveBlogs();
            updateBlogList(category);
            clearForm(category);
            alert('Blog updated successfully!');
            
            // Clear editing state
            window.editingBlogId = null;
            window.editingCategory = null;
            return;
        }
    }

    // Create new blog
    const blog = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleDateString(),
        category: category
    };

    if (imageFilename) {
        blog.image = imageFilename;
    }

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
    document.getElementById(category + '-image').value = '';
    document.getElementById(category + '-image-preview').innerHTML = '';
    
    // Clear editing state
    window.editingBlogId = null;
    window.editingCategory = null;
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
        const blogId = `${category}-${blog.id}`;
        const commentCount = comments[blogId] ? comments[blogId].length : 0;
        
        const imageHtml = blog.image ? `<div class="blog-image"><img src="${getImageData(blog.image)}" alt="${blog.title}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"></div>` : '';
        
        li.innerHTML = `
            <div class="blog-content">
                ${imageHtml}
                <div class="blog-title">${blog.title}</div>
                <div style="font-size: 0.8rem; color: #a0a0a0;">Created: ${blog.date}</div>
                <div class="blog-stats">
                    <span class="comment-count" onclick="showComments('${category}', ${blog.id})">
                        <i class="fas fa-comment" style="color: #3498db; margin-right: 5px;"></i>
                        ${commentCount}
                    </span>
                </div>
            </div>
            <div class="blog-actions">
                <button class="btn btn-small btn-success" onclick="viewBlog('${category}', ${blog.id})">View</button>
                <button class="btn btn-small btn-primary" onclick="editBlog('${category}', ${blog.id})">Edit</button>
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
    // Open blog in new page
    window.open(`blog-view.html?category=${category}&id=${blogId}`, '_blank');
}

// Delete blog
function deleteBlog(category, blogId) {
    if (confirm('Are you sure you want to delete this blog?')) {
        blogs[category] = blogs[category].filter(b => b.id !== blogId);
        const blogKey = `${category}-${blogId}`;
        delete comments[blogKey];
        saveBlogs();
        saveComments();
        updateBlogList(category);
    }
}

// Edit blog
function editBlog(category, blogId) {
    const blog = blogs[category].find(b => b.id === blogId);
    if (blog) {
        // Store the blog ID being edited
        window.editingBlogId = blogId;
        window.editingCategory = category;
        
        document.getElementById(category + '-title').value = blog.title;
        document.getElementById(category + '-content').value = blog.content;
        
        // Handle image preview if blog has an image
        if (blog.image) {
            const imageData = getImageData(blog.image);
            if (imageData) {
                document.getElementById(category + '-image-preview').innerHTML = '<img src="' + imageData + '" alt="Current image">';
            }
        } else {
            document.getElementById(category + '-image-preview').innerHTML = '';
        }
        
        // Scroll to top of form
        document.querySelector('.blog-editor').scrollIntoView({ behavior: 'smooth' });
    }
}


// Show comments
function showComments(category, blogId) {
    const blogKey = `${category}-${blogId}`;
    const blog = blogs[category].find(b => b.id === blogId);
    
    if (!blog) return;
    
    // Create comment modal
    const modal = document.createElement('div');
    modal.className = 'comment-modal';
    modal.innerHTML = `
        <div class="comment-content">
            <div class="comment-header">
                <h3>Comments for: ${blog.title}</h3>
                <button class="close-btn" onclick="closeCommentModal()">&times;</button>
            </div>
            <div class="comment-list" id="comment-list-${blogKey}"></div>
            <div class="add-comment">
                <textarea id="new-comment-${blogKey}" placeholder="Write your comment..." rows="3"></textarea>
                <button class="btn" onclick="addComment('${category}', ${blogId})">Add Comment</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    loadComments(category, blogId);
}

// Load comments
function loadComments(category, blogId) {
    const blogKey = `${category}-${blogId}`;
    const commentList = document.getElementById(`comment-list-${blogKey}`);
    
    if (!comments[blogKey] || comments[blogKey].length === 0) {
        commentList.innerHTML = '<p style="text-align: center; color: #a0a0a0;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentList.innerHTML = '';
    comments[blogKey].forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        commentDiv.innerHTML = `
            <div class="comment-text">${comment.text}</div>
            <div class="comment-meta">
                <span>By: ${comment.author}</span>
                <span>${comment.date}</span>
            </div>
        `;
        commentList.appendChild(commentDiv);
    });
}

// Add comment
function addComment(category, blogId) {
    const blogKey = `${category}-${blogId}`;
    const commentText = document.getElementById(`new-comment-${blogKey}`).value.trim();
    
    if (!commentText) {
        alert('Please enter a comment!');
        return;
    }
    
    if (!comments[blogKey]) {
        comments[blogKey] = [];
    }
    
    const comment = {
        id: Date.now(),
        text: commentText,
        author: 'Anonymous', // In a real app, you'd get this from user login
        date: new Date().toLocaleDateString()
    };
    
    comments[blogKey].push(comment);
    saveComments();
    loadComments(category, blogId);
    document.getElementById(`new-comment-${blogKey}`).value = '';
    updateBlogList(category);
}

// Close comment modal
function closeCommentModal() {
    const modal = document.querySelector('.comment-modal');
    if (modal) {
        modal.remove();
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

// Theme management
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

// Preview uploaded image
function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '';
    }
}

// Save image to local storage and return filename
function saveImageToStorage(file, category, blogId) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const filename = `${category}-${blogId}-${Date.now()}.${file.name.split('.').pop()}`;
            const imageData = e.target.result;
            
            // Store image data in localStorage
            const images = JSON.parse(localStorage.getItem('blog-images') || '{}');
            images[filename] = imageData;
            localStorage.setItem('blog-images', JSON.stringify(images));
            
            resolve(filename);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Get image data from localStorage
function getImageData(filename) {
    const images = JSON.parse(localStorage.getItem('blog-images') || '{}');
    return images[filename] || '';
}

// Load blogs when page loads
window.onload = function() {
    // Clear old data to ensure fresh start
    clearAllData();
    
    initTheme();
    loadBlogs();
    
    // Clean up duplicate blogs (keep only the first one)
    Object.keys(blogs).forEach(category => {
        if (blogs[category].length > 1) {
            // Keep only the first blog, remove duplicates
            const firstBlog = blogs[category][0];
            blogs[category] = [firstBlog];
            saveBlogs();
        }
    });
    
    // Don't add any sample blogs - start with empty blog list
    
    // Check if we're editing a blog
    const urlParams = new URLSearchParams(window.location.search);
    const editCategory = urlParams.get('edit');
    const editId = parseInt(urlParams.get('id'));
    
    if (editCategory && editId) {
        // Open the appropriate popup and load the blog for editing
        setTimeout(() => {
            openPopup(editCategory);
            const blog = blogs[editCategory].find(b => b.id === editId);
            if (blog) {
                document.getElementById(editCategory + '-title').value = blog.title;
                document.getElementById(editCategory + '-content').value = blog.content;
            }
        }, 100);
    }
};
