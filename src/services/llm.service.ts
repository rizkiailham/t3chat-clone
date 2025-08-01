import type { ChatRequest, ChatResponse, LLMProvider, LLMModel, Message } from '../types'

export class LLMService {
  private providers: LLMProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      requiresApiKey: true,
      models: [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          description: 'Most capable model, great for complex tasks',
          context_length: 128000,
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Fast and efficient for most tasks',
          context_length: 128000,
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and cost-effective',
          context_length: 16385,
        }
      ]
    },
    // {
    //   id: 'anthropic',
    //   name: 'Anthropic',
    //   requiresApiKey: true,
    //   models: [
    //     {
    //       id: 'claude-3-5-sonnet-20241022',
    //       name: 'Claude 3.5 Sonnet',
    //       description: 'Most intelligent model',
    //       context_length: 200000,
    //     },
    //     {
    //       id: 'claude-3-5-haiku-20241022',
    //       name: 'Claude 3.5 Haiku',
    //       description: 'Fastest model',
    //       context_length: 200000,
    //     }
    //   ]
    // },
    {
      id: 'google',
      name: 'Google',
      requiresApiKey: true,
      models: [
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          description: 'Latest and fastest Gemini model',
          context_length: 1000000,
        },
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Most capable Gemini model',
          context_length: 2000000,
        }
      ]
    }
  ]

  getProviders(): LLMProvider[] {
    return this.providers
  }

  /**
   * Get optimal max tokens for a model based on its capabilities
   * This replaces user-configurable max tokens with smart defaults
   */
  private getOptimalMaxTokens(provider: string, model: string): number {
    // Smart defaults based on model capabilities and use cases
    const modelConfig: Record<string, Record<string, number>> = {
      'openai': {
        'gpt-4o': 4096,           // High-quality responses
        'gpt-4o-mini': 4096,      // Efficient responses
        'gpt-3.5-turbo': 2048,    // Fast responses
        'default': 4096
      },
      'google': {
        'gemini-2.0-flash': 8192,    // Latest model, higher capacity
        'gemini-1.5-pro': 8192,      // Pro model, higher capacity
        'default': 8192
      },
      'anthropic': {
        'claude-3-5-sonnet-20241022': 4096,
        'claude-3-5-haiku-20241022': 4096,
        'default': 4096
      }
    }

    const providerConfig = modelConfig[provider]
    if (!providerConfig) {
      return 4096 // Safe default
    }

    return providerConfig[model] || providerConfig['default'] || 4096
  }

  getProvider(id: string): LLMProvider | undefined {
    return this.providers.find(p => p.id === id)
  }

  getModel(providerId: string, modelId: string): LLMModel | undefined {
    const provider = this.getProvider(providerId)
    return provider?.models.find(m => m.id === modelId)
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const { provider, model, messages, stream = false, temperature = 0.7, files } = request

    // Smart max tokens based on model capabilities
    const max_tokens = this.getOptimalMaxTokens(provider, model)

    // Check if we're in demo mode (no API keys configured)
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    const googleKey = import.meta.env.VITE_GOOGLE_API_KEY

    console.log('API Keys available:', {
      openai: !!openaiKey,
      anthropic: !!anthropicKey,
      google: !!googleKey
    })

    // If no API keys are configured, use demo mode
    if (!openaiKey && !anthropicKey && !googleKey) {
      console.log('No API keys found, using demo mode')
      return this.sendDemoMessage(request)
    }

    try {
      console.log(`Attempting to send message via ${provider}`)

      switch (provider) {
        case 'openai':
          if (!openaiKey) {
            console.log('OpenAI key not available, falling back to demo')
            return this.sendDemoMessage(request)
          }
          return this.sendOpenAIMessage({ model, messages, stream, temperature, max_tokens, files })
        case 'anthropic':
          if (!anthropicKey) {
            console.log('Anthropic key not available, falling back to demo')
            return this.sendDemoMessage(request)
          }
          return this.sendAnthropicMessage({ model, messages, stream, temperature, max_tokens })
        case 'google':
          if (!googleKey) {
            console.log('Google key not available, falling back to demo')
            return this.sendDemoMessage(request)
          }
          return this.sendGoogleMessage({ model, messages, stream, temperature, max_tokens, files })
        default:
          console.log(`Unknown provider ${provider}, using demo mode`)
          return this.sendDemoMessage(request)
      }
    } catch (error) {
      console.error(`Error with ${provider} provider:`, error)
      console.log('Falling back to demo mode due to error')
      return this.sendDemoMessage(request)
    }
  }

  async *streamMessage(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    const { provider, model, messages, temperature = 0.7, files } = request

    // Smart max tokens based on model capabilities
    const max_tokens = this.getOptimalMaxTokens(provider, model)

    // Check if we're in demo mode (no API keys configured)
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    const googleKey = import.meta.env.VITE_GOOGLE_API_KEY

    console.log(`🚀 Starting stream for ${provider}:`, {
      provider,
      model,
      messageCount: messages.length,
      hasFiles: !!files?.length,
      maxTokens: max_tokens
    })

    console.log('🔑 API Keys check:', {
      openai: !!openaiKey,
      anthropic: !!anthropicKey,
      google: !!googleKey
    })

    // If no API keys are configured, use demo mode
    if (!openaiKey && !anthropicKey && !googleKey) {
      console.log('No API keys found, using demo streaming')
      yield* this.streamDemoMessage(request)
      return
    }

    try {
      switch (provider) {
        case 'openai':
          if (!openaiKey) {
            console.log('OpenAI key not available, falling back to demo streaming')
            yield* this.streamDemoMessage(request)
            return
          }
          yield* this.streamOpenAIMessage({ model, messages, temperature, max_tokens, files })
          break
        case 'anthropic':
          if (!anthropicKey) {
            console.log('Anthropic key not available, falling back to demo streaming')
            yield* this.streamDemoMessage(request)
            return
          }
          yield* this.streamAnthropicMessage({ model, messages, temperature, max_tokens })
          break
        case 'google':
          if (!googleKey) {
            console.log('❌ Google key not available, falling back to demo streaming')
            yield* this.streamDemoMessage(request)
            return
          }
          console.log('✅ Google key available, calling streamGoogleMessage')
          yield* this.streamGoogleMessage({ model, messages, temperature, max_tokens, files })
          break
        default:
          console.log(`Unknown provider ${provider}, using demo streaming`)
          yield* this.streamDemoMessage(request)
          break
      }
    } catch (error) {
      console.error(`Streaming error with ${provider}:`, error)
      console.log('Falling back to demo streaming due to error')
      yield* this.streamDemoMessage(request)
    }
  }

  private async sendOpenAIMessage(params: any): Promise<ChatResponse> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
    }

    console.log('Sending OpenAI request:', {
      model: params.model,
      messageCount: params.messages.length,
      hasFiles: !!params.files?.length
    })

    try {
      // Format messages with file support
      const formattedMessages = this.formatOpenAIMessages(params.messages, params.files)

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: params.model,
          messages: formattedMessages,
          temperature: params.temperature || 0.7,
          max_tokens: params.max_tokens,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenAI API error:', response.status, errorData)
        throw new Error(`OpenAI API error (${response.status}): ${errorData}`)
      }

      const result = await response.json()
      console.log('OpenAI response received:', result)
      return result
    } catch (error) {
      console.error('OpenAI request failed:', error)
      throw error
    }
  }

  private async *streamOpenAIMessage(params: any): AsyncGenerator<string, void, unknown> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
    }

    console.log('Starting OpenAI stream:', { model: params.model, messageCount: params.messages.length })

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: params.model,
          messages: this.formatOpenAIMessages(params.messages, params.files),
          temperature: params.temperature || 0.7,
          max_tokens: params.max_tokens,
          stream: true
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenAI streaming error:', response.status, errorData)
        throw new Error(`OpenAI API error (${response.status}): ${errorData}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') return

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  yield content
                }
              } catch {
                // Skip invalid JSON
                console.warn('Failed to parse streaming data:', data)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('OpenAI streaming failed:', error)
      throw error
    }
  }

  private async sendAnthropicMessage(params: any): Promise<ChatResponse> {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('Anthropic API key not configured')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages.filter((m: Message) => m.role !== 'system').map((m: Message) => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: params.max_tokens,
        temperature: params.temperature
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Convert Anthropic response to OpenAI format
    return {
      id: data.id,
      object: 'chat.completion',
      created: Date.now(),
      model: params.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: data.content[0]?.text || ''
        },
        finish_reason: data.stop_reason || 'stop'
      }],
      usage: {
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    }
  }

  private async *streamAnthropicMessage(params: any): AsyncGenerator<string, void, unknown> {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('Anthropic API key not configured')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages.filter((m: Message) => m.role !== 'system').map((m: Message) => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text
                if (content) {
                  yield content
                }
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // Demo mode functions for when no API keys are configured
  private async sendDemoMessage(request: ChatRequest): Promise<ChatResponse> {
    const lastMessage = request.messages[request.messages.length - 1]
    const demoResponse = this.generateDemoResponse(lastMessage.content, request.provider)

    console.log(`Demo response generated for ${request.provider}:`, demoResponse.substring(0, 100) + '...')

    return {
      id: 'demo-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: demoResponse
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150
      }
    }
  }

  private async *streamDemoMessage(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    const lastMessage = request.messages[request.messages.length - 1]
    const demoResponse = this.generateDemoResponse(lastMessage.content, request.provider)

    console.log(`Demo streaming started for ${request.provider}`)

    // Simulate streaming by yielding chunks
    const words = demoResponse.split(' ')
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
      yield words[i] + (i < words.length - 1 ? ' ' : '')
    }

    console.log(`Demo streaming completed for ${request.provider}`)
  }

  private generateDemoResponse(userMessage: string, provider?: string): string {
    const providerSpecific = {
      openai: [
        `🤖 **GPT Demo Response**: You asked about "${userMessage}". This is a simulated GPT response. To get real OpenAI responses, add your VITE_OPENAI_API_KEY to the .env file.`,
        `🧠 **OpenAI Simulation**: Regarding "${userMessage}" - I'd provide a detailed analysis if this were the real GPT model. Configure your OpenAI API key to unlock actual AI conversations!`,
        `⚡ **GPT-4 Demo**: "${userMessage}" is an interesting topic! This is a placeholder response. Add your OpenAI API key to experience the real power of GPT models.`
      ],
      anthropic: [
        `🎭 **Claude Demo Response**: You mentioned "${userMessage}". This is a simulated Claude response. To chat with the real Claude, add your VITE_ANTHROPIC_API_KEY to the .env file.`,
        `🤔 **Anthropic Simulation**: About "${userMessage}" - I'd give you a thoughtful, nuanced response if this were the actual Claude model. Configure your Anthropic API key for real conversations!`,
        `📚 **Claude Demo**: "${userMessage}" deserves a proper response! This is just a demo. Add your Anthropic API key to unlock Claude's full capabilities.`
      ],
      google: [
        `🌟 **Gemini Demo Response**: You asked about "${userMessage}". This is a simulated Gemini response. To get real Google AI responses, add your VITE_GOOGLE_API_KEY to the .env file.`,
        `🚀 **Google AI Simulation**: Regarding "${userMessage}" - I'd provide multimodal insights if this were the real Gemini model. Configure your Google API key for actual AI conversations!`,
        `💎 **Gemini Demo**: "${userMessage}" is fascinating! This is a placeholder response. Add your Google API key to experience Gemini's advanced capabilities.`
      ]
    }

    const genericResponses = [
      `🤖 **Demo Mode**: You asked about "${userMessage}". This is a simulated AI response. To get real AI conversations, please configure your API keys in the .env file.`,
      `💭 **AI Simulation**: Thanks for your message about "${userMessage}". I'm currently in demo mode. Add your API keys to unlock real AI-powered conversations!`,
      `🎯 **Demo Response**: "${userMessage}" is an interesting topic! This is a placeholder. Configure your API credentials to start real conversations with AI models.`,
      `⭐ **Test Mode**: Regarding "${userMessage}" - I'd love to give you a proper response! Add your API keys to unlock the full chat experience.`,
      `🔧 **Demo Chat**: I see you're interested in "${userMessage}". This is a demo response. Configure your API keys to start real AI conversations.`
    ]

    const responses = provider && providerSpecific[provider as keyof typeof providerSpecific]
      ? providerSpecific[provider as keyof typeof providerSpecific]
      : genericResponses

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Google/Gemini API implementation
  private async sendGoogleMessage(params: any): Promise<ChatResponse> {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('Google API key not configured. Please add VITE_GOOGLE_API_KEY to your .env file.')
    }

    console.log('Sending Google/Gemini request:', {
      model: params.model,
      messageCount: params.messages.length,
      hasFiles: !!params.files?.length
    })

    try {
      // Convert messages to Gemini format with file support
      const contents = this.convertToGeminiFormat(params.messages, params.files)

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: params.temperature || 0.7,
            maxOutputTokens: params.max_tokens,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Google API error:', response.status, errorData)
        throw new Error(`Google API error (${response.status}): ${errorData}`)
      }

      const result = await response.json()
      console.log('Google response received:', result)

      // Convert to OpenAI format
      return {
        id: 'google-' + Date.now(),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: params.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
          completion_tokens: result.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: result.usageMetadata?.totalTokenCount || 0
        }
      }
    } catch (error) {
      console.error('Google request failed:', error)
      throw error
    }
  }

  private async *streamGoogleMessage(params: any): AsyncGenerator<string, void, unknown> {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('Google API key not configured. Please add VITE_GOOGLE_API_KEY to your .env file.')
    }

    console.log('Starting Google/Gemini stream:', { model: params.model, messageCount: params.messages.length })

    try {
      // Convert messages to Gemini format with file support
      const contents = this.convertToGeminiFormat(params.messages, params.files)

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${params.model}:streamGenerateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: params.temperature || 0.7,
            maxOutputTokens: params.max_tokens,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Google streaming error:', response.status, errorData)

        // If streaming fails (503 overloaded), fallback to non-streaming
        if (response.status === 503) {
          console.log('Streaming overloaded, falling back to non-streaming...')
          const nonStreamResponse = await this.sendGoogleMessage(params)
          const content = nonStreamResponse.choices[0].message.content

          // Simulate streaming by yielding the content in chunks
          const words = content.split(' ')
          for (let i = 0; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 30))
            yield words[i] + (i < words.length - 1 ? ' ' : '')
          }
          return
        }

        throw new Error(`Google API error (${response.status}): ${errorData}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              const data = line.slice(6)

              try {
                const parsed = JSON.parse(data)
                const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text
                if (content) {
                  yield content
                }
              } catch {
                console.warn('Failed to parse Google streaming data:', data)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('Google streaming failed:', error)
      throw error
    }
  }

  private convertToGeminiFormat(messages: any[], files?: any[]): any[] {
    const contents = []

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      const isLastMessage = i === messages.length - 1

      if (message.role === 'system') {
        // Gemini doesn't have system role, so we'll add it as user context
        contents.push({
          role: 'user',
          parts: [{ text: `System: ${message.content}` }]
        })
      } else {
        const parts = [{ text: message.content }]

        // Add files to the last user message
        if (isLastMessage && message.role === 'user' && files && files.length > 0) {
          files.forEach(file => {
            if (file.type === 'image') {
              // Extract base64 data without data URL prefix
              const base64Data = file.base64.split(',')[1]
              parts.push({
                inline_data: {
                  mime_type: file.file.type,
                  data: base64Data
                }
              } as any) // Type assertion for Gemini API
            } else if (file.type === 'pdf') {
              // Enhanced PDF processing with parsed content
              const pdfContent = this.formatPDFContentForAI(file)
              parts.push({
                text: pdfContent
              })

              // Add extracted images from PDF if any
              if (file.pdfData?.images && file.pdfData.images.length > 0) {
                file.pdfData.images.forEach((pdfImage: any) => {
                  parts.push({
                    inline_data: {
                      mime_type: 'image/png', // PDF images are converted to PNG
                      data: pdfImage.base64.split(',')[1] // Remove data URL prefix
                    }
                  } as any) // Type assertion for Gemini API
                })
              }
            }
          })
        }

        contents.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts
        })
      }
    }

    return contents
  }

  /**
   * Format messages for OpenAI API with file support
   */
  private formatOpenAIMessages(messages: any[], files?: any[]): any[] {
    const formattedMessages = messages.map((m: any, index: number) => {
      const isLastMessage = index === messages.length - 1
      const message: any = {
        role: m.role,
        content: []
      }

      // Add text content
      if (m.content) {
        message.content.push({
          type: 'text',
          text: m.content
        })
      }

      // Add file content if this is the last message and has files
      if (isLastMessage && files && files.length > 0) {
        files.forEach(file => {
          if (file.type === 'image') {
            message.content.push({
              type: 'image_url',
              image_url: {
                url: file.base64
              }
            })
          } else if (file.type === 'pdf') {
            // Enhanced PDF processing with parsed content
            const pdfContent = this.formatPDFContentForAI(file)
            message.content.push({
              type: 'text',
              text: pdfContent
            })

            // Add extracted images from PDF if any
            if (file.pdfData?.images && file.pdfData.images.length > 0) {
              file.pdfData.images.forEach((pdfImage: any) => {
                message.content.push({
                  type: 'image_url',
                  image_url: {
                    url: pdfImage.base64
                  }
                })
              })
            }
          }
        })
      }

      // If only one text content, use string format for compatibility
      if (message.content.length === 1 && message.content[0].type === 'text') {
        message.content = message.content[0].text
      }

      return message
    })

    return formattedMessages
  }

  /**
   * Format PDF content for AI analysis
   */
  private formatPDFContentForAI(file: any): string {
    const fileName = file.file.name
    const fileSize = this.formatFileSize(file.file.size)

    console.log('🔍 Formatting PDF content for AI:', {
      fileName,
      fileSize,
      hasPdfData: !!file.pdfData,
      pdfData: file.pdfData
    })

    // Check if we have parsed PDF data
    if (!file.pdfData) {
      console.warn('⚠️ No PDF data available for AI analysis')
      return `\n\n📄 **PDF File: ${fileName}** (${fileSize})\n\n⚠️ PDF parsing was not available. Please analyze this PDF based on the filename and provide general guidance about PDF analysis.`
    }

    const { text, images, tables, metadata } = file.pdfData

    console.log('📊 PDF data breakdown:', {
      textLength: text?.length || 0,
      imagesCount: images?.length || 0,
      tablesCount: tables?.length || 0,
      metadata
    })

    let content = `\n\n📄 **PDF Document Analysis: ${fileName}** (${fileSize})\n\n`

    // Service info
    content += `🔧 **Parsed with:** ${this.getServiceDisplayName(metadata.service)}\n`
    content += `📊 **Document Info:** ${metadata.pages} page(s)\n\n`

    // Content summary
    const features = []
    if (metadata.hasText && text) features.push(`📝 Text content (${text.length} characters)`)
    if (metadata.hasImages && images.length > 0) features.push(`🖼️ ${images.length} image(s)`)
    if (metadata.hasTables && tables.length > 0) features.push(`📋 ${tables.length} table(s)`)

    if (features.length > 0) {
      content += `✨ **Extracted Content:** ${features.join(', ')}\n\n`
    }

    // Add extracted text
    if (text && text.trim()) {
      content += `📝 **Document Text Content:**\n\n${text}\n\n`
      console.log('✅ Added text content to AI prompt:', text.substring(0, 200) + '...')
    } else {
      console.warn('⚠️ No text content available from PDF parsing')
      console.warn('⚠️ Text value:', text)
      console.warn('⚠️ Text type:', typeof text)
      console.warn('⚠️ Text length:', text?.length)

      // Add a more helpful message for the AI
      content += `⚠️ **No text content was extracted from this PDF.**

**Possible reasons:**
- The PDF contains only images/scanned content (requires OCR)
- The PDF is password protected
- The PDF has complex formatting that wasn't parsed correctly
- The parsing service encountered a technical issue

**What you can do:**
- Try asking me to describe what I can see if there are images
- Ask me to analyze the document structure or layout
- Request a different type of analysis based on the filename: "${fileName}"

**PDF Information Available:**
- File name: ${fileName}
- File size: ${fileSize}
- Pages: ${metadata?.pages || 'Unknown'}
- Service used: ${this.getServiceDisplayName(metadata?.service || 'unknown')}

`
    }

    // Add table data
    if (tables && tables.length > 0) {
      content += `📋 **Tables Found (${tables.length}):**\n\n`
      tables.forEach((table: any, index: number) => {
        content += `**Table ${index + 1}:**\n`
        if (table.html) {
          content += `${table.html}\n\n`
        } else if (table.text) {
          content += `${table.text}\n\n`
        }
      })
      console.log('✅ Added table data to AI prompt')
    }

    // Add image descriptions
    if (images && images.length > 0) {
      content += `🖼️ **Images Found (${images.length}):**\n\n`
      images.forEach((image: any, index: number) => {
        content += `**Image ${index + 1}:** ${image.description || `Image from PDF page`}\n`
      })
      content += `\n(Images are included separately for visual analysis)\n\n`
      console.log('✅ Added image descriptions to AI prompt')
    }

    content += `🤖 **Analysis Request:** Please analyze this PDF document thoroughly. Pay attention to the extracted text, tables, and any images. Provide insights, summaries, or answer questions based on the content.`

    console.log('📤 Final PDF content for AI (length):', content.length)
    console.log('📤 Final PDF content preview:', content.substring(0, 500) + '...')

    return content
  }

  /**
   * Get display name for parsing service
   */
  private getServiceDisplayName(service: string): string {
    const serviceNames: Record<string, string> = {
      'pdf-co': 'PDF.co (PREMIUM)'
    }
    return serviceNames[service] || service
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const llmService = new LLMService()
