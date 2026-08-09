import api from './client'

export async function login(email, password) {
  const { data } = await api.post('/organizer/auth/login', { email, password })
  return { token: data.token, organizer: data.organizer }
}
