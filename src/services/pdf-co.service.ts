import axios from 'axios'

export interface PDFCoParseResult {
  text: string
  images: PDFCoImage[]
  tables: PDFCoTable[]
  metadata: {
    pages: number
    fileSize: number
    fileName: string
    processingTime: number
    service: 'pdf-co'
    hasText: boolean
    hasImages: boolean
    hasTables: boolean
    confidence: number
  }
}

export interface PDFCoImage {
  id: string
  base64: string
  type: 'image'
  page: number
  description?: string
  coordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface PDFCoTable {
  id: string
  html: string
  text: string
  csv: string
  type: 'table'
  page: number
  rows: number
  columns: number
  coordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export class PDFCoService {
  private readonly API_KEY = import.meta.env.VITE_PDFCO_API_KEY || ''
  private readonly BASE_URL = 'https://api.pdf.co/v1'
  
  constructor() {
    if (!this.API_KEY) {
      console.warn('⚠️ PDF.co API key not configured. Set VITE_PDFCO_API_KEY in your .env file')
    }
  }

  /**
   * Check if PDF.co is properly configured
   */
  isConfigured(): boolean {
    const configured = !!this.API_KEY
    console.log('🔧 PDF.co configuration check:', {
      configured,
      apiKeyLength: this.API_KEY?.length || 0,
      baseUrl: this.BASE_URL
    })
    return configured
  }

  /**
   * Parse PDF file using PDF.co API
   */
  async parsePDF(file: File): Promise<PDFCoParseResult> {
    if (!this.isConfigured()) {
      throw new Error('PDF.co API key not configured')
    }

    const startTime = Date.now()
    
    try {
      console.log('📄 Starting PDF.co parsing for:', file.name)

      // Step 1: Upload file to PDF.co
      const uploadUrl = await this.uploadFile(file)
      console.log('✅ File uploaded to PDF.co')

      // Step 2: Extract text (async)
      const textResult = await this.extractText(uploadUrl)
      console.log('✅ Text extracted via async processing')

      // Step 3: Extract tables (async)
      const tablesResult = await this.extractTables(uploadUrl)
      console.log('✅ Tables extracted via async processing')

      // Step 4: Extract images (async)
      const imagesResult = await this.extractImages(uploadUrl)
      console.log('✅ Images extracted via async processing')

      // Step 5: Get document info
      const docInfo = await this.getDocumentInfo(uploadUrl)
      console.log('✅ Document info retrieved')

      const result: PDFCoParseResult = {
        text: textResult.text || '',
        images: imagesResult,
        tables: tablesResult,
        metadata: {
          pages: docInfo.pageCount || 1,
          fileSize: file.size,
          fileName: file.name,
          processingTime: Date.now() - startTime,
          service: 'pdf-co',
          hasText: (textResult.text || '').length > 0,
          hasImages: imagesResult.length > 0,
          hasTables: tablesResult.length > 0,
          confidence: textResult.confidence || 0.95
        }
      }

      console.log('✅ PDF.co parsing completed:', {
        pages: result.metadata.pages,
        textLength: result.text.length,
        imageCount: result.images.length,
        tableCount: result.tables.length,
        processingTime: result.metadata.processingTime
      })

      return result

    } catch (error) {
      console.error('❌ PDF.co parsing failed:', error)
      throw new Error(`PDF.co parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Upload file to PDF.co and get URL
   */
  private async uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${this.BASE_URL}/file/upload`, formData, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      })

      console.log('PDF.co upload response:', response.data)

      if (!response.data || response.data.error) {
        throw new Error(`PDF.co upload error: ${response.data?.error || 'Unknown error'}`)
      }

      if (!response.data.url) {
        throw new Error('PDF.co did not return a file URL')
      }

      return response.data.url
    } catch (error: any) {
      console.error('PDF.co upload failed:', error)
      if (error.response) {
        console.error('PDF.co error response:', error.response.data)
        throw new Error(`PDF.co API error (${error.response.status}): ${error.response.data?.message || error.response.data?.error || 'Upload failed'}`)
      }
      throw new Error(`PDF.co upload failed: ${error.message}`)
    }
  }

  /**
   * Extract text from PDF using PDF.co (async mode)
   */
  private async extractText(url: string): Promise<{ text: string; confidence: number }> {
    try {
      console.log('🔄 Starting async text extraction...')

      // Start async job
      const response = await axios.post(`${this.BASE_URL}/pdf/convert/to/text`, {
        url: url,
        inline: false, // Don't return result inline
        async: true    // Use async mode
      }, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout for job creation
      })

      console.log('PDF.co text extraction job response:', response.data)

      if (response.data.error) {
        throw new Error(`PDF.co text extraction error: ${response.data.error}`)
      }

      if (!response.data.jobId) {
        throw new Error('PDF.co did not return a job ID for text extraction')
      }

      // Poll for job completion
      const result = await this.pollJobCompletion(response.data.jobId, 'text extraction')

      // Try different possible fields for the extracted text
      const extractedText = result.body || result.text || result.content || result.data || ''
      console.log('📝 Text extraction result:', {
        textLength: extractedText.length,
        textPreview: extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''),
        confidence: result.confidence || 0.95,
        availableFields: Object.keys(result),
        resultStructure: result
      })

      // If no text was extracted, try to get it from the URL if provided
      if (!extractedText && result.url) {
        try {
          console.log('📥 Attempting to fetch text from URL:', result.url)
          const textResponse = await axios.get(result.url)
          const urlText = textResponse.data || ''
          console.log('📥 Text from URL:', {
            textLength: urlText.length,
            textPreview: urlText.substring(0, 200) + (urlText.length > 200 ? '...' : '')
          })
          return {
            text: urlText,
            confidence: result.confidence || 0.95
          }
        } catch (urlError) {
          console.warn('⚠️ Failed to fetch text from URL:', urlError)
        }
      }

      return {
        text: extractedText,
        confidence: result.confidence || 0.95
      }
    } catch (error: any) {
      console.error('PDF.co text extraction failed:', error)
      if (error.response) {
        console.error('PDF.co text error response:', error.response.data)
        throw new Error(`PDF.co text extraction error (${error.response.status}): ${error.response.data?.message || error.response.data?.error || 'Text extraction failed'}`)
      }
      throw new Error(`PDF.co text extraction failed: ${error.message}`)
    }
  }

  /**
   * Poll for job completion
   */
  private async pollJobCompletion(jobId: string, operation: string): Promise<any> {
    const maxAttempts = 30 // 30 attempts
    const pollInterval = 2000 // 2 seconds between polls

    console.log(`🔄 Polling job ${jobId} for ${operation}...`)

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${this.BASE_URL}/job/check`, {
          params: { jobId },
          headers: {
            'x-api-key': this.API_KEY
          },
          timeout: 10000 // 10 second timeout for job check
        })

        console.log(`📊 Job ${jobId} attempt ${attempt}:`, response.data.status)

        if (response.data.error) {
          throw new Error(`PDF.co job error: ${response.data.error}`)
        }

        // Job completed successfully
        if (response.data.status === 'success') {
          console.log(`✅ Job ${jobId} completed successfully`)
          console.log('📊 Full response data:', response.data)
          return response.data
        }

        // Job failed
        if (response.data.status === 'error') {
          throw new Error(`PDF.co job failed: ${response.data.error || 'Unknown error'}`)
        }

        // Job still processing, wait and retry
        if (response.data.status === 'working' || response.data.status === 'pending') {
          console.log(`⏳ Job ${jobId} still processing (${response.data.status}), waiting ${pollInterval}ms...`)
          await new Promise(resolve => setTimeout(resolve, pollInterval))
          continue
        }

        // Unknown status
        console.warn(`⚠️ Unknown job status: ${response.data.status}`)

      } catch (error: any) {
        if (attempt === maxAttempts) {
          throw new Error(`PDF.co job polling failed after ${maxAttempts} attempts: ${error.message}`)
        }
        console.warn(`⚠️ Job polling attempt ${attempt} failed, retrying...`, error.message)
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }

    throw new Error(`PDF.co job ${jobId} timed out after ${maxAttempts * pollInterval / 1000} seconds`)
  }

  /**
   * Extract tables from PDF using PDF.co
   */
  private async extractTables(url: string): Promise<PDFCoTable[]> {
    try {
      console.log('🔄 Starting async table extraction...')

      const response = await axios.post(`${this.BASE_URL}/pdf/convert/to/csv`, {
        url: url,
        inline: false, // Don't return result inline
        async: true    // Use async mode
      }, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })

      console.log('PDF.co table extraction job response:', response.data)

      if (response.data.error) {
        console.warn('⚠️ Table extraction job failed:', response.data.error)
        return []
      }

      if (!response.data.jobId) {
        console.warn('⚠️ PDF.co did not return a job ID for table extraction')
        return []
      }

      // Poll for job completion
      const result = await this.pollJobCompletion(response.data.jobId, 'table extraction')
      const csvData = result.body || result.text || result.content || result.data || ''

      console.log('📋 Table extraction result:', {
        csvLength: csvData.length,
        csvPreview: csvData.substring(0, 200) + (csvData.length > 200 ? '...' : ''),
        availableFields: Object.keys(result),
        resultStructure: result
      })
      
      if (!csvData.trim()) {
        return []
      }

      // Convert CSV to table format
      const tables: PDFCoTable[] = []
      const lines = csvData.split('\n').filter((line: string) => line.trim())
      
      if (lines.length > 1) {
        const rows = lines.length
        const columns = lines[0].split(',').length
        
        // Convert CSV to HTML table
        const htmlTable = this.csvToHtmlTable(csvData)
        
        tables.push({
          id: 'table-1',
          html: htmlTable,
          text: csvData,
          csv: csvData,
          type: 'table',
          page: 1,
          rows,
          columns
        })
      }

      return tables
    } catch (error) {
      console.warn('⚠️ Table extraction failed:', error)
      return []
    }
  }

  /**
   * Extract images from PDF using PDF.co
   */
  private async extractImages(url: string): Promise<PDFCoImage[]> {
    try {
      console.log('🔄 Starting async image extraction...')

      const response = await axios.post(`${this.BASE_URL}/pdf/convert/to/png`, {
        url: url,
        inline: false, // Don't return result inline
        async: true    // Use async mode
      }, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })

      console.log('PDF.co image extraction job response:', response.data)

      if (response.data.error) {
        console.warn('⚠️ Image extraction job failed:', response.data.error)
        return []
      }

      if (!response.data.jobId) {
        console.warn('⚠️ PDF.co did not return a job ID for image extraction')
        return []
      }

      // Poll for job completion
      const result = await this.pollJobCompletion(response.data.jobId, 'image extraction')

      const images: PDFCoImage[] = []

      if (result.urls && Array.isArray(result.urls)) {
        for (let i = 0; i < result.urls.length; i++) {
          const imageUrl = result.urls[i]
          
          // Download image and convert to base64
          try {
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' })
            const base64 = Buffer.from(imageResponse.data).toString('base64')
            
            images.push({
              id: `image-${i + 1}`,
              base64: `data:image/png;base64,${base64}`,
              type: 'image',
              page: i + 1,
              description: `Page ${i + 1} image`
            })
          } catch (imageError) {
            console.warn(`⚠️ Failed to download image ${i + 1}:`, imageError)
          }
        }
      }

      return images
    } catch (error) {
      console.warn('⚠️ Image extraction failed:', error)
      return []
    }
  }

  /**
   * Get document information
   */
  private async getDocumentInfo(url: string): Promise<{ pageCount: number }> {
    try {
      const response = await axios.post(`${this.BASE_URL}/pdf/info`, {
        url: url
      }, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        }
      })

      return {
        pageCount: response.data.pageCount || 1
      }
    } catch (error) {
      console.warn('⚠️ Document info extraction failed:', error)
      return { pageCount: 1 }
    }
  }

  /**
   * Convert CSV data to HTML table
   */
  private csvToHtmlTable(csvData: string): string {
    const lines = csvData.split('\n').filter((line: string) => line.trim())
    
    if (lines.length === 0) {
      return '<table></table>'
    }

    let html = '<table border="1" style="border-collapse: collapse;">'
    
    lines.forEach((line, index) => {
      const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      const tag = index === 0 ? 'th' : 'td'
      
      html += '<tr>'
      cells.forEach(cell => {
        html += `<${tag}>${cell}</${tag}>`
      })
      html += '</tr>'
    })
    
    html += '</table>'
    return html
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    return {
      name: 'PDF.co',
      configured: this.isConfigured(),
      freeTier: '100 API calls/month free',
      features: [
        'High-quality text extraction',
        'Table detection and extraction',
        'Image extraction',
        'OCR for scanned documents',
        'Multiple output formats',
        'Batch processing'
      ],
      website: 'https://pdf.co/',
      documentation: 'https://apidocs.pdf.co/'
    }
  }
}

export const pdfCoService = new PDFCoService()
