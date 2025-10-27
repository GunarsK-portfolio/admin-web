import { filesApi } from './filesApi'

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
    return filesApi.delete(`/files/${fileId}`)
  },
}
