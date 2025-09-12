# HK's Perspective Blog

A personal technical blog with analytics dashboard.

## Setup Instructions

### 1. Configuration
Copy the example configuration file and set your password:
```bash
cp config.example.js config.js
```

### 2. Edit config.js
Open `config.js` and set your actual password:
```javascript
OWNER_PASSWORD: 'YourSecurePassword123!'
```

### 3. Important Notes
- **`config.js`** is in `.gitignore` and will NOT be committed
- **`config.example.js`** is safe to commit (template file)
- **Never commit** `config.js` with your actual password

## Security Features

- Analytics dashboard with owner-only access
- Multiple authentication methods
- Visitor tracking and live graphs
- Secure password management

## Files Structure

- `index.html` - Main blog page
- `script.js` - Blog functionality and analytics
- `style.css` - Styling
- `config.js` - **PRIVATE** configuration (not committed)
- `config.example.js` - Template configuration (safe to commit)

## Development

1. Clone the repository
2. Copy `config.example.js` to `config.js`
3. Set your password in `config.js`
4. Open `index.html` in your browser

## Production

For production deployment, ensure `config.js` is properly configured with your production password.