import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 't3chat-clone'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Enhanced connection health and session management
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Checking Supabase connection...')

    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError)
      return false
    }

    if (!session) {
      console.error('❌ No active session found')
      return false
    }

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      console.error('❌ Session expired')
      return false
    }

    // Test database connectivity with a simple query
    const { error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('❌ Database connectivity check failed:', error)
      return false
    }

    console.log('✅ Supabase connection and session healthy')
    return true
  } catch (error) {
    console.error('❌ Supabase connection check error:', error)
    return false
  }
}

export async function refreshSupabaseSession(): Promise<boolean> {
  try {
    console.log('🔄 Refreshing Supabase session...')

    // Get current session first
    const { data: { session: currentSession } } = await supabase.auth.getSession()

    if (!currentSession) {
      console.error('❌ No session to refresh')
      return false
    }

    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('❌ Failed to refresh Supabase session:', error)
      return false
    }

    if (!data.session) {
      console.error('❌ No session returned after refresh')
      return false
    }

    console.log('✅ Supabase session refreshed successfully')
    return true
  } catch (error) {
    console.error('❌ Error refreshing Supabase session:', error)
    return false
  }
}

// Ultra-robust database operations with comprehensive validation and retry logic
async function withConnectionValidation<T>(operation: () => Promise<T>, retries = 5): Promise<T> {
  let lastError: any = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Database operation attempt ${attempt + 1}/${retries + 1}`)

      // Pre-operation validation (skip on first attempt for performance)
      if (attempt > 0) {
        console.log('� Pre-operation connection validation...')

        // Check connection health
        const isHealthy = await checkSupabaseConnection()
        if (!isHealthy) {
          console.log('🔄 Connection unhealthy, attempting session refresh...')
          const refreshed = await refreshSupabaseSession()
          if (!refreshed) {
            console.error('❌ Session refresh failed')
            // Continue anyway, let the operation fail and retry
          }
        }

        // Progressive delay between retries
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff, max 5s
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Execute the operation
      console.log('🚀 Executing database operation...')
      const result = await operation()
      console.log('✅ Database operation successful')
      return result

    } catch (error: any) {
      lastError = error
      console.error(`❌ Database operation failed (attempt ${attempt + 1}):`, {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })

      // Analyze error type for recovery strategy
      const isAuthError = error.message?.includes('JWT') ||
                         error.message?.includes('auth') ||
                         error.message?.includes('session') ||
                         error.message?.includes('expired') ||
                         error.code === 'PGRST301' ||
                         error.code === 'PGRST116' ||
                         error.status === 401

      const isNetworkError = error.message?.includes('fetch') ||
                            error.message?.includes('network') ||
                            error.message?.includes('timeout') ||
                            error.code === 'NETWORK_ERROR'

      const isRetryableError = isAuthError || isNetworkError

      // If we have retries left and it's a retryable error
      if (attempt < retries && isRetryableError) {
        if (isAuthError) {
          console.log('� Auth error detected, forcing session refresh...')
          await refreshSupabaseSession()
        }

        if (isNetworkError) {
          console.log('🌐 Network error detected, will retry...')
        }

        continue // Retry the operation
      }

      // If no retries left or non-retryable error, throw
      if (attempt === retries) {
        console.error('❌ Max retries exceeded, operation failed permanently')
        throw lastError
      }
    }
  }

  throw lastError || new Error('Operation failed after all retries')
}

// Database helper functions with robust connection handling
export const db = {
  // Users
  async getUser(id: string) {
    return withConnectionValidation(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    })
  },

  async updateUser(id: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
    return withConnectionValidation(async () => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  // Conversations
  async getConversations(userId: string) {
    return withConnectionValidation(async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    })
  },

  async createConversation(conversation: Database['public']['Tables']['conversations']['Insert']) {
    return withConnectionValidation(async () => {
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversation)
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  async updateConversation(id: string, updates: Partial<Database['public']['Tables']['conversations']['Update']>) {
    return withConnectionValidation(async () => {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  async deleteConversation(id: string) {
    return withConnectionValidation(async () => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)

      if (error) throw error
    })
  },

  // Messages
  async getMessages(conversationId: string) {
    console.log(`🔍 Getting messages for conversation: ${conversationId}`)
    return withConnectionValidation(async () => {
      console.log(`📥 Fetching messages from database for conversation: ${conversationId}`)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Database error in getMessages:', error)
        throw error
      }

      console.log(`✅ Successfully fetched ${data?.length || 0} messages`)
      return data || []
    })
  },

  async createMessage(message: Database['public']['Tables']['messages']['Insert']) {
    return withConnectionValidation(async () => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  async updateMessage(id: string, updates: Partial<Database['public']['Tables']['messages']['Update']>) {
    return withConnectionValidation(async () => {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  async deleteMessage(id: string) {
    return withConnectionValidation(async () => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)

      if (error) throw error
    })
  }
}
