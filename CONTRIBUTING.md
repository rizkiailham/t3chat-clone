# 🤝 Contributing to T3 Chat Clone

Thank you for your interest in contributing to T3 Chat Clone! This guide will help you get started with contributing to the project.

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Making Changes](#-making-changes)
- [Submitting Changes](#-submitting-changes)
- [Code Style Guidelines](#-code-style-guidelines)
- [Project Structure](#-project-structure)

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (recommended: Node.js 20 LTS)
- **npm** or **yarn** package manager
- **Git** for version control
- **GitHub account** for submitting pull requests

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/t3chat-clone.git
   cd t3chat-clone
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/t3chat-clone.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# See SETUP.md for detailed instructions
```

### 3. Database Setup

Follow the database setup instructions in [SETUP.md](SETUP.md) to configure Supabase.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🔄 Making Changes

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Development Workflow

1. **Make your changes** following the code style guidelines
2. **Test your changes** thoroughly
3. **Run quality checks**:
   ```bash
   npm run lint        # Fix linting issues
   npm run type-check  # Check TypeScript
   npm run format      # Format code
   npm run build       # Test production build
   ```

### 3. Commit Your Changes

Use conventional commit messages:

```bash
# Examples
git commit -m "feat: add conversation sharing feature"
git commit -m "fix: resolve authentication redirect issue"
git commit -m "docs: update setup instructions"
git commit -m "style: improve mobile responsiveness"
```

**Commit Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: UI/UX improvements
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 📤 Submitting Changes

### 1. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template with:
   - **Clear description** of changes
   - **Screenshots** for UI changes
   - **Testing instructions**
   - **Related issues** (if any)

### 3. PR Review Process

- **Automated checks** will run (CI/CD pipeline)
- **Code review** by maintainers
- **Address feedback** if requested
- **Merge** once approved

## 📝 Code Style Guidelines

### TypeScript

- Use **TypeScript** for all new code
- Define proper **interfaces** and **types**
- Avoid `any` types when possible
- Use **strict mode** settings

```typescript
// Good
interface User {
  id: string
  name: string
  email: string
}

// Avoid
const user: any = { ... }
```

### Vue.js

- Use **Composition API** for new components
- Follow **Vue 3** best practices
- Use **script setup** syntax
- Proper **prop definitions** with TypeScript

```vue
<script setup lang="ts">
interface Props {
  message: string
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true
})
</script>
```

### CSS/Styling

- Use **Tailwind CSS** for styling
- Follow **mobile-first** approach
- Use **semantic class names**
- Maintain **consistent spacing**

```vue
<!-- Good -->
<div class="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">

<!-- Avoid inline styles -->
<div style="display: flex; padding: 16px;">
```

### File Organization

- **Components**: PascalCase (e.g., `ChatInterface.vue`)
- **Services**: camelCase with `.service.ts` suffix
- **Types**: Descriptive interfaces in `types/` directory
- **Stores**: Feature-based organization

## 🏗️ Project Structure

```
src/
├── components/              # Vue components
│   ├── Chat/               # Chat-related components
│   │   ├── ChatInterface.vue
│   │   ├── MessageBubble.vue
│   │   └── ChatInput.vue
│   ├── Sidebar/            # Sidebar components
│   ├── Modals/             # Modal dialogs
│   └── UI/                 # Reusable UI components
├── services/               # Business logic & API
│   ├── auth.service.ts     # Authentication
│   ├── llm.service.ts      # AI/LLM providers
│   └── supabase.ts         # Database
├── stores/                 # Pinia state management
│   ├── auth.ts             # Authentication state
│   ├── chat.ts             # Chat state
│   └── settings.ts         # App settings
├── types/                  # TypeScript definitions
│   ├── index.ts            # Main types
│   └── database.ts         # Database types
├── views/                  # Page components
│   ├── Home.vue
│   ├── Login.vue
│   └── SharedConversation.vue
├── router/                 # Vue Router config
├── assets/                 # Static assets
└── utils/                  # Utility functions
```

## 🧪 Testing Guidelines

### Manual Testing

Before submitting a PR, test:

- **Authentication flow** (sign in/out)
- **Conversation management** (create, edit, delete)
- **Message sending** (if API keys configured)
- **Mobile responsiveness**
- **Dark/light theme switching**
- **Error handling**

### Automated Testing

- **CI/CD pipeline** runs automatically
- **Linting** and **type checking**
- **Build verification**
- **Security audit**

## 🐛 Reporting Issues

### Bug Reports

Include:
- **Clear description** of the issue
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (browser, OS, Node.js version)

### Feature Requests

Include:
- **Clear description** of the feature
- **Use case** and **motivation**
- **Proposed implementation** (if any)
- **Mockups** or **examples** (if applicable)

## 📞 Getting Help

- **GitHub Discussions**: Ask questions and get help
- **GitHub Issues**: Report bugs and request features
- **Code Comments**: Check inline documentation
- **README.md**: Comprehensive setup guide

## 🎉 Recognition

Contributors will be:
- **Listed** in the contributors section
- **Credited** in release notes
- **Mentioned** in project documentation

Thank you for contributing to T3 Chat Clone! 🚀
