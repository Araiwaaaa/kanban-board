export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Shopping'
  | 'Other'

export type Expense = {
  id: number
  title: string
  amount_baht: number
  category: ExpenseCategory
  spent_on: string
}

export type ExpenseInput = Omit<Expense, 'id'>

export type ExpenseTotal = {
  total_baht: number
  currency: 'THB'
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

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured')
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}${path}`, init)
  if (!response.ok) {
    throw await responseError(response)
  }

  return response.json() as Promise<T>
}

export function listExpenses(): Promise<Expense[]> {
  return request<Expense[]>('/expenses')
}

export function createExpense(expense: ExpenseInput): Promise<Expense> {
  return request<Expense>('/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
}

export function updateExpense(
  id: number,
  expense: ExpenseInput,
): Promise<Expense> {
  return request<Expense>(`/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
}

export async function deleteExpense(id: number): Promise<void> {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured')
  }

  const response = await fetch(
    `${apiUrl.replace(/\/+$/, '')}/expenses/${id}`,
    { method: 'DELETE' },
  )
  if (!response.ok) {
    throw await responseError(response)
  }
}

export function getTotal(): Promise<ExpenseTotal> {
  return request<ExpenseTotal>('/expenses/total')
}
