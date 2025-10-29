import { filesApi } from './filesApi'
import { validateRequired } from '../utils/validation'

export default {
  async uploadFile(file, fileType = 'portfolio-image') {
    const formData = new window.FormData()
    formData.append('file', file)
    formData.append('fileType', fileType)

    return filesApi.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async deleteFile(fileId) {
    validateRequired(fileId, 'File ID')
    return filesApi.delete(`/files/${encodeURIComponent(fileId)}`)
  },
}
