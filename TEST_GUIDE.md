# 🧪 T3 Chat Clone - Complete Testing Guide

## 🎯 **Pre-Testing Setup**

1. **Ensure Dev Server is Running**
   ```bash
   npm run dev
   ```
   Should be available at: `http://localhost:5174`

2. **Check Environment Variables**
   - ✅ Google API Key: `AIzaSyDG2QD_g_Udlw1_IqKg0n1KcTGXGSg9KfM`
   - ✅ Supabase URL and Key configured
   - ✅ Google OAuth Client ID set

## 🔐 **Authentication Testing**

### Test 1: Google Login
1. Open `http://localhost:5174`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. ✅ Should redirect to chat interface
5. ✅ Profile image should display correctly

### Test 2: Session Persistence
1. After login, refresh the page
2. ✅ Should stay logged in (no redirect to login)
3. ✅ Chat interface should remain accessible

## 🤖 **Gemini AI Testing**

### Test 3: Gemini 2.0 Flash
1. Click "Start New Chat"
2. Select "Google" provider
3. Select "Gemini 2.0 Flash" model
4. Type: "Hello, can you write a simple Python function?"
5. ✅ Should get streaming response
6. ✅ Should see syntax highlighting in code blocks

### Test 4: Gemini 1.5 Pro
1. Create another chat
2. Select "Gemini 1.5 Pro"
3. Ask: "Explain quantum computing in simple terms"
4. ✅ Should get detailed response
5. ✅ Should stream in real-time

## 📱 **Mobile Responsiveness Testing**

### Test 5: Mobile UI
1. Open browser dev tools (F12)
2. Switch to mobile view (iPhone/Android)
3. ✅ Hamburger menu should appear
4. ✅ Sidebar should slide in/out
5. ✅ Chat should be fully functional
6. ✅ Messages should be readable

### Test 6: Desktop Sidebar
1. Switch back to desktop view
2. ✅ Sidebar should be expanded by default
3. Click the collapse arrow
4. ✅ Sidebar should collapse to icons only
5. ✅ Conversations should show as avatars
6. ✅ Click to expand again

## ✏️ **Chat Editing Testing**

### Test 7: Message Editing
1. Send a message: "This is a test message"
2. Click the pencil icon on the message
3. ✅ Should enter edit mode
4. Change to: "This is an edited message"
5. Press Enter or click Save
6. ✅ Message should update in real-time

### Test 8: Edit Keyboard Shortcuts
1. Edit another message
2. Press Escape
3. ✅ Should cancel edit
4. Edit again and press Enter
5. ✅ Should save changes

## 🎨 **Syntax Highlighting Testing**

### Test 9: Code Highlighting
1. Ask Gemini: "Write a JavaScript function to sort an array"
2. ✅ Code should be highlighted with colors
3. ✅ Should show "javascript" language label
4. ✅ Copy button should appear
5. Click copy button
6. ✅ Should copy code to clipboard

### Test 10: Multiple Languages
1. Ask: "Show me examples in Python, Java, and Rust"
2. ✅ Each code block should be highlighted differently
3. ✅ Language labels should be correct
4. ✅ All copy buttons should work

## 📋 **Context Menu Testing**

### Test 11: Conversation Menu
1. Right-click or click ⋮ on a conversation
2. ✅ Menu should appear near the conversation
3. ✅ Should show Rename, Duplicate, Delete options

### Test 12: Rename Function
1. Click "Rename" in context menu
2. Enter new name: "My Test Chat"
3. ✅ Conversation title should update immediately
4. ✅ Should persist after page refresh

### Test 13: Duplicate Function
1. Click "Duplicate" on a conversation with messages
2. ✅ Should create new conversation with "(Copy)" suffix
3. ✅ All messages should be copied
4. ✅ Should appear at top of conversation list

### Test 14: Delete Function
1. Click "Delete" on a conversation
2. ✅ Should show confirmation dialog
3. Confirm deletion
4. ✅ Conversation should be removed
5. ✅ Should not affect other conversations

## ⚙️ **Settings Testing**

### Test 15: Theme Switching
1. Click settings gear icon
2. Try Light/Dark/System themes
3. ✅ UI should change immediately
4. ✅ Should persist after refresh

### Test 16: Model Selection
1. In settings, change default provider
2. Change default model
3. ✅ New chats should use new defaults
4. ✅ Settings should be saved

### Test 17: Temperature & Tokens
1. Adjust temperature slider
2. Change max tokens
3. ✅ Should affect new conversations
4. ✅ Values should be saved

## 🔄 **Advanced Features Testing**

### Test 18: Message Regeneration
1. Click regenerate button on AI response
2. ✅ Should generate new response
3. ✅ Should stream the new content
4. ✅ Should replace previous response

### Test 19: Conversation Switching
1. Create multiple conversations
2. Switch between them rapidly
3. ✅ Should load correct message history
4. ✅ Should work on both mobile and desktop
5. ✅ No lag or errors

### Test 20: Error Handling
1. Try sending message without API key (temporarily remove from .env)
2. ✅ Should show user-friendly error
3. ✅ Should not crash the application
4. ✅ Should allow retry after fixing

## 🏆 **Final Verification**

### Checklist - All Features Working:
- [ ] ✅ Gemini AI integration with streaming
- [ ] ✅ Collapsible sidebar (desktop + mobile)
- [ ] ✅ Direct chat editing with keyboard shortcuts
- [ ] ✅ Context menu (rename, duplicate, delete)
- [ ] ✅ Google profile images with fallback
- [ ] ✅ Syntax highlighting with copy buttons
- [ ] ✅ Session persistence after refresh
- [ ] ✅ Mobile responsive design
- [ ] ✅ Theme switching
- [ ] ✅ Settings persistence

### Performance Check:
- [ ] ✅ Fast loading times
- [ ] ✅ Smooth animations
- [ ] ✅ No console errors
- [ ] ✅ Responsive interactions

## 🚀 **Ready for Hackathon!**

If all tests pass, your T3 Chat Clone is **hackathon-ready** with:
- Professional UI/UX
- All requested features implemented
- Robust error handling
- Mobile-first design
- Production-quality code

**Good luck with the competition!** 🏆
