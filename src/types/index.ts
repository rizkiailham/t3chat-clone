export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  title: string
  user_id: string
  created_at: string
  updated_at: string
  model_provider: string
  model_name: string
  system_prompt?: string
  is_shared?: boolean
  share_id?: string
  shared_at?: string
}

export interface MessageAttachment {
  name: string
  type: 'image' | 'pdf'
  size: number
  base64: string
  content?: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  metadata?: {
    model?: string
    tokens?: number
    finish_reason?: string
    files?: number // Number of files attached
    attachments?: MessageAttachment[] // File attachment data
    [key: string]: any // Allow additional metadata
  }
}

export interface LLMProvider {
  id: string
  name: string
  models: LLMModel[]
  requiresApiKey: boolean
  baseUrl?: string
}

export interface LLMModel {
  id: string
  name: string
  description?: string
  context_length: number
  input_cost_per_token?: number
  output_cost_per_token?: number
}

export interface FileAttachment {
  file: File
  type: 'image' | 'pdf'
  base64: string
  content?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  files?: FileAttachment[]
}

export interface ChatRequest {
  messages: ChatMessage[]
  model: string
  provider: string
  stream?: boolean
  temperature?: number
  max_tokens?: number
  files?: FileAttachment[]
}

export interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  defaultModel: string
  defaultProvider: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}

export interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  error: string | null
}

export interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  loading: boolean
  streaming: boolean
  error: string | null
}

export interface SettingsState {
  settings: AppSettings
  providers: LLMProvider[]
  loading: boolean
  error: string | null
}
