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

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured')
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}${path}`, init)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
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
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
}

export function getTotal(): Promise<ExpenseTotal> {
  return request<ExpenseTotal>('/expenses/total')
}
