import { ref } from 'vue'

export interface FileUploadResult {
  file: File
  type: 'image' | 'pdf'
  content?: string
  base64?: string
  error?: string
}

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
   * Process uploaded file
   */
  async processFile(file: File): Promise<FileUploadResult> {
    const validation = this.validateFile(file)
    
    if (!validation.isValid) {
      return {
        file,
        type: 'image', // default
        error: validation.error
      }
    }

    try {
      const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type)
      const isPdf = this.ALLOWED_PDF_TYPES.includes(file.type)

      if (isImage) {
        return await this.processImage(file)
      } else if (isPdf) {
        return await this.processPdf(file)
      }

      throw new Error('Unsupported file type')
    } catch (error: any) {
      return {
        file,
        type: 'image',
        error: `Failed to process file: ${error.message}`
      }
    }
  }

  /**
   * Process image file
   */
  private async processImage(file: File): Promise<FileUploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        resolve({
          file,
          type: 'image',
          base64,
          content: `Image uploaded: ${file.name} (${this.formatFileSize(file.size)})`
        })
      }

      reader.onerror = () => {
        reject(new Error('Failed to read image file'))
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * Process PDF file
   */
  private async processPdf(file: File): Promise<FileUploadResult> {
    try {
      // For now, we'll just prepare the PDF for upload
      // In a real implementation, you might want to extract text using PDF.js
      const base64 = await this.fileToBase64(file)
      
      return {
        file,
        type: 'pdf',
        base64,
        content: `PDF uploaded: ${file.name} (${this.formatFileSize(file.size)})`
      }
    } catch (error: any) {
      throw new Error(`Failed to process PDF: ${error.message}`)
    }
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
