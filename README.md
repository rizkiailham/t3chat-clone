# T3 Chat Clone

A modern, feature-rich AI chat application built with Vue.js, featuring multiple LLM providers, real-time streaming, conversation sharing, and Google authentication. Built for the T3 Chat Cloneathon with enterprise-grade performance optimizations.

## ✨ Features

### 🤖 **AI & LLM Integration**
- **Multiple AI Providers**: OpenAI GPT models, Anthropic Claude, and Google Gemini
- **Real-time Streaming**: Live streaming responses with resumable streams
- **BYOK Support**: Bring Your Own Key for all supported providers
- **Smart Model Selection**: Automatic model switching and fallback handling
- **Syntax Highlighting**: Code blocks with Prism.js integration

### 🔐 **Authentication & Security**
- **Google OAuth 2.0**: Secure sign-in with Google authentication
- **Session Management**: Auto-refresh tokens with optimized handling
- **Row-Level Security**: Database-level security with Supabase RLS
- **Secure Token Storage**: Encrypted token storage and management

### 💬 **Chat Experience**
- **Conversation Management**: Create, edit, duplicate, and delete conversations
- **Message Editing**: Inline message editing and regeneration
- **Conversation Sharing**: Share conversations with unique URLs for read-only access
- **Chat History**: Persistent chat history synced across devices
- **Mobile Responsive**: Collapsible sidebar and mobile-optimized interface

### 🎨 **User Interface**
- **Modern Design**: Clean, intuitive interface with Tailwind CSS
- **Dark/Light Mode**: Beautiful themes with system preference detection
- **Glass Effect UI**: Floating glass-effect chat interface design
- **Copy Functionality**: Easy copy buttons for code and messages
- **Responsive Layout**: Seamless mobile and desktop experience

### ⚙️ **Customization & Settings**
- **Model Configuration**: Adjust temperature, max tokens, and system prompts
- **Provider Settings**: Configure API keys and model preferences
- **UI Preferences**: Theme selection and interface customization
- **Export/Import**: Conversation backup and restore functionality

### 🚀 **Performance & Optimization**
- **Smart Refresh Logic**: Optimized token refresh without unnecessary API calls
- **Debounced Operations**: Prevents redundant network requests
- **Connection Recovery**: Robust error handling and automatic reconnection
- **Efficient Caching**: Smart state management with Pinia stores

## 🛠️ Tech Stack

### **Frontend**
- **Vue 3** with Composition API and TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling and responsive design
- **Headless UI** for accessible components
- **Heroicons & Lucide** for beautiful icons
- **Prism.js** for syntax highlighting

### **Backend & Database**
- **Supabase** (PostgreSQL) for database and real-time features
- **Row-Level Security (RLS)** for data protection
- **Supabase Auth** with Google OAuth integration
- **Axios** for optimized HTTP requests

### **State Management**
- **Pinia** for reactive state management
- **Smart caching** with optimized refresh logic
- **Event-driven architecture** for token management

### **AI & LLM Integration**
- **OpenAI API** (GPT-3.5, GPT-4, GPT-4 Turbo)
- **Anthropic API** (Claude 3 Haiku, Sonnet, Opus)
- **Google Gemini API** (Gemini Pro, Gemini Pro Vision)
- **Streaming support** with fallback handling

### **Development & Deployment**
- **TypeScript** for type safety
- **ESLint & Prettier** for code quality
- **Vite DevTools** for debugging
- **Ready for Vercel/Netlify** deployment

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** (recommended: Node.js 20 LTS)
- **npm** or **yarn** package manager
- **Git** for version control

You'll also need accounts for:
- **Supabase** (free tier available)
- **Google Cloud Console** (for OAuth)
- **AI Provider APIs** (optional, for BYOK):
  - OpenAI API key
  - Anthropic API key
  - Google AI API key

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/t3chat-clone.git
cd t3chat-clone

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth Configuration (Required)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# AI Provider API Keys (Optional - for BYOK)
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
VITE_GOOGLE_API_KEY=your-google-ai-api-key

# App Configuration (Optional)
VITE_APP_NAME=T3 Chat Clone
VITE_APP_URL=http://localhost:5173
```

> ⚠️ **Important**: Never commit your `.env` file to version control. It contains sensitive API keys.

### 3. Supabase Setup

#### 3.1 Create Supabase Project
1. **Go to Supabase**
   - Visit [supabase.com](https://supabase.com) and sign up/login
   - Click "New Project"
   - Choose your organization and enter project details:
     - **Name**: T3 Chat Clone (or your preferred name)
     - **Database Password**: Create a strong password (save it!)
     - **Region**: Choose closest to your location
   - Click "Create new project"
   - Wait for the project to be ready (2-3 minutes)

2. **Get Your Project Credentials**
   - Go to Settings > API
   - Copy your **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - Copy your **anon public** key (starts with `eyJ...`)
   - Add these to your `.env` file

#### 3.2 Database Schema Setup

**Important**: Run this exact SQL script in your Supabase SQL Editor:

1. **Open SQL Editor**
   - In your Supabase dashboard, click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Copy and Paste This Complete Script**:

```sql
-- T3 Chat Clone Database Setup
-- Run this entire script in your Supabase SQL editor

-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  system_prompt TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  share_id UUID UNIQUE,
  shared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
Import database schema from database.sql
3. **Run the Script**
   - Click the "Run" button
   - You should see "Success. No rows returned" message
   - Check the "Table Editor" to verify tables were created

### 4. Google OAuth Setup

**This is the most critical step - follow exactly to avoid authentication errors!**

#### 4.1 Google Cloud Console Configuration

1. **Create/Select Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Sign in with your Google account
   - Create a new project or select an existing one
   - Note your project name/ID

2. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and click on it
   - Click "Enable" button
   - Wait for it to be enabled

3. **Configure OAuth Consent Screen** (Required!)
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - **App name**: T3 Chat Clone
     - **User support email**: Your email
     - **Developer contact email**: Your email
   - Click "Save and Continue"
   - Skip "Scopes" and "Test users" for now
   - Click "Back to Dashboard"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name it: "T3 Chat Clone"

   **Authorized JavaScript origins** (Add these exactly):
   ```
   http://localhost:5173
   https://your-project.supabase.co
   ```

   **Authorized redirect URIs** (Add this exactly):
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

   Replace `your-project` with your actual Supabase project reference (from your Supabase URL).

5. **Copy Your Credentials**
   - Copy the **Client ID** (ends with `.apps.googleusercontent.com`)
   - Copy the **Client Secret**
   - Save these securely!

#### 4.2 Supabase OAuth Configuration

1. **Enable Google Provider in Supabase**
   - In your Supabase dashboard, go to "Authentication" → "Providers"
   - Find "Google" in the list
   - Toggle the switch to **Enable**

2. **Configure Google Provider**
   - **Client ID**: Paste your Google Client ID
   - **Client Secret**: Paste your Google Client Secret
   - **Redirect URL**: Should auto-fill as `https://your-project.supabase.co/auth/v1/callback`
   - Click "Save"

3. **Update Your Environment File**
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

> ⚠️ **Common Error**: If you get "provider is not enabled" error, double-check that:
> - Google provider is toggled ON in Supabase
> - You clicked "Save" after entering credentials
> - Your Client ID is correct in the `.env` file

### 5. Run the Application

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### 6. Test & Verify Setup

#### 6.1 Test Authentication
1. **Open your browser** to `http://localhost:5173`
2. **Click "Sign in with Google"**
3. **Complete the OAuth flow**
4. **Check for success**: You should be redirected back to the app and see your profile

#### 6.2 Verify Database Integration
1. **Check Supabase Dashboard**:
   - Go to "Authentication" → "Users"
   - You should see your user account listed
   - Go to "Table Editor" → "users"
   - You should see your user profile automatically created

2. **Test App Functionality**:
   - Create a new conversation
   - Try sending a message (will work if you have API keys configured)
   - Check conversation history
   - Test conversation sharing

#### 6.3 Success Checklist
If everything is working, you should be able to:
- ✅ Sign in with Google without errors
- ✅ See your user profile in Supabase
- ✅ Create conversations
- ✅ View conversation history
- ✅ Share conversations
- ✅ Send messages (if API keys are configured)

## 🚨 Troubleshooting Common Issues

### Issue 1: "provider is not enabled"
**Cause**: Google OAuth not properly configured
**Solution**:
1. Verify Google provider is enabled in Supabase Authentication → Providers
2. Check that Client ID and Secret are correctly entered
3. Ensure you clicked "Save" in Supabase
4. Restart your development server

### Issue 2: "redirect_uri_mismatch"
**Cause**: Redirect URI mismatch between Google Console and Supabase
**Solution**:
1. In Google Console, ensure redirect URI is exactly: `https://your-project.supabase.co/auth/v1/callback`
2. Replace `your-project` with your actual Supabase project reference
3. No trailing slashes or extra characters

### Issue 3: Database connection errors
**Cause**: Database schema not properly set up
**Solution**:
1. Re-run the complete SQL script from Step 3.2
2. Check that all tables exist in Supabase Table Editor
3. Verify RLS policies are enabled

### Issue 4: "Failed to fetch" errors
**Cause**: Environment variables not properly configured
**Solution**:
1. Double-check your `.env` file has correct values
2. Ensure no extra spaces or quotes around values
3. Restart development server after changing `.env`

### Issue 5: API key errors (for AI features)
**Cause**: Invalid or missing API keys
**Solution**:
1. Verify API key format (OpenAI starts with `sk-`, Anthropic with `sk-ant-`)
2. Check API key permissions and billing status
3. Test API keys directly with provider documentation

## � Optional: AI Provider API Keys

To enable AI chat functionality, you'll need API keys from one or more providers:

### OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/login and go to API Keys
3. Create a new API key
4. Add to your `.env`: `VITE_OPENAI_API_KEY=sk-your-key-here`

### Anthropic Setup
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up/login and go to API Keys
3. Create a new API key
4. Add to your `.env`: `VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here`

### Google AI Setup
1. Go to [makersuite.google.com](https://makersuite.google.com)
2. Get an API key
3. Add to your `.env`: `VITE_GOOGLE_API_KEY=your-key-here`

### PDF.co Setup (Optional - for Premium PDF Parsing)
1. Go to [pdf.co](https://pdf.co)
2. Sign up for a free account (100 API calls/month)
3. Go to your dashboard and copy your API key
4. Add to your `.env`: `VITE_PDFCO_API_KEY=your-pdf-co-api-key`

**PDF.co Features:**
- ✅ High-quality text extraction from PDFs
- ✅ Table detection and CSV export
- ✅ Image extraction from PDF pages
- ✅ OCR for scanned documents
- ✅ Professional-grade parsing accuracy

> 💡 **Note**: The app works without API keys - you just won't be able to send messages to AI models. PDF parsing requires PDF.co configuration for content analysis. All other features (auth, conversations, sharing) work normally.

## 🗄️ Database Schema Overview

The application uses PostgreSQL with Row-Level Security (RLS):

### Core Tables
- **users**: User profiles linked to Supabase Auth
- **conversations**: Chat conversations with AI models
- **messages**: Individual messages within conversations

### Key Features
- **Row-Level Security**: Users can only access their own data
- **Conversation Sharing**: Public read-only access to shared conversations
- **Auto-User Creation**: User profiles created automatically on signup
- **Performance Indexes**: Optimized for fast queries
- **Cascade Deletes**: Clean data relationships

### Database Setup
The complete SQL schema is provided in the setup instructions above. It includes:
- ✅ All table definitions with proper relationships
- ✅ Row-Level Security policies for data protection
- ✅ Performance indexes for fast queries
- ✅ Triggers for automatic user creation and timestamps
- ✅ Sharing functionality for public conversation access

## 🛠️ Development

### Project Structure

```
t3chat-clone/
├── public/                 # Static assets
├── src/
│   ├── components/         # Vue components
│   │   ├── Chat/          # Chat interface components
│   │   │   ├── ChatInterface.vue
│   │   │   ├── MessageList.vue
│   │   │   ├── MessageInput.vue
│   │   │   └── StreamingMessage.vue
│   │   ├── Sidebar/       # Sidebar components
│   │   │   ├── ConversationList.vue
│   │   │   ├── ConversationItem.vue
│   │   │   └── NewChatButton.vue
│   │   ├── Modals/        # Modal dialogs
│   │   │   ├── SettingsModal.vue
│   │   │   ├── ShareModal.vue
│   │   │   └── ConfirmModal.vue
│   │   └── UI/            # Reusable UI components
│   ├── services/          # API and business logic
│   │   ├── auth.service.ts
│   │   ├── axios-auth.service.ts
│   │   ├── axios-db.ts
│   │   ├── llm.service.ts
│   │   └── supabase.ts
│   ├── stores/            # Pinia state management
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   └── settings.ts
│   ├── types/             # TypeScript definitions
│   │   ├── index.ts
│   │   └── database.ts
│   ├── views/             # Page components
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── AuthCallback.vue
│   │   └── SharedConversation.vue
│   ├── router/            # Vue Router configuration
│   ├── assets/            # Styles and static files
│   └── App.vue            # Root component
├── database.sql           # Database schema
├── .env.example          # Environment template
└── package.json          # Dependencies and scripts
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript type checking

# Testing (if implemented)
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
```

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit components in `src/components/`
   - Update stores in `src/stores/`
   - Modify services in `src/services/`

3. **Code Quality Checks**
   ```bash
   npm run lint        # Check and fix linting issues
   npm run type-check  # Verify TypeScript types
   npm run format      # Format code consistently
   ```

4. **Build for Production**
   ```bash
   npm run build       # Creates optimized build in dist/
   npm run preview     # Test production build locally
   ```

## 🚀 Deployment

### Vercel (Recommended)

Vercel provides the best experience for Vue.js applications with automatic deployments and optimizations.

#### Setup Steps:
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com) and sign up
   - Click "New Project" and import your GitHub repository
   - Vercel will auto-detect it's a Vue.js project

2. **Configure Environment Variables**
   Add these in Vercel dashboard under Settings > Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_OPENAI_API_KEY=your-openai-api-key (optional)
   VITE_ANTHROPIC_API_KEY=your-anthropic-api-key (optional)
   VITE_GOOGLE_API_KEY=your-google-ai-api-key (optional)
   VITE_APP_URL=https://your-domain.vercel.app
   ```

3. **Update OAuth Settings**
   - Add your Vercel domain to Google OAuth authorized origins
   - Update Supabase Auth settings with your production URL

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Custom domains can be configured in project settings

### Netlify

Alternative deployment option with similar features.

#### Setup Steps:
1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com) and sign up
   - Click "New site from Git" and connect your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 or higher

3. **Environment Variables**
   Add the same environment variables as Vercel in Site Settings > Environment Variables

4. **Deploy**
   - Netlify will build and deploy automatically
   - Configure custom domain if needed

### Production Checklist

Before deploying to production:

- [ ] ✅ All environment variables configured
- [ ] ✅ Google OAuth domains updated
- [ ] ✅ Supabase Auth settings updated
- [ ] ✅ Database schema deployed
- [ ] ✅ API keys secured (not in client code)
- [ ] ✅ Error tracking configured (optional)
- [ ] ✅ Analytics configured (optional)

### Post-Deployment

1. **Test Core Functionality**
   - Sign in with Google
   - Create conversations
   - Send messages
   - Share conversations
   - Mobile responsiveness

2. **Monitor Performance**
   - Check Vercel/Netlify analytics
   - Monitor Supabase usage
   - Track API usage for LLM providers

3. **Security Verification**
   - Verify RLS policies are working
   - Test unauthorized access attempts
   - Confirm environment variables are secure

## 🔧 Configuration & Customization

### AI Provider Configuration

The application supports multiple AI providers with flexible configuration:

#### OpenAI Configuration
```typescript
// Supported models
- gpt-4o (4096 tokens)
- gpt-4o-mini (4096 tokens)
- gpt-3.5-turbo (2048 tokens)

// User configurable settings
temperature: 0.7 (adjustable 0.0 - 2.0)
```

#### Google Gemini Configuration
```typescript
// Supported models
- gemini-2.0-flash (8192 tokens)
- gemini-1.5-pro (8192 tokens)

// User configurable settings
temperature: 0.7 (adjustable 0.0 - 2.0)
```

**Note:** Max tokens are automatically optimized based on the selected model's capabilities and are not user-configurable, following the design patterns of modern AI applications like ChatGPT and Gemini.

### Customization Options

#### Theme Customization
- Modify `tailwind.config.js` for custom colors
- Update CSS variables in `src/assets/main.css`
- Add new themes in settings store

#### UI Customization
- Component styling in `src/components/`
- Layout modifications in `src/views/`
- Icon replacements in component templates

#### Feature Toggles
- Enable/disable providers in `src/services/llm.service.ts`
- Modify conversation sharing in `src/stores/chat.ts`
- Adjust authentication flow in `src/services/auth.service.ts`

## 🐛 Troubleshooting

### Common Issues

#### Authentication Issues
```bash
# Problem: Google OAuth not working
# Solution: Check OAuth configuration
1. Verify Google Client ID in .env
2. Check authorized origins in Google Console
3. Confirm Supabase Auth settings
```

#### Database Connection Issues
```bash
# Problem: Database queries failing
# Solution: Check Supabase configuration
1. Verify SUPABASE_URL and ANON_KEY
2. Check RLS policies are enabled
3. Confirm user permissions
```

#### API Key Issues
```bash
# Problem: AI responses not working
# Solution: Verify API keys
1. Check API key format and validity
2. Verify provider-specific requirements
3. Check API usage limits
```

#### Build Issues
```bash
# Problem: Build failing
# Solution: Check dependencies and environment
npm run type-check  # Check TypeScript errors
npm run lint        # Check linting issues
npm ci              # Clean install dependencies
```

### Performance Optimization

The application includes several performance optimizations:

- **Smart Refresh Logic**: Prevents unnecessary API calls
- **Debounced Operations**: Reduces redundant requests
- **Efficient Caching**: Optimized state management
- **Connection Recovery**: Robust error handling

For more details, see `OPTIMIZATION_SUMMARY.md`.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`
5. Set up your development environment (see Quick Start)

### Making Changes
1. Make your changes following the existing code style
2. Run quality checks:
   ```bash
   npm run lint        # Fix linting issues
   npm run type-check  # Check TypeScript
   npm run format      # Format code
   ```
3. Test your changes thoroughly
4. Update documentation if needed

### Submitting Changes
1. Commit your changes: `git commit -m "feat: your feature description"`
2. Push to your fork: `git push origin feature/your-feature`
3. Create a Pull Request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Testing instructions

### Code Style Guidelines
- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Add comments for complex logic

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **T3 Chat Cloneathon**: Built for the community challenge
- **Vue.js Team**: For the amazing framework
- **Supabase Team**: For the excellent backend platform
- **Tailwind CSS**: For the utility-first CSS framework
- **OpenAI, Anthropic, Google**: For providing AI APIs
- **Open Source Community**: For inspiration and contributions

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join the T3 Chat community

---

**Built with ❤️ for the T3 Chat Cloneathon**
