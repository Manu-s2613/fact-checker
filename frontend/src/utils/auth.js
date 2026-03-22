const AUTH_TOKEN_KEY = 'fact_check_token'
const AUTH_USER_KEY = 'fact_check_user'

export const saveAuth = (token, user) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export const getToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const getUser = () => {
  const userStr = localStorage.getItem(AUTH_USER_KEY)
  if (userStr) {
    try { return JSON.parse(userStr) } catch (e) { return null }
  }
  return null
}

export const isAuthenticated = () => {
  const token = getToken()
  return token !== null && token !== undefined && token !== ''
}

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}