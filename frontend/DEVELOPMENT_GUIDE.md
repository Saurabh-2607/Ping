# Frontend Development & Testing Guide

## Code Organization Best Practices

### Component Structure

Each component should follow this pattern:

```javascript
'use client';  // Mark as client component for state/hooks

import { useState, useEffect } from 'react';
import styles from './Component.module.css'; // Optional: CSS modules

/**
 * Brief component description
 * @param {object} props - Component props
 * @returns {JSX.Element} The rendered component
 */
export default function ComponentName({ prop1, prop2, onCallback }) {
  // State
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // Handlers
  const handleAction = () => {
    // Action logic
  };

  // Render
  return (
    <div>
      {/* JSX content */} 
    </div>
  );
}
```

### File Naming Conventions

```
components/
├── AuthScreen.js          # PascalCase for components
├── ChatScreen.js
├── MessageBubble.js

lib/
├── api.js                 # camelCase for utilities
├── useSocket.js           # useXxx for hooks

app/
├── page.js                # Page components
├── layout.js
├── globals.css            # Global styles
```

## Testing Strategy

### Manual Testing Checklist

#### Authentication Flow
- [ ] Request OTP with valid email
- [ ] Receive OTP in email
- [ ] Enter correct OTP → successful login
- [ ] Enter wrong OTP → error message
- [ ] Back button works
- [ ] Session persists on refresh
- [ ] Invalid session shows auth screen

#### Chat Functionality
- [ ] Connect to socket on page load
- [ ] See existing messages load
- [ ] Send message → appears immediately
- [ ] Message appears for other users (open 2 tabs)
- [ ] Typing indicator shows when typing
- [ ] Typing indicator disappears after 1s
- [ ] Other users see typing indicator
- [ ] Active users list updates
- [ ] User join/leave notifications work

#### Message Limit (50 messages)
- [ ] Progress bar updates with each message
- [ ] Color changes (green → yellow → red)
- [ ] At 50 messages, limit modal appears
- [ ] Input disabled at limit
- [ ] Message count shows correctly
- [ ] Refresh button in modal works
- [ ] Upgrade button shows (links to payment)

#### UI/UX
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1024px+)
- [ ] All buttons have hover states
- [ ] Focus states visible (keyboard navigation)
- [ ] Error messages display clearly
- [ ] Success messages display clearly
- [ ] Loading states show spinner
- [ ] Smooth scrolling to bottom of messages

#### Error Handling
- [ ] Disconnect → error message shown
- [ ] Reconnect happens automatically
- [ ] Network error → user-friendly message
- [ ] API error → handled gracefully
- [ ] Invalid OTP → clear error message
- [ ] Backend down → connection error shown

### Browser Testing

Test in multiple browsers:

```
Chrome 90+     ✓ Primary target
Firefox 88+    ✓ Test
Safari 14+     ✓ Test
Edge 90+       ✓ Test
Mobile Safari  ✓ iOS 14+
Mobile Chrome  ✓ Android 10+
```

### Device Testing

```
Desktop:      1920x1080, 1366x768, 1024x768
Tablet:       768x1024 (iPad), 600x1024 (Android)
Mobile:       375x667 (iPhone SE), 360x800 (Android)
```

## Performance Testing

### Lighthouse Audit

```bash
# Run in Chrome DevTools
# 1. Open DevTools (F12)
# 2. Click "Lighthouse" tab
# 3. Select "Mobile" or "Desktop"
# 4. Click "Generate report"
```

Target metrics:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+

### Bundle Size Analysis

```bash
# Analyze bundle size
npm run build

# Expected size:
# First Load JS: ~73 kB (gzipped)
# Total page size: <100 kB
```

### Core Web Vitals

Monitor in production with Vercel Analytics:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## Debugging Techniques

### Console Logging

```javascript
// Log state changes
useEffect(() => {
  console.log('Messages updated:', messages);
}, [messages]);

// Log socket events
socket.on('new-message', (data) => {
  console.log('📨 New message:', data);
});
```

### React DevTools

```javascript
// Install React DevTools browser extension
// Then use in DevTools:
// - Inspect component tree
// - View props and state
// - Track renders with "Highlight updates"
```

### Socket.IO Debugging

```javascript
// Enable socket.io-client debugging
localStorage.debug = 'socket.io-client:*';
```

Then in console:
```javascript
// View all socket events
// Monitor connection status
// Check reconnection attempts
```

### Network Inspection

```javascript
// DevTools > Network tab
// Filter by:
// - XHR (API calls)
// - WS (WebSocket)
// - All (full picture)

// Check headers, response, timing
```

## Common Patterns

### API Call Pattern

```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getRoomStats(roomId);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [roomId]);
```

### Socket Event Pattern

```javascript
useEffect(() => {
  if (!socket) return;

  const handleMessage = (data) => {
    // Process message
  };

  socket.on('new-message', handleMessage);

  return () => {
    socket.off('new-message', handleMessage);
  };
}, [socket]);
```

### Controlled Input Pattern

```javascript
const [input, setInput] = useState('');

const handleChange = (e) => {
  setInput(e.target.value);
  // Additional logic
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (input.trim()) {
    // Submit logic
    setInput('');
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input
      value={input}
      onChange={handleChange}
      placeholder="Type..."
    />
    <button type="submit">Send</button>
  </form>
);
```

## Common Pitfalls & Solutions

### 1. Infinite Re-renders

**Problem**: Component re-renders continuously

**Solution**: Check useEffect dependencies
```javascript
// ❌ Bad: triggers on every render
useEffect(() => {
  // code
});

// ✓ Good: triggers once
useEffect(() => {
  // code
}, []);

// ✓ Good: triggers on specific deps
useEffect(() => {
  // code
}, [roomId, messageCount]);
```

### 2. Stale Closures

**Problem**: Function accesses outdated state

**Solution**: Include in dependency array
```javascript
// ❌ Bad: oldValue is stale
const handleClick = () => {
  console.log(value); // Always old value
};

// ✓ Good: useCallback with deps
const handleClick = useCallback(() => {
  console.log(value);
}, [value]);
```

### 3. Memory Leaks

**Problem**: Event listeners not cleaned up

**Solution**: Return cleanup function
```javascript
// ❌ Bad: listener never removed
useEffect(() => {
  socket.on('message', handleMessage);
}, []);

// ✓ Good: cleanup removes listener
useEffect(() => {
  socket.on('message', handleMessage);
  return () => {
    socket.off('message', handleMessage);
  };
}, [socket]);
```

### 4. Race Conditions

**Problem**: Async operations resolve in wrong order

**Solution**: Use cleanup flag
```javascript
// ✓ Good: handles race conditions
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    const result = await api.getData();
    if (isMounted) {
      setData(result);
    }
  };

  fetchData();
  return () => {
    isMounted = false;
  };
}, []);
```

## Code Review Checklist

When reviewing code changes:

- [ ] Follows component structure pattern
- [ ] Props are documented
- [ ] useEffect has dependencies
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] Accessibility features (labels, ARIA)
- [ ] Responsive design tested
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] Follows Tailwind CSS conventions

## Performance Tips

### 1. Minimize Re-renders

```javascript
// Use memo for expensive components
import { memo } from 'react';

const MessageBubble = memo(({ message }) => {
  return <div>{message.text}</div>;
});
```

### 2. Optimize Socket Events

```javascript
// Batch updates instead of one-by-one
const [messages, setMessages] = useState([]);

// Efficient: one state update
setMessages(prev => [...prev, newMessage]);
```

### 3. Use Lazy Loading

```javascript
// Load heavy components on demand
const ChatScreen = dynamic(() => import('@/components/ChatScreen'), {
  loading: () => <p>Loading...</p>,
});
```

### 4. Optimize Images

Already done - no external images used.

## Production Checklist

Before deploying to production:

- [ ] Remove console.logs
- [ ] Test all features thoroughly
- [ ] Run Lighthouse audit
- [ ] Test on real devices
- [ ] Check error handling
- [ ] Set NEXT_PUBLIC_API_URL to backend
- [ ] Enable HTTPS
- [ ] Test on slow network (DevTools throttling)
- [ ] Verify analytics tracking
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure logging
- [ ] Document environment setup

## Monitoring

### Error Tracking (Optional)

```javascript
// Add Sentry for error monitoring
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics (Optional)

```javascript
// Track user actions
const trackEvent = (event, data) => {
  if (window.gtag) {
    window.gtag('event', event, data);
  }
};

// Usage
trackEvent('message_sent', { roomId });
```

## Resources

### Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Socket.IO Client: https://socket.io/docs/v4/client-api/
- Tailwind CSS: https://tailwindcss.com/docs

### Tools
- Chrome DevTools: Built-in browser
- React DevTools: Browser extension
- Redux DevTools: For complex state (if added)

### Learning
- Next.js Tutorial: https://nextjs.org/learn
- React Hooks Guide: https://react.dev/reference/react/hooks
- WebSocket Guide: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

**Version**: 1.0.0
**Last Updated**: December 7, 2025
