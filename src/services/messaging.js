import { messagingApi } from './messagingApi'
import { validateRequired } from '../utils/validation'

export default {
  // Recipients
  getAllRecipients() {
    return messagingApi.get('/recipients')
  },
  getRecipientById(id) {
    validateRequired(id, 'Recipient ID')
    return messagingApi.get(`/recipients/${encodeURIComponent(id)}`)
  },
  createRecipient(recipient) {
    validateRequired(recipient, 'Recipient', { type: 'object' })
    return messagingApi.post('/recipients', recipient)
  },
  updateRecipient(id, recipient) {
    validateRequired(id, 'Recipient ID')
    validateRequired(recipient, 'Recipient', { type: 'object' })
    return messagingApi.put(`/recipients/${encodeURIComponent(id)}`, recipient)
  },
  deleteRecipient(id) {
    validateRequired(id, 'Recipient ID')
    return messagingApi.delete(`/recipients/${encodeURIComponent(id)}`)
  },

  // Messages
  getAllMessages() {
    return messagingApi.get('/messages')
  },
  getMessageById(id) {
    validateRequired(id, 'Message ID')
    return messagingApi.get(`/messages/${encodeURIComponent(id)}`)
  },
}
