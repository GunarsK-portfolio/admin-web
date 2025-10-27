import { authApi } from './authApi'

export default {
  login(username, password) {
    return authApi.post('/login', { username, password })
  },
  logout() {
    const token = localStorage.getItem('access_token')
    return authApi.post(
      '/logout',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
  },
  refresh() {
    const refreshToken = localStorage.getItem('refresh_token')
    return authApi.post('/refresh', { refresh_token: refreshToken })
  },
  tokenStatus() {
    const token = localStorage.getItem('access_token')
    return authApi.get('/token-status', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}
