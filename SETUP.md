# T3 Chat Clone - Setup Guide

This guide will help you set up the T3 Chat Clone application from scratch.

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have the following installed:
- **Node.js 18+** (recommended: use Node.js 20)
- **npm** or **yarn**
- **Git**

### 2. Clone and Install

```bash
git clone <your-repository-url>
cd t3chat-clone
npm install
```

### 3. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Optional: API Keys for BYOK (Bring Your Own Key)
VITE_OPENAI_API_KEY=your-openai-api-key-here
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 4. Database Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for it to be ready

2. **Run Database Schema**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database.sql`
   - Run the script

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Add Google as a provider
   - Set your Google OAuth credentials

### 5. Google OAuth Setup

1. **Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API

2. **Create OAuth Credentials**
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized origins:
     - `http://localhost:5173` (development)
     - `https://your-domain.com` (production)
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/callback`
     - `https://your-domain.com/auth/callback`

3. **Configure Supabase**
   - In Supabase dashboard, go to Authentication > Settings
   - Enable Google provider
   - Add your Google Client ID and Secret

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
```

### Project Structure

```
src/
├── components/          # Vue components
│   ├── Chat/           # Chat-related components
│   ├── Sidebar/        # Sidebar components
│   └── Modals/         # Modal components
├── services/           # API services
│   ├── auth.service.ts # Authentication
│   ├── llm.service.ts  # LLM providers
│   └── supabase.ts     # Database
├── stores/             # Pinia stores
│   ├── auth.ts         # Authentication state
│   ├── chat.ts         # Chat state
│   └── settings.ts     # App settings
├── types/              # TypeScript types
├── views/              # Page components
└── assets/             # Static assets
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Environment Variables**
   - Add all environment variables from your `.env` file
   - Make sure to update URLs for production

3. **Deploy**
   - Vercel will automatically build and deploy
   - Update your Google OAuth and Supabase settings with the production URL

### Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Add all environment variables
   - Update URLs for production

## 🔑 API Keys Setup

### OpenAI (Optional)

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an API key
3. Add to your environment variables

### Anthropic (Optional)

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create an API key
3. Add to your environment variables

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot apply unknown utility class" errors**
   - Make sure Tailwind CSS is properly configured
   - Check that PostCSS config is correct

2. **Supabase connection errors**
   - Verify your Supabase URL and anon key
   - Check that RLS policies are set up correctly

3. **Google OAuth not working**
   - Verify redirect URIs match exactly
   - Check that Google OAuth is enabled in Supabase

4. **Build errors**
   - Run `npm run type-check` to see TypeScript errors
   - Make sure all dependencies are installed

### Getting Help

- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review the [Supabase Documentation](https://supabase.com/docs)
- Check [Vue.js Documentation](https://vuejs.org/guide/)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the T3 Chat Cloneathon
- Inspired by the original T3 Chat
- Thanks to the Vue.js, Supabase, and Tailwind CSS communities
