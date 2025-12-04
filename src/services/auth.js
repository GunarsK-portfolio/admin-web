import { authApi } from './authApi'

export default {
  login(username, password) {
    return authApi.post('/login', { username, password })
    // Server sets cookies - no token handling needed
  },
  logout() {
    return authApi.post('/logout')
    // Server clears cookies - no token handling needed
  },
  refresh() {
    return authApi.post('/refresh')
    // Server reads refresh token from cookie
  },
  tokenStatus() {
    return authApi.get('/token-status')
    // Server reads access token from cookie
  },
}
