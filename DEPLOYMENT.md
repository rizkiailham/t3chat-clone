# 🚀 Production Deployment Guide

This guide will help you deploy T3 Chat Clone to production with automated CI/CD pipelines.

## 🎯 Quick Deploy Options

### Option 1: One-Click Deploy (Fastest)

#### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/t3chat-clone&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY,VITE_GOOGLE_CLIENT_ID&envDescription=Required%20environment%20variables%20for%20T3%20Chat%20Clone)

#### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/t3chat-clone)

### Option 2: Manual Setup (Full Control)

## 🔧 Pre-Deployment Setup

### 1. Environment Configuration

Create production environment variables:

```env
# Required - Core Services
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Optional - AI Providers (for BYOK)
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_GOOGLE_API_KEY=your-google-ai-api-key
VITE_PDFCO_API_KEY=your-pdfco-api-key

# Auto-configured
VITE_APP_NAME=T3 Chat Clone
VITE_APP_URL=https://your-domain.com
```

### 2. Database Setup

Ensure your Supabase database is production-ready:

```sql
-- Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';
```

### 3. OAuth Configuration

Update your Google OAuth settings:

**Google Cloud Console:**
- Add production domain to authorized origins
- Add production redirect URI: `https://your-project.supabase.co/auth/v1/callback`

**Supabase Auth:**
- Add production URL to allowed origins
- Verify Google provider is enabled

## 🚀 Vercel Deployment

### Manual Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   # Add environment variables via CLI
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add VITE_GOOGLE_CLIENT_ID production
   ```

4. **Custom Domain (Optional)**
   ```bash
   vercel domains add your-domain.com
   ```

### Dashboard Setup

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project" → Import from GitHub
3. Select your repository
4. Configure environment variables in Settings
5. Deploy!

## 🌐 Netlify Deployment

### Manual Setup

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Configure Environment Variables**
   ```bash
   # Add via CLI
   netlify env:set VITE_SUPABASE_URL "your-value"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-value"
   ```

### Dashboard Setup

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Site Settings
6. Deploy!

## 🔄 CI/CD Setup

### GitHub Actions (Included)

The repository includes automated CI/CD pipelines:

#### Required Secrets

Add these in GitHub Repository Settings > Secrets:

```env
# Vercel Integration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Optional - Notifications
SLACK_WEBHOOK_URL=your-slack-webhook
DISCORD_WEBHOOK_URL=your-discord-webhook
```

#### Getting Vercel Tokens

1. **Vercel Token**
   - Go to Vercel Dashboard > Settings > Tokens
   - Create new token with appropriate scope

2. **Organization ID**
   ```bash
   vercel teams list
   ```

3. **Project ID**
   ```bash
   vercel projects list
   ```

### Pipeline Features

- ✅ **Quality Checks**: Linting, formatting, type checking
- ✅ **Security Audit**: Dependency vulnerability scanning
- ✅ **Multi-Node Testing**: Tests on Node.js 18, 20, 22
- ✅ **Auto-Deploy**: Production deployment on main branch
- ✅ **Preview Deployments**: PR preview environments
- ✅ **Status Notifications**: Build status updates

## 📊 Post-Deployment

### 1. Verification Checklist

Test these features in production:

- [ ] ✅ Google OAuth sign-in works
- [ ] ✅ User profiles are created in Supabase
- [ ] ✅ Conversations can be created and saved
- [ ] ✅ Messages can be sent (if API keys configured)
- [ ] ✅ Conversation sharing works
- [ ] ✅ Guest mode functions properly
- [ ] ✅ Mobile responsiveness
- [ ] ✅ Dark/light theme switching
- [ ] ✅ File uploads work (images/PDFs)

### 2. Performance Monitoring

Set up monitoring for:

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Database usage and performance
- **Google Cloud Console**: OAuth usage and quotas
- **AI Provider Dashboards**: API usage and costs

### 3. Security Verification

- **RLS Policies**: Verify users can only access their data
- **Environment Variables**: Ensure secrets are not exposed
- **HTTPS**: Confirm SSL certificates are working
- **CORS**: Test cross-origin requests work properly

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build locally
npm run build

# Common fixes
npm ci                    # Clean install
npm run type-check       # Fix TypeScript errors
npm run lint             # Fix linting issues
```

#### 2. Environment Variable Issues
```bash
# Verify variables are set
vercel env ls
netlify env:list

# Common issues
- Missing VITE_ prefix
- Incorrect variable names
- Trailing spaces in values
```

#### 3. OAuth Redirect Errors
- Verify production domain in Google Console
- Check Supabase Auth allowed origins
- Ensure redirect URIs match exactly

#### 4. Database Connection Issues
- Verify Supabase URL and anon key
- Check RLS policies are enabled
- Confirm database schema is deployed

### Getting Help

- **GitHub Issues**: Report bugs and get help
- **Vercel Support**: Platform-specific issues
- **Netlify Support**: Platform-specific issues
- **Supabase Support**: Database and auth issues

## 🎉 Success!

Your T3 Chat Clone is now live in production with:

- ✅ Automated deployments on every push
- ✅ Preview environments for pull requests
- ✅ Quality assurance pipelines
- ✅ Security monitoring
- ✅ Performance optimization
- ✅ Global CDN distribution

Share your deployment URL and start chatting with AI! 🚀
