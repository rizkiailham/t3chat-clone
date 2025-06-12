import { axiosAuthService } from './axios-auth.service'
import type { Message, Conversation, User } from '../types'
import axios from 'axios'

// Axios-based database operations that bypass Supabase's fetch
export const axiosDb = {
  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    console.log(`🔍 Axios: Getting messages for conversation: ${conversationId}`)

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.get(`${baseURL}/rest/v1/messages`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          'conversation_id': `eq.${conversationId}`,
          'order': 'created_at.asc',
          'select': '*'
        },
        timeout: 10000
      })

      console.log(`✅ Axios: Successfully fetched ${response.data?.length || 0} messages`)
      return response.data || []

    } catch (error: any) {
      console.error('❌ Axios: Failed to get messages:', error.message)
      throw error
    }
  },

  async createMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    console.log('🔍 Axios: Creating message...')

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.post(`${baseURL}/rest/v1/messages`, message, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 10000
      })

      const createdMessage = Array.isArray(response.data) ? response.data[0] : response.data
      console.log('✅ Axios: Message created successfully')
      return createdMessage

    } catch (error: any) {
      console.error('❌ Axios: Failed to create message:', error.message)
      throw error
    }
  },

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    console.log(`🔍 Axios: Updating message: ${id}`)

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.patch(`${baseURL}/rest/v1/messages?id=eq.${id}`, updates, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 10000
      })

      const updatedMessage = Array.isArray(response.data) ? response.data[0] : response.data
      console.log('✅ Axios: Message updated successfully')
      return updatedMessage

    } catch (error: any) {
      console.error('❌ Axios: Failed to update message:', error.message)
      throw error
    }
  },

  async deleteMessage(id: string): Promise<void> {
    console.log(`🔍 Axios: Deleting message: ${id}`)

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      await axios.delete(`${baseURL}/rest/v1/messages?id=eq.${id}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      console.log('✅ Axios: Message deleted successfully')

    } catch (error: any) {
      console.error('❌ Axios: Failed to delete message:', error.message)
      throw error
    }
  },

  // Conversations
  async getConversations(userId: string): Promise<Conversation[]> {
    console.log(`🔍 Axios: Getting conversations for user: ${userId}`)

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.get(`${baseURL}/rest/v1/conversations`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          'user_id': `eq.${userId}`,
          'order': 'updated_at.desc',
          'select': '*'
        },
        timeout: 10000
      })

      console.log(`✅ Axios: Successfully fetched ${response.data?.length || 0} conversations`)
      return response.data || []

    } catch (error: any) {
      console.error('❌ Axios: Failed to get conversations:', error.message)
      throw error
    }
  },

  async createConversation(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>): Promise<Conversation> {
    console.log('🔍 Axios: Creating conversation...')

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.post(`${baseURL}/rest/v1/conversations`, conversation, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 10000
      })

      const createdConversation = Array.isArray(response.data) ? response.data[0] : response.data
      console.log('✅ Axios: Conversation created successfully')
      return createdConversation

    } catch (error: any) {
      console.error('❌ Axios: Failed to create conversation:', error.message)
      throw error
    }
  },

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    console.log(`🔍 Axios: Updating conversation: ${id}`)

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.patch(`${baseURL}/rest/v1/conversations?id=eq.${id}`, updates, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 10000
      })

      const updatedConversation = Array.isArray(response.data) ? response.data[0] : response.data
      console.log('✅ Axios: Conversation updated successfully')
      return updatedConversation

    } catch (error: any) {
      console.error('❌ Axios: Failed to update conversation:', error.message)
      throw error
    }
  },

  async deleteConversation(id: string): Promise<void> {
    console.log(`🔍 Axios: Deleting conversation: ${id}`)

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      await axios.delete(`${baseURL}/rest/v1/conversations?id=eq.${id}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      console.log('✅ Axios: Conversation deleted successfully')

    } catch (error: any) {
      console.error('❌ Axios: Failed to delete conversation:', error.message)
      throw error
    }
  },

  // Users
  async getUser(id: string): Promise<User> {
    console.log(`🔍 Axios: Getting user: ${id}`)

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.get(`${baseURL}/rest/v1/users`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          'id': `eq.${id}`,
          'select': '*'
        },
        timeout: 10000
      })

      const user = Array.isArray(response.data) ? response.data[0] : response.data

      if (!user) {
        throw new Error('User not found')
      }

      console.log('✅ Axios: User fetched successfully')
      return user

    } catch (error: any) {
      console.error('❌ Axios: Failed to get user:', error.message)
      throw error
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    console.log(`🔍 Axios: Updating user: ${id}`)

    try {
      const baseURL = import.meta.env.VITE_SUPABASE_URL
      const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const accessToken = await axiosAuthService.getAccessToken()

      if (!accessToken) {
        throw new Error('No access token available')
      }

      const response = await axios.patch(`${baseURL}/rest/v1/users?id=eq.${id}`, updates, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 10000
      })

      const updatedUser = Array.isArray(response.data) ? response.data[0] : response.data
      console.log('✅ Axios: User updated successfully')
      return updatedUser

    } catch (error: any) {
      console.error('❌ Axios: Failed to update user:', error.message)
      throw error
    }
  }
}