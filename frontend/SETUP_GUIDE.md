# Frontend Setup Guide

This guide provides step-by-step instructions for setting up and running the Chat App frontend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Building for Production](#building-for-production)
6. [Deployment Options](#deployment-options)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js**: v18.0.0 or higher
  ```bash
  node --version  # Should be v18+
  ```
- **npm**: v9.0.0 or higher (comes with Node.js)
  ```bash
  npm --version
  ```

### Optional but Recommended
- **Git**: For version control
- **VS Code**: Recommended code editor
  - Extensions: ES7+ React/Redux/React-Native snippets, Tailwind CSS IntelliSense
- **Chrome DevTools**: For debugging

### Backend Requirements
- Backend server must be running on `http://localhost:3000` (or configured URL)
- Ensure CORS is properly configured on backend

## Installation

### Step 1: Navigate to Frontend Directory

```bash
cd Chat-app/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
```
next@16.0.7
react@19.2.0
react-dom@19.2.0
socket.io-client@^4.7.2
tailwindcss@^4
postcss@^8
```

**Installation time**: ~2-5 minutes depending on internet speed

### Step 3: Verify Installation

```bash
npm list
```

Should show all dependencies installed successfully.

## Configuration

### Step 1: Create Environment File

Create `.env.local` in the root directory:

```bash
# Linux/Mac
touch .env.local

# Windows (PowerShell)
New-Item -Path .env.local -ItemType File
```

### Step 2: Configure Environment Variables

Add to `.env.local`:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Enable debug mode
# NEXT_DEBUG=true
```

### Step 3: Verify Configuration

```bash
# Check if .env.local exists
cat .env.local  # Linux/Mac
type .env.local # Windows
```

Output should show:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

Output:
```
> frontend@0.1.0 dev
> next dev

  ▲ Next.js 16.0.7
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.1s
```

Open browser and navigate to: `http://localhost:3000`

### Features in Development Mode
- ✅ Hot Module Replacement (HMR)
- ✅ Fast Refresh
- ✅ Source maps for debugging
- ✅ Automatic file watching

### First-Time Setup Checklist

After starting the dev server:

1. **Check Backend Connection**
   - Open browser console (F12)
   - Should NOT see connection errors
   - Message: "Connected to server" should appear

2. **Test Authentication**
   - Enter email and name
   - Click "Send OTP"
   - Check email for OTP
   - Enter OTP and verify

3. **Test Chat Features**
   - Send a test message
   - Open in another browser tab to test real-time
   - Try typing indicator
   - Check message count progress

## Building for Production

### Step 1: Build the Application

```bash
npm run build
```

This will:
- Compile Next.js application
- Optimize assets
- Generate production bundle
- Output to `.next/` folder

Output example:
```
> frontend@0.1.0 build
> next build

  ▲ Next.js 16.0.7
  
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (3/3)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
─ ○ /                                    0 B            73 kB
✓ Next.js build complete

```

### Step 2: Start Production Server

```bash
npm start
```

This will:
- Start Next.js production server
- Use optimized build from `.next/`
- Output: `> ready started server on 0.0.0.0:3000`

### Performance Metrics

After building, you'll see optimized metrics:
- First Load JS: ~73 kB (gzipped)
- Page Size: Minimal
- Bundle Size: Optimized

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the creator of Next.js and provides seamless deployment.

#### Prerequisites
- Vercel account (free): https://vercel.com/signup
- Git repository (GitHub, GitLab, or Bitbucket)

#### Steps

1. **Push code to Git**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
```bash
npm i -g vercel
vercel
```

3. **Follow Promcel wizard**
- Link to Git project
- Configure build settings (auto-detected)
- Set environment variables:
  - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`

4. **Deploy**
```bash
vercel --prod
```

Your app is live at: `https://your-project.vercel.app`

#### Environment Variables in Vercel

1. Go to Vercel Project Settings
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_API_URL`
4. Set value: `https://your-backend-domain.com`
5. Redeploy project

### Option 2: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t chat-app-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:3000 chat-app-frontend
```

### Option 3: Traditional VPS

#### Setup (Ubuntu/Debian)

```bash
# SSH into server
ssh user@your-vps.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/chat-app.git
cd chat-app/frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.local

# Build
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start with PM2
pm2 start npm --name "chat-frontend" -- start

# Make PM2 auto-start on boot
pm2 startup
pm2 save
```

#### Setup Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

### Option 4: AWS (Amplify)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Linux/Mac

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### 2. Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Cannot Connect to Backend

**Symptoms**: "Connection failed" in browser console

**Solutions**:
```bash
# 1. Check backend is running
curl http://localhost:3000/health

# 2. Verify environment variable
cat .env.local

# 3. Check CORS settings on backend
# Backend .env should have:
# ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# 4. Restart frontend
npm run dev
```

#### 4. OTP Not Sending

**Check**:
1. Backend logs for email errors
2. Resend API key is valid
3. FROM_EMAIL is verified in Resend dashboard
4. Network request succeeds (DevTools > Network)

#### 5. Socket.IO Connection Timeout

```javascript
// In ChatScreen.js, increase timeout:
const socket = io(API_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10, // Increase from 5
});
```

#### 6. Build Fails

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# If still fails, check for errors
npm run build -- --debug
```

#### 7. Blank Page on Load

**Check**:
1. Browser console for errors (F12)
2. Network tab for failed requests
3. Backend connection (look for socket ID in console)

```javascript
// Add to page.js for debugging:
useEffect(() => {
  console.log('Session:', sessionData);
  console.log('Authenticated:', isAuthenticated);
}, [sessionData, isAuthenticated]);
```

## Development Workflow

### Daily Development

```bash
# 1. Start backend (in separate terminal)
cd ../backend
npm run dev

# 2. Start frontend
cd ../frontend
npm run dev

# 3. Open browser
# http://localhost:3000
```

### Making Changes

```javascript
// Changes auto-refresh with HMR
// Edit components/ or lib/ files
// Page refreshes automatically (state preserved)
```

### Debugging

Use Chrome DevTools:

1. **React DevTools** Extension
   - Inspect component tree
   - Props and state
   - Performance profiling

2. **Network Tab**
   - Monitor API calls
   - Check request/response headers
   - Debug WebSocket frames

3. **Console**
   - View logs and errors
   - Test Socket.IO events
   - Check environment variables

## Performance Optimization

### Enable Compression

In `next.config.mjs`:
```javascript
module.exports = {
  compress: true, // Default enabled
};
```

### Optimize Images

Already done - using Tailwind CSS utilities instead of images.

### Enable Caching

Vercel automatically enables:
- Edge caching
- Browser caching
- Static generation

### Monitor Performance

Use Vercel Analytics:
1. Go to Vercel project
2. Open "Analytics" tab
3. Monitor Core Web Vitals

## Security Checklist

- [ ] Remove `.env.local` from Git (in .gitignore)
- [ ] Use HTTPS in production
- [ ] Set `NEXT_PUBLIC_API_URL` to HTTPS domain
- [ ] Enable CORS properly on backend
- [ ] Use secure session storage (not localStorage in production)
- [ ] Implement rate limiting on backend
- [ ] Add Content Security Policy headers

## Next Steps

1. ✅ Frontend setup complete
2. Configure backend if not done
3. Test end-to-end authentication
4. Test message sending and real-time features
5. Deploy to production
6. Monitor logs and performance

## Support

For issues:
- Check troubleshooting section above
- Review console errors (F12)
- Check backend logs
- Review FRONTEND_README.md
- Contact development team

---

**Version**: 1.0.0
**Last Updated**: December 7, 2025
