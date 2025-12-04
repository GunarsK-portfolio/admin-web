import { authApi } from './authApi'

export default {
  // Server sets cookies - no token handling needed
  login(username, password) {
    return authApi.post('/login', { username, password })
  },
  // Server clears cookies - no token handling needed
  logout() {
    return authApi.post('/logout')
  },
  // Server reads refresh token from cookie
  refresh() {
    return authApi.post('/refresh')
  },
  // Server reads access token from cookie
  tokenStatus() {
    return authApi.get('/token-status')
  },
}
