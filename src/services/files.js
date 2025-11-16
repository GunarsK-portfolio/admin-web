import { filesApi } from './filesApi'
import { validateRequired } from '../utils/validation'
import { env } from '../config/env'

/**
 * Validates that environment configuration is available
 */
function validateEnvironment() {
  if (!env.filesApiUrl) {
    throw new Error('FILES_API_URL is not configured. Check your .env file.')
  }
}

/**
 * Converts backend's relative URL to deployment-specific absolute URL
 * @param {string} relativeUrl - Backend URL like /api/v1/files/portfolio-image/uuid.jpg
 * @returns {string} Absolute URL for current deployment
 */
function transformFileUrl(relativeUrl) {
  if (!relativeUrl || !relativeUrl.startsWith('/api/v1/files/')) {
    return relativeUrl
  }

  validateEnvironment()

  // Extract the file path after /api/v1/
  // Input: /api/v1/files/portfolio-image/uuid.jpg
  // Output: files/portfolio-image/uuid.jpg
  const filePath = relativeUrl.replace('/api/v1/', '')

  // Construct absolute URL
  // env.filesApiUrl examples:
  //   - http://localhost:8085/api/v1
  //   - https://localhost:8443/files-api/v1
  // Result should be: baseUrl + '/' + filePath
  const baseUrl = env.filesApiUrl.endsWith('/') ? env.filesApiUrl.slice(0, -1) : env.filesApiUrl
  return `${baseUrl}/${filePath}`
}

export default {
  async uploadFile(file, fileType = 'portfolio-image') {
    const formData = new window.FormData()
    formData.append('file', file)
    formData.append('fileType', fileType)

    const response = await filesApi.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Transform backend's relative URL to absolute URL
    if (response.data?.url) {
      response.data.fileUrl = transformFileUrl(response.data.url)
    }

    return response
  },

  async deleteFile(fileId) {
    validateRequired(fileId, 'File ID')
    return filesApi.delete(`/files/${encodeURIComponent(fileId)}`)
  },
}
