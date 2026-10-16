export type Status = 'todo' | 'doing' | 'done'

export type Card = {
  id: number
  title: string
  status: Status
}

const apiUrl = import.meta.env.VITE_API_URL

async function responseError(response: Response): Promise<Error> {
  const body = await response.text()
  if (body) {
    try {
      const payload: unknown = JSON.parse(body)
      if (typeof payload === 'object' && payload !== null && 'detail' in payload) {
        const detail = payload.detail
        if (typeof detail === 'string') {
          return new Error(detail)
        }
        if (Array.isArray(detail)) {
          const messages = detail.flatMap((item: unknown) => {
            if (
              typeof item === 'object' &&
              item !== null &&
              'msg' in item &&
              typeof item.msg === 'string'
            ) {
              return [item.msg]
            }
            return []
          })
          if (messages.length > 0) {
            return new Error(messages.join('; '))
          }
        }
      }
    } catch (parseError) {
      if (!(parseError instanceof SyntaxError)) {
        throw parseError
      }
    }
  }

  return new Error(
    `API request failed: ${response.status} ${response.statusText}`,
  )
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured')
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}${path}`, init)
  if (!response.ok) {
    throw await responseError(response)
  }
  return response.json() as Promise<T>
}

export function listCards(): Promise<Card[]> {
  return request<Card[]>('/cards')
}

export function createCard(title: string): Promise<Card> {
  return request<Card>('/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

export function moveCard(id: number, status: Status): Promise<Card> {
  return request<Card>(`/cards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export async function deleteCard(id: number): Promise<void> {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured')
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/cards/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw await responseError(response)
  }
}
