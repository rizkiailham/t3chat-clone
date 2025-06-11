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
    {
      id: 'anthropic',
      name: 'Anthropic',
      requiresApiKey: true,
      models: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          description: 'Most intelligent model',
          context_length: 200000,
        },
        {
          id: 'claude-3-5-haiku-20241022',
          name: 'Claude 3.5 Haiku',
          description: 'Fastest model',
          context_length: 200000,
        }
      ]
    }
  ]

  getProviders(): LLMProvider[] {
    return this.providers
  }

  getProvider(id: string): LLMProvider | undefined {
    return this.providers.find(p => p.id === id)
  }

  getModel(providerId: string, modelId: string): LLMModel | undefined {
    const provider = this.getProvider(providerId)
    return provider?.models.find(m => m.id === modelId)
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const { provider, model, messages, stream = false, temperature = 0.7, max_tokens = 4000 } = request

    // Check if we're in demo mode (no API keys configured)
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (!openaiKey && !anthropicKey) {
      return this.sendDemoMessage(request)
    }

    switch (provider) {
      case 'openai':
        return this.sendOpenAIMessage({ model, messages, stream, temperature, max_tokens })
      case 'anthropic':
        return this.sendAnthropicMessage({ model, messages, stream, temperature, max_tokens })
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  async *streamMessage(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    const { provider, model, messages, temperature = 0.7, max_tokens = 4000 } = request

    // Check if we're in demo mode (no API keys configured)
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (!openaiKey && !anthropicKey) {
      yield* this.streamDemoMessage(request)
      return
    }

    switch (provider) {
      case 'openai':
        yield* this.streamOpenAIMessage({ model, messages, temperature, max_tokens })
        break
      case 'anthropic':
        yield* this.streamAnthropicMessage({ model, messages, temperature, max_tokens })
        break
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  private async sendOpenAIMessage(params: any): Promise<ChatResponse> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
    }

    console.log('Sending OpenAI request:', { model: params.model, messageCount: params.messages.length })

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: params.model,
          messages: params.messages.map((m: any) => ({
            role: m.role,
            content: m.content
          })),
          temperature: params.temperature || 0.7,
          max_tokens: params.max_tokens || 4000,
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
          messages: params.messages.map((m: any) => ({
            role: m.role,
            content: m.content
          })),
          temperature: params.temperature || 0.7,
          max_tokens: params.max_tokens || 4000,
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
              } catch (e) {
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
            } catch (e) {
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
    const demoResponse = this.generateDemoResponse(lastMessage.content)

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
    const demoResponse = this.generateDemoResponse(lastMessage.content)

    // Simulate streaming by yielding chunks
    const words = demoResponse.split(' ')
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
      yield words[i] + (i < words.length - 1 ? ' ' : '')
    }
  }

  private generateDemoResponse(userMessage: string): string {
    const responses = [
      `I understand you're asking about "${userMessage}". This is a demo response since no API keys are configured. To get real AI responses, please add your OpenAI or Anthropic API key to the .env file.`,

      `Thanks for your message: "${userMessage}". I'm currently running in demo mode. To enable real AI conversations, please configure your API keys in the environment variables.`,

      `You said: "${userMessage}". This is a simulated response. For actual AI-powered conversations, please set up your API credentials in the .env file.`,

      `Regarding "${userMessage}" - I'd love to give you a proper response! However, I'm in demo mode right now. Add your API keys to unlock the full chat experience.`,

      `I see you're interested in "${userMessage}". This is a placeholder response. Configure your OpenAI or Anthropic API key to start real conversations with AI models.`
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }
}
