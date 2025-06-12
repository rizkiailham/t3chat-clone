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
git clone <your-repo-url>
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

### 3. Supabase Setup

#### 3.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be ready (2-3 minutes)
5. Go to Settings > API to get your URL and anon key

#### 3.2 Database Schema Setup
1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `database.sql` file
3. Paste and run the SQL script to create tables and policies

#### 3.3 Authentication Configuration
1. Go to Authentication > Settings in Supabase
2. Scroll down to "Auth Providers"
3. Enable Google provider
4. Add your Google OAuth credentials (see next step)

### 4. Google OAuth Setup

#### 4.1 Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to APIs & Services > Library
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:5173` (development)
     - `https://your-domain.com` (production)
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (development)
     - `https://your-domain.com/auth/callback` (production)

#### 4.2 Supabase OAuth Configuration
1. In Supabase, go to Authentication > Settings
2. Under "Auth Providers", configure Google:
   - Enable Google provider
   - Add your Google Client ID
   - Add your Google Client Secret
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Run the Application

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### 6. Verify Setup

1. Open your browser to `http://localhost:5173`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. Create a new conversation
5. Send a test message

If everything is configured correctly, you should be able to:
- ✅ Sign in with Google
- ✅ Create conversations
- ✅ Send messages (if API keys are configured)
- ✅ View conversation history
- ✅ Share conversations

## 🗄️ Database Schema

The application uses a PostgreSQL database hosted on Supabase with Row-Level Security (RLS) enabled. The complete schema is available in the `database.sql` file.

### Core Tables

#### Users Table
Stores user profile information linked to Supabase Auth:
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Conversations Table
Stores chat conversations with sharing capabilities:
```sql
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
```

#### Messages Table
Stores individual messages within conversations:
```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Security & Performance

- **Row-Level Security (RLS)**: Ensures users can only access their own data
- **Optimized Indexes**: Fast queries for conversations and messages
- **Cascade Deletes**: Automatic cleanup when conversations are deleted
- **Sharing Policies**: Secure public access for shared conversations

### Setup Instructions

1. Copy the complete schema from `database.sql`
2. Open Supabase SQL Editor
3. Paste and execute the schema
4. Verify tables and policies are created

The schema includes:
- ✅ All table definitions
- ✅ Row-Level Security policies
- ✅ Performance indexes
- ✅ Sharing functionality
- ✅ Data validation constraints

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
- gpt-3.5-turbo
- gpt-4
- gpt-4-turbo
- gpt-4o

// Configuration in settings
temperature: 0.7
maxTokens: 2048
```

#### Anthropic Configuration
```typescript
// Supported models
- claude-3-haiku-20240307
- claude-3-sonnet-20240229
- claude-3-opus-20240229

// Configuration in settings
temperature: 0.7
maxTokens: 4096
```

#### Google Gemini Configuration
```typescript
// Supported models
- gemini-pro
- gemini-pro-vision

// Configuration in settings
temperature: 0.9
maxTokens: 2048
```

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
