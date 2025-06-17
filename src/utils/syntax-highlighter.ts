// Syntax highlighting using Prism.js
import Prism from 'prismjs'

// Import core languages that come with Prism by default
// JavaScript, CSS, and Markup (HTML) are included by default

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  java: '#ed8b00',
  csharp: '#239120',
  cpp: '#00599c',
  c: '#a8b9cc',
  php: '#777bb4',
  ruby: '#cc342d',
  go: '#00add8',
  rust: '#000000',
  swift: '#fa7343',
  kotlin: '#7f52ff',
  scala: '#dc322f',
  sql: '#336791',
  json: '#000000',
  yaml: '#cb171e',
  markdown: '#083fa1',
  bash: '#4eaa25',
  css: '#1572b6',
  html: '#e34f26',
  xml: '#e34f26'
}

export function highlightCode(code: string, language: string): string {
  try {
    const normalizedLanguage = normalizeLanguage(language)

    // Map our language names to Prism language names (only core languages)
    const prismLanguageMap: Record<string, string> = {
      'html': 'markup',
      'xml': 'markup',
      'js': 'javascript'
    }

    const prismLanguage = prismLanguageMap[normalizedLanguage] || normalizedLanguage

    // Only use languages that are available by default in Prism core
    const supportedLanguages = ['markup', 'css', 'javascript', 'clike']

    if (supportedLanguages.includes(prismLanguage) && Prism.languages[prismLanguage]) {
      return Prism.highlight(code, Prism.languages[prismLanguage], prismLanguage)
    } else {
      // Fallback to basic highlighting for unsupported languages
      return highlightBasic(code, normalizedLanguage)
    }
  } catch (error) {
    console.warn('Failed to highlight code:', error)
    return escapeHtml(code)
  }
}

// Basic highlighting for languages not supported by Prism core
function highlightBasic(code: string, language: string): string {
  const escaped = escapeHtml(code)

  if (language === 'python') {
    return escaped
      .replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|True|False|None)\b/g,
        '<span class="token keyword">$1</span>')
      .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="token string">$1$2$1</span>')
      .replace(/#.*$/gm, '<span class="token comment">$&</span>')
  } else if (language === 'json') {
    return escaped
      .replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span class="token property">$1</span>:')
      .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="token string">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="token boolean">$1</span>')
      .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="token number">$1</span>')
  }

  return escaped
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}



function normalizeLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'cs': 'csharp',
    'c++': 'cpp',
    'c#': 'csharp',
    'sh': 'bash',
    'shell': 'bash',
    'ps1': 'powershell',
    'yml': 'yaml',
    'md': 'markdown',
    'htm': 'html',
    'vue': 'html',
    'jsx': 'javascript',
    'tsx': 'typescript'
  }
  
  const normalized = language.toLowerCase().trim()
  return languageMap[normalized] || normalized
}

export function detectLanguage(code: string): string {
  // Simple language detection based on common patterns
  const trimmedCode = code.trim()

  const patterns = [
    { regex: /^<!DOCTYPE\s+html/i, language: 'html' },
    { regex: /^<html/i, language: 'html' },
    { regex: /^<\?php/, language: 'php' },
    { regex: /<[a-zA-Z][^>]*>/, language: 'html' }, // Generic HTML tag detection
    { regex: /^import\s+.*from\s+['"]/, language: 'javascript' },
    { regex: /^from\s+\w+\s+import/, language: 'python' },
    { regex: /^#include\s*</, language: 'cpp' },
    { regex: /^using\s+System/, language: 'csharp' },
    { regex: /^package\s+\w+/, language: 'java' },
    { regex: /^fn\s+\w+/, language: 'rust' },
    { regex: /^func\s+\w+/, language: 'go' },
    { regex: /^def\s+\w+/, language: 'python' },
    { regex: /^function\s+\w+/, language: 'javascript' },
    { regex: /^class\s+\w+/, language: 'java' },
    { regex: /^interface\s+\w+/, language: 'typescript' },
    { regex: /^SELECT\s+.*FROM/i, language: 'sql' },
    { regex: /^\s*{[\s\S]*}$/, language: 'json' },
  ]

  for (const pattern of patterns) {
    if (pattern.regex.test(trimmedCode)) {
      return pattern.language
    }
  }

  return 'text'
}

export function formatCodeBlock(content: string): string {
  // Enhanced code block detection and formatting with Gemini-like styling
  return content.replace(
    /```(\w+)?\n?([\s\S]*?)```/g,
    (_match, language, code) => {
      const detectedLanguage = language || detectLanguage(code)
      const highlightedCode = highlightCode(code.trim(), detectedLanguage)
      const _languageColor = LANGUAGE_COLORS[detectedLanguage] || '#8b5cf6'
      const languageIcon = getLanguageIcon(detectedLanguage)

      return `
      <div class="gemini-code-container">
        <div class="gemini-code-header" style="display: flex; justify-content: space-between; align-items: center;  margin-top: 20px">
          <div class="w-full gemini-code-info" style="display: flex; width: 100%">
            <div class="gemini-code-icon">${languageIcon}</div>
            <span class="gemini-code-language">${detectedLanguage.toUpperCase()}</span>
          </div>
          <button class="gemini-copy-btn" onclick="copyCodeBlock(this)" title="Copy code">
            <span class="copy-text" style="display: flex; min-width: 70px">Copy 📋</span>
          </button>
        </div>
        <div class="gemini-code-block"> 
          <div class="gemini-code-content">
            <pre class="gemini-code-pre"><code class="language-${detectedLanguage}">${highlightedCode}</code></pre>
          </div>
        </div>
      </div>`
    }
  )
}

function getLanguageIcon(language: string): string {
  const icons: Record<string, string> = {
    javascript: '🟨',
    typescript: '🔷',
    python: '🐍',
    java: '☕',
    csharp: '🔷',
    cpp: '⚡',
    c: '🔧',
    php: '🐘',
    ruby: '💎',
    go: '🐹',
    rust: '🦀',
    swift: '🍎',
    kotlin: '🎯',
    scala: '⚖️',
    sql: '🗃️',
    json: '📋',
    yaml: '📄',
    markdown: '📝',
    bash: '💻',
    css: '🎨',
    html: '🌐',
    xml: '📄',
    text: '📄'
  }
  return icons[language] || '📄'
}

// Global function for copying code blocks
declare global {
  interface Window {
    copyCodeBlock: (button: HTMLElement) => void
  }
}

if (typeof window !== 'undefined') {
  window.copyCodeBlock = function(button: HTMLElement) {
    const codeBlock = button.closest('.gemini-code-container')?.querySelector('code')
    if (codeBlock) {
      const text = codeBlock.textContent || ''
      navigator.clipboard.writeText(text).then(() => {
        const _copyText = button.querySelector('.copy-text')
        const originalText = button.innerHTML

        // Show success state
        button.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="copy-text">Copied!</span>`

        button.classList.add('copied')

        setTimeout(() => {
          button.innerHTML = originalText
          button.classList.remove('copied')
        }, 2000)
      }).catch(err => {
        console.error('Failed to copy code:', err)
        const copyText = button.querySelector('.copy-text')
        if (copyText) {
          copyText.textContent = 'Failed'
          setTimeout(() => {
            copyText.textContent = 'Copy'
          }, 2000)
        }
      })
    }
  }
}
