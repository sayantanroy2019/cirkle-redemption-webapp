import api from './client'

export async function fetchEvents({ limit = 50, offset = 0, signal } = {}) {
  const { data } = await api.get('/organizer/events', {
    params: { limit, offset },
    signal,
  })

  return {
    events: data?.data ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? limit,
    offset: data?.offset ?? offset,
  }
}
