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
    } else {
        // Initialize with the Azure Conditional Access blog post
        blogs = {
            'system-design': [],
            'azure-integration': [
                {
                    id: Date.now(),
                    title: "Extending M365 Security: How Azure Conditional Access Protects Your Entire Cloud Infrastructure",
                    content: `# Extending M365 Security: How Azure Conditional Access Protects Your Entire Cloud Infrastructure

In my previous post on [M365 Security Best Practices](), we explored the foundational security measures that protect your Microsoft 365 environment. Today, we're taking that security foundation and extending it across your entire cloud infrastructure using Azure Conditional Access—the unified security gatekeeper that brings Zero Trust principles to both M365 and Azure services.

## The Problem: Fragmented Cloud Security

Modern organizations face a critical challenge: as they adopt cloud services, their security posture often becomes fragmented. You might have robust M365 security policies, but what about your Azure VMs, storage accounts, or web applications? Traditional perimeter-based security models fall short in a world where users access resources from anywhere, on any device.

**The reality:** A single compromised credential can provide access to your entire cloud estate if not properly protected.

## What is Azure Conditional Access?

Azure Conditional Access is Microsoft's cloud-based access control solution that uses IF-THEN statements to enforce security policies. Think of it as a smart security guard that evaluates every access request based on:

- **Who** is trying to access (user identity)
- **What** they're trying to access (cloud app or resource)
- **Where** they're accessing from (location)
- **When** they're accessing (time-based policies)
- **How** they're accessing (device compliance, risk level)

## The Power of Conditional Access: Beyond M365

While Conditional Access policies can protect M365 services, their true power lies in extending security across your entire Azure ecosystem:

### Protecting Azure Resources
- **Virtual Machines:** Require MFA for RDP/SSH access to production VMs
- **Storage Accounts:** Block access from untrusted locations to sensitive data
- **Web Applications:** Enforce device compliance for internal applications
- **Azure SQL Databases:** Require hybrid Azure AD join for database access

### Real-World Scenarios

**Scenario 1: Production VM Access**
\`\`\`
IF user is accessing Azure VM
AND location is not "Trusted Corporate Network"
THEN require MFA + device compliance
\`\`\`

**Scenario 2: Sensitive Data Protection**
\`\`\`
IF user is accessing Storage Account with "confidential" tag
AND device is not compliant
THEN block access
\`\`\`

## Essential Conditional Access Policies for Unified Security

### 1. Require MFA for All Users (High-Risk Scenarios)
**Policy Name:** "Require MFA for High-Risk Sign-ins"
- **Users:** All users
- **Cloud Apps:** All cloud apps
- **Conditions:** Sign-in risk = Medium or High
- **Access Controls:** Require MFA

### 2. Block Legacy Authentication
**Policy Name:** "Block Legacy Auth Protocols"
- **Users:** All users
- **Cloud Apps:** All cloud apps
- **Client Apps:** Exchange ActiveSync, Other clients
- **Access Controls:** Block

### 3. Require Device Compliance
**Policy Name:** "Require Compliant Devices for Azure Resources"
- **Users:** All users
- **Cloud Apps:** Azure services (VMs, Storage, etc.)
- **Device State:** Require device to be marked as compliant
- **Access Controls:** Grant access

### 4. Location-Based Policies
**Policy Name:** "Block Access from Untrusted Locations"
- **Users:** All users
- **Cloud Apps:** All cloud apps
- **Locations:** Exclude trusted locations
- **Access Controls:** Block

### 5. High-Risk User Protection
**Policy Name:** "High-Risk Users - Require MFA"
- **Users:** High-risk users (from Identity Protection)
- **Cloud Apps:** All cloud apps
- **Access Controls:** Require MFA

## Implementation Best Practices

### Start with Report-Only Mode
Always test your policies in report-only mode first. This allows you to:
- Monitor policy impact without affecting users
- Identify potential issues before enforcement
- Gather data on policy effectiveness

### Emergency Access Accounts
Create at least two emergency access accounts that are:
- Excluded from all Conditional Access policies
- Used only for emergency scenarios
- Monitored and audited regularly

### Naming Conventions
Use clear, descriptive names for your policies:
- \`CA-001-Require-MFA-High-Risk-Users\`
- \`CA-002-Block-Legacy-Authentication\`
- \`CA-003-Require-Compliant-Devices-Azure\`

### Policy Hierarchy
Organize policies by priority:
1. **Block policies** (highest priority)
2. **High-risk user policies**
3. **Location-based policies**
4. **Device compliance policies**
5. **MFA requirements**

## Common Challenges and Solutions

### Challenge 1: User Experience Impact
**Problem:** Users complain about frequent MFA prompts
**Solution:** 
- Use trusted locations for corporate networks
- Implement risk-based policies instead of blanket MFA
- Communicate changes clearly to users

### Challenge 2: Troubleshooting Access Issues
**Problem:** Users can't access resources after policy changes
**Solution:**
- Use the Conditional Access insights workbook
- Check the sign-in logs for policy evaluation details
- Test with report-only mode first

### Challenge 3: Policy Complexity
**Problem:** Too many policies creating conflicts
**Solution:**
- Start with 3-5 essential policies
- Use groups to target specific user sets
- Regularly review and consolidate policies

## Quick Wins: Policies You Can Implement Today

### 1. Block Legacy Authentication (5 minutes)
This single policy can prevent 99% of password spray attacks.

### 2. Require MFA for Admins (10 minutes)
Protect your most privileged accounts immediately.

### 3. Block Access from High-Risk Countries (15 minutes)
If you don't have international users, block access from countries you don't operate in.

## Monitoring and Maintenance

### Regular Reviews
- **Monthly:** Review policy effectiveness and user impact
- **Quarterly:** Audit emergency access accounts
- **Annually:** Complete policy review and optimization

### Key Metrics to Track
- Policy hit rates
- User experience impact
- Security incidents prevented
- False positive rates

## The Zero Trust Advantage

Conditional Access is the cornerstone of a Zero Trust security model because it:

1. **Never Trusts, Always Verifies:** Every access request is evaluated
2. **Assumes Breach:** Policies protect against compromised credentials
3. **Uses Least Privilege:** Users only get access they need, when they need it
4. **Provides Visibility:** Complete audit trail of all access decisions

## Conclusion

Azure Conditional Access transforms your security posture from reactive to proactive. By extending the security principles we established in M365 across your entire Azure infrastructure, you create a unified, intelligent security layer that adapts to threats and protects your most valuable assets.

The journey from fragmented security to unified protection starts with a single policy. Begin with blocking legacy authentication, then gradually build your policy framework. Remember: security is not a destination, but a continuous journey of improvement.

## What's Next?

In our next post, we'll dive deeper into Azure Identity Protection and how it works with Conditional Access to provide intelligent, risk-based security decisions. We'll also explore advanced scenarios like protecting hybrid environments and implementing just-in-time access.

---

**Have you implemented Conditional Access policies in your environment? What challenges have you faced, and what successes can you share? Let me know in the comments below!**

*Ready to take your cloud security to the next level? Start with one policy today and build from there. Your future self (and your security team) will thank you.*`,
                    date: new Date().toLocaleDateString(),
                    category: 'azure-integration'
                }
            ],
            'mvp-journey': [],
            'admin': []
        };
        saveBlogs();
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
    
    // Handle image upload if present and image input exists
    if (imageInput && imageInput.files && imageInput.files[0]) {
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
    
    // Clear image input and preview if they exist
    const imageInput = document.getElementById(category + '-image');
    const imagePreview = document.getElementById(category + '-image-preview');
    
    if (imageInput) {
        imageInput.value = '';
    }
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
    
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
    localStorage.removeItem('hks-perspective-blogs');
    localStorage.removeItem('hks-perspective-comments');
    localStorage.removeItem('blog-images');
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
    
    // Clean up duplicate blogs (keep only the first one) - but only if there are actual duplicates
    Object.keys(blogs).forEach(category => {
        if (blogs[category].length > 1) {
            // Check if there are actual duplicates (same title)
            const uniqueBlogs = [];
            const seenTitles = new Set();
            
            blogs[category].forEach(blog => {
                if (!seenTitles.has(blog.title)) {
                    seenTitles.add(blog.title);
                    uniqueBlogs.push(blog);
                }
            });
            
            blogs[category] = uniqueBlogs;
            saveBlogs();
        }
    });
    
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
