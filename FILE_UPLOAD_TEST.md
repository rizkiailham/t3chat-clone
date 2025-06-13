# File Upload Feature Test Guide

## 🧪 Testing the File Upload Feature

### Prerequisites
1. Application is running on `http://localhost:5173`
2. User is authenticated with Google OAuth
3. At least one AI provider API key is configured (OpenAI or Google Gemini)

### Test Cases

#### ✅ Test 1: File Upload UI Components
**Expected Behavior:**
- File upload button (📎) appears in chat input area
- Clicking the button opens file picker
- Only images and PDFs are selectable in file picker

**Steps:**
1. Open the application
2. Sign in with Google
3. Create or select a conversation
4. Look for the file upload button (paperclip icon) in the chat input
5. Click the file upload button
6. Verify file picker only shows image and PDF files

#### ✅ Test 2: Image Upload Validation
**Expected Behavior:**
- Accepts: JPEG, PNG, GIF, WebP files
- Rejects: Other file types with error message
- Shows file size limit (5MB for images)

**Steps:**
1. Try uploading a valid image file (< 5MB)
2. Try uploading an invalid file type (e.g., .txt, .docx)
3. Try uploading a large image file (> 5MB)
4. Verify appropriate error messages appear

#### ✅ Test 3: PDF Upload Validation
**Expected Behavior:**
- Accepts: PDF files
- Shows file size limit (10MB for PDFs)
- Displays PDF icon and file info

**Steps:**
1. Try uploading a valid PDF file (< 10MB)
2. Try uploading a large PDF file (> 10MB)
3. Verify file appears in upload preview with PDF icon

#### ✅ Test 4: File Preview and Management
**Expected Behavior:**
- Uploaded files show in preview area
- Image files show thumbnail preview
- PDF files show document icon
- Files can be removed before sending
- File count indicator appears

**Steps:**
1. Upload 2-3 different files (mix of images and PDFs)
2. Verify each file shows correct preview
3. Remove one file using the X button
4. Verify file count updates correctly

#### ✅ Test 5: OpenAI Integration with Images
**Expected Behavior:**
- Images are sent to OpenAI GPT-4 Vision
- AI can analyze and describe images
- Response includes image analysis

**Steps:**
1. Upload an image file
2. Add text message: "What do you see in this image?"
3. Send the message
4. Verify AI responds with image description

#### ✅ Test 6: Google Gemini Integration with Images
**Expected Behavior:**
- Images are sent to Gemini Pro Vision
- AI can analyze and describe images
- Response includes image analysis

**Steps:**
1. Switch to Gemini model in settings
2. Upload an image file
3. Add text message: "Describe this image in detail"
4. Send the message
5. Verify AI responds with image analysis

#### ✅ Test 7: PDF Upload Handling
**Expected Behavior:**
- PDF files are uploaded but content extraction is not implemented
- AI receives notification about PDF file
- AI provides guidance about PDF analysis

**Steps:**
1. Upload a PDF file
2. Add text message: "Summarize this PDF"
3. Send the message
4. Verify AI acknowledges the PDF and explains limitations

#### ✅ Test 8: Multiple File Upload
**Expected Behavior:**
- Can upload multiple files (up to 5)
- All files are included in the message
- AI can reference multiple files

**Steps:**
1. Upload 3 different files (2 images, 1 PDF)
2. Add text message: "Analyze all these files"
3. Send the message
4. Verify AI acknowledges all files

#### ✅ Test 9: Error Handling
**Expected Behavior:**
- Clear error messages for unsupported files
- Graceful handling of upload failures
- Network error recovery

**Steps:**
1. Try uploading unsupported file types
2. Try uploading files that are too large
3. Verify error messages are user-friendly
4. Verify errors can be dismissed

#### ✅ Test 10: Mobile Responsiveness
**Expected Behavior:**
- File upload works on mobile devices
- Touch interactions work properly
- File previews are mobile-friendly

**Steps:**
1. Open application on mobile device or resize browser
2. Test file upload functionality
3. Verify all interactions work with touch

### 🔧 Debugging Tips

#### Check Browser Console
- Look for file upload related logs
- Check for API errors
- Verify file processing messages

#### Network Tab
- Monitor file upload requests
- Check API calls to OpenAI/Gemini
- Verify file data is being sent correctly

#### Common Issues
1. **File not uploading**: Check file size and type restrictions
2. **AI not responding to images**: Verify API keys are configured
3. **Preview not showing**: Check browser file API support
4. **Upload button missing**: Verify component is properly imported

### 📊 Expected Results

#### Successful Test Results:
- ✅ File upload UI appears and functions
- ✅ File validation works correctly
- ✅ Images are processed and analyzed by AI
- ✅ PDFs are acknowledged with appropriate messaging
- ✅ Error handling provides clear feedback
- ✅ Mobile experience is functional

#### Performance Expectations:
- File upload should be near-instantaneous for small files
- AI responses with images should arrive within 10-30 seconds
- No memory leaks or browser crashes with multiple uploads

### 🚀 Advanced Testing

#### Load Testing:
- Upload maximum number of files (5)
- Test with maximum file sizes
- Rapid successive uploads

#### Edge Cases:
- Upload files with special characters in names
- Upload corrupted image files
- Test with very slow network connections

This comprehensive test suite ensures the file upload feature works reliably across all supported scenarios.
