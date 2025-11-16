import { filesApi } from './filesApi'
import { validateRequired } from '../utils/validation'
import { env } from '../config/env'

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

    // Convert backend's relative URL to absolute URL using FILES_API_URL
    // Backend returns: /api/v1/files/portfolio-image/uuid.jpg
    // env.filesApiUrl is: https://localhost:8443/files-api/v1 or http://localhost:8085/api/v1
    // Result: https://localhost:8443/files-api/v1/files/portfolio-image/uuid.jpg
    if (response.data?.url && response.data.url.startsWith('/api/v1/files/')) {
      const filePathWithType = response.data.url.replace('/api/v1/', '')
      response.data.fileUrl = `${env.filesApiUrl}/${filePathWithType}`
    }

    return response
  },

  async deleteFile(fileId) {
    validateRequired(fileId, 'File ID')
    return filesApi.delete(`/files/${encodeURIComponent(fileId)}`)
  },
}
