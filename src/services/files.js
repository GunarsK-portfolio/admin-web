import { filesApi } from './filesApi'
import { validateRequired } from '../utils/validation'

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

    // Transform the URL from /api/v1/files/... to /files-api/v1/files/...
    // to match the Traefik routing configuration
    if (response.data?.url && response.data.url.startsWith('/api/v1/files/')) {
      response.data.url = response.data.url.replace('/api/v1/files/', '/files-api/v1/files/')
    }

    return response
  },

  async deleteFile(fileId) {
    validateRequired(fileId, 'File ID')
    return filesApi.delete(`/files/${encodeURIComponent(fileId)}`)
  },
}
