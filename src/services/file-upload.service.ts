import { pdfCoService, type PDFCoParseResult } from './pdf-co.service'

export interface FileUploadResult {
  file: File
  type: 'image' | 'pdf'
  content?: string
  base64?: string
  error?: string
  // Enhanced PDF data
  pdfData?: {
    text: string
    images: Array<{ id: string; base64: string; description?: string }>
    tables: Array<{ id: string; html: string; text: string }>
    metadata: {
      pages: number
      service: string
      hasText: boolean
      hasImages: boolean
      hasTables: boolean
    }
  }
}

export interface UploadProgress {
  progress: number // 0-100
  status: string
  step: number
  totalSteps: number
}

export type ProgressCallback = (progress: UploadProgress) => void

export class FileUploadService {
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ]

  private readonly ALLOWED_PDF_TYPES = [
    'application/pdf'
  ]

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

  /**
   * Validate file type and size
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type)
    const isPdf = this.ALLOWED_PDF_TYPES.includes(file.type)

    if (!isImage && !isPdf) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}. Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.`
      }
    }

    // Check file size
    const maxSize = isImage ? this.MAX_IMAGE_SIZE : this.MAX_FILE_SIZE
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return {
        isValid: false,
        error: `File too large. Maximum size for ${isImage ? 'images' : 'PDFs'} is ${maxSizeMB}MB.`
      }
    }

    return { isValid: true }
  }

  /**
   * Process uploaded file with progress tracking
   */
  async processFile(file: File, onProgress?: ProgressCallback): Promise<FileUploadResult> {
    // Initial progress
    onProgress?.({
      progress: 0,
      status: 'Validating file...',
      step: 0,
      totalSteps: 4
    })

    const validation = this.validateFile(file)

    if (!validation.isValid) {
      onProgress?.({
        progress: 100,
        status: `Validation failed: ${validation.error}`,
        step: 4,
        totalSteps: 4
      })

      return {
        file,
        type: 'image', // default
        error: validation.error
      }
    }

    onProgress?.({
      progress: 20,
      status: 'File validated successfully',
      step: 1,
      totalSteps: 4
    })

    try {
      const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type)
      const isPdf = this.ALLOWED_PDF_TYPES.includes(file.type)

      if (isImage) {
        return await this.processImage(file, onProgress)
      } else if (isPdf) {
        return await this.processPdf(file, onProgress)
      }

      throw new Error('Unsupported file type')
    } catch (error: any) {
      onProgress?.({
        progress: 100,
        status: `Error: ${error.message}`,
        step: 4,
        totalSteps: 4
      })

      return {
        file,
        type: 'image',
        error: `Failed to process file: ${error.message}`
      }
    }
  }

  /**
   * Process image file with progress tracking
   */
  private async processImage(file: File, onProgress?: ProgressCallback): Promise<FileUploadResult> {
    onProgress?.({
      progress: 40,
      status: 'Reading image file...',
      step: 2,
      totalSteps: 4
    })

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        onProgress?.({
          progress: 100,
          status: 'Image processed successfully',
          step: 4,
          totalSteps: 4
        })

        const base64 = event.target?.result as string
        resolve({
          file,
          type: 'image',
          base64,
          content: `Image uploaded: ${file.name} (${this.formatFileSize(file.size)})`
        })
      }

      reader.onerror = () => {
        onProgress?.({
          progress: 100,
          status: 'Failed to read image file',
          step: 4,
          totalSteps: 4
        })
        reject(new Error('Failed to read image file'))
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * Process PDF file with PDF.co service and progress tracking
   */
  private async processPdf(file: File, onProgress?: ProgressCallback): Promise<FileUploadResult> {
    try {
      console.log('📄 Processing PDF with PDF.co service:', file.name)

      onProgress?.({
        progress: 30,
        status: 'Converting PDF to base64...',
        step: 2,
        totalSteps: 4
      })

      // Get base64 for storage
      const base64 = await this.fileToBase64(file)

      onProgress?.({
        progress: 50,
        status: 'Uploading to PDF.co for parsing...',
        step: 3,
        totalSteps: 4
      })

      // Parse PDF content using PDF.co
      let pdfData: FileUploadResult['pdfData'] | undefined
      let content = `PDF uploaded: ${file.name} (${this.formatFileSize(file.size)})`

      try {
        if (pdfCoService.isConfigured()) {
          console.log('🔄 Using PDF.co service for parsing...')

          onProgress?.({
            progress: 60,
            status: 'Starting PDF.co processing...',
            step: 3,
            totalSteps: 4
          })

          const parseResult = await pdfCoService.parsePDF(file)

          pdfData = {
            text: parseResult.text,
            images: parseResult.images.map(img => ({
              id: img.id,
              base64: img.base64,
              description: img.description
            })),
            tables: parseResult.tables.map(table => ({
              id: table.id,
              html: table.html,
              text: table.text
            })),
            metadata: {
              pages: parseResult.metadata.pages,
              service: parseResult.metadata.service,
              hasText: parseResult.metadata.hasText,
              hasImages: parseResult.metadata.hasImages,
              hasTables: parseResult.metadata.hasTables
            }
          }

          // Enhanced content with parsing results
          content = this.createPDFCoSummary(file, parseResult)

          onProgress?.({
            progress: 90,
            status: 'Finalizing PDF processing...',
            step: 3,
            totalSteps: 4
          })

          console.log('✅ PDF.co parsing completed:', {
            service: parseResult.metadata.service,
            pages: parseResult.metadata.pages,
            textLength: parseResult.text.length,
            imageCount: parseResult.images.length,
            tableCount: parseResult.tables.length
          })

        } else {
          console.log('⚠️ PDF.co not configured. Please add VITE_PDFCO_API_KEY to your .env file')
          content = `📄 **${file.name}** (${this.formatFileSize(file.size)})

⚠️ **PDF parsing not available**
To enable PDF content analysis, please:
1. Sign up for a free account at https://pdf.co
2. Get your API key from the dashboard
3. Add VITE_PDFCO_API_KEY=your-key-here to your .env file
4. Restart the application

**Free tier includes:** 100 API calls/month
**Features:** Text extraction, table detection, image extraction, OCR`
        }

      } catch (parseError) {
        console.warn('⚠️ PDF.co parsing failed:', parseError)
        content = `📄 **${file.name}** (${this.formatFileSize(file.size)})

❌ **PDF parsing failed**
The PDF file was uploaded but content extraction failed. This might be due to:
- Complex PDF format or scanned document
- API rate limits or service issues
- Network connectivity problems

You can still reference this PDF in your conversation, but AI analysis of the content may be limited.`
      }

      onProgress?.({
        progress: 100,
        status: 'PDF processing completed',
        step: 4,
        totalSteps: 4
      })

      return {
        file,
        type: 'pdf',
        base64,
        content,
        pdfData
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      onProgress?.({
        progress: 100,
        status: `Error: ${errorMessage}`,
        step: 4,
        totalSteps: 4
      })

      throw new Error(`Failed to process PDF: ${errorMessage}`)
    }
  }



  /**
   * Create a summary of PDF.co parsing results
   */
  private createPDFCoSummary(file: File, parseResult: PDFCoParseResult): string {
    const { metadata, text, images, tables } = parseResult

    let summary = `📄 **${file.name}** (${this.formatFileSize(file.size)})\n\n`

    // Service info with confidence
    summary += `🔧 **Parsed with:** PDF.co (PREMIUM)\n`
    summary += `📊 **Pages:** ${metadata.pages}\n`
    summary += `🎯 **Confidence:** ${(metadata.confidence * 100).toFixed(1)}%\n`

    // Content summary
    const features = []
    if (metadata.hasText) features.push(`📝 Text (${text.length} chars)`)
    if (metadata.hasImages) features.push(`🖼️ Images (${images.length})`)
    if (metadata.hasTables) features.push(`📋 Tables (${tables.length})`)

    if (features.length > 0) {
      summary += `✨ **Extracted:** ${features.join(', ')}\n\n`
    }

    // Text preview
    if (text && text.length > 0) {
      const preview = text.length > 200 ? text.substring(0, 200) + '...' : text
      summary += `📝 **Content Preview:**\n${preview}\n\n`
    }

    // Tables summary
    if (tables.length > 0) {
      summary += `📋 **Tables Found:** ${tables.length} structured table(s) with CSV export\n\n`
    }

    // Images summary
    if (images.length > 0) {
      summary += `🖼️ **Images Found:** ${images.length} high-quality image(s) extracted\n\n`
    }

    summary += `🤖 **Ready for AI analysis** - Professional-grade content extraction completed with PDF.co.`

    return summary
  }



  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        resolve(reader.result as string)
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to convert file to base64'))
      }
      
      reader.readAsDataURL(file)
    })
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

  /**
   * Get file type from file
   */
  getFileType(file: File): 'image' | 'pdf' | 'unsupported' {
    if (this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'image'
    } else if (this.ALLOWED_PDF_TYPES.includes(file.type)) {
      return 'pdf'
    }
    return 'unsupported'
  }

  /**
   * Check if file type is supported
   */
  isFileTypeSupported(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type) || 
           this.ALLOWED_PDF_TYPES.includes(file.type)
  }
}

// Create singleton instance
export const fileUploadService = new FileUploadService()
