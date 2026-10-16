import { useEffect, useState } from 'react'
import {
  createExpense,
  deleteExpense,
  getTotal,
  listExpenses,
  updateExpense,
  type Expense,
  type ExpenseCategory,
  type ExpenseInput,
  type ExpenseTotal,
} from './api'
import './App.css'

const categories: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Other',
]

function bangkokToday(): string {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((item) => item.type === type)?.value ?? ''

  return `${part('year')}-${part('month')}-${part('day')}`
}

function formatBaht(amount: number): string {
  return `฿${new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: 0,
  }).format(amount)}`
}

function sortExpenses(expenses: Expense[]): Expense[] {
  return [...expenses].sort(
    (first, second) =>
      second.spent_on.localeCompare(first.spent_on) || second.id - first.id,
  )
}

function formatExpenseDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [total, setTotal] = useState<ExpenseTotal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<ExpenseInput | null>(null)
  const [busyExpenseId, setBusyExpenseId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('Food')
  const [spentOn, setSpentOn] = useState(bangkokToday)
  const today = bangkokToday()

  async function refreshExpenses(): Promise<void> {
    const [nextExpenses, nextTotal] = await Promise.all([
      listExpenses(),
      getTotal(),
    ])
    setExpenses(sortExpenses(nextExpenses))
    setTotal(nextTotal)
  }

  useEffect(() => {
    let isCurrent = true

    async function load(): Promise<void> {
      try {
        const [nextExpenses, nextTotal] = await Promise.all([
          listExpenses(),
          getTotal(),
        ])
        if (isCurrent) {
          setExpenses(sortExpenses(nextExpenses))
          setTotal(nextTotal)
          setHasLoaded(true)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load expenses. Please try again.',
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      isCurrent = false
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amountBaht = Number(amount)
    if (!Number.isSafeInteger(amountBaht) || amountBaht < 1) {
      setError('Amount must be a whole number of Baht greater than zero.')
      return
    }

    const expense: ExpenseInput = {
      title: title.trim(),
      amount_baht: amountBaht,
      category,
      spent_on: spentOn,
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await createExpense(expense)
      await refreshExpenses()
      setTitle('')
      setAmount('')
      setCategory('Food')
      setSpentOn(bangkokToday())
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save the expense. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEditing(expense: Expense): void {
    setEditingExpenseId(expense.id)
    setEditDraft({
      title: expense.title,
      amount_baht: expense.amount_baht,
      category: expense.category,
      spent_on: expense.spent_on,
    })
    setError(null)
  }

  function cancelEditing(): void {
    setEditingExpenseId(null)
    setEditDraft(null)
    setError(null)
  }

  async function handleUpdate(
    event: React.FormEvent<HTMLFormElement>,
    expenseId: number,
  ): Promise<void> {
    event.preventDefault()
    if (!editDraft) return

    const amountBaht = Number(editDraft.amount_baht)
    if (!Number.isSafeInteger(amountBaht) || amountBaht < 1) {
      setError('Amount must be a whole number of Baht greater than zero.')
      return
    }

    setBusyExpenseId(expenseId)
    setError(null)
    try {
      await updateExpense(expenseId, {
        ...editDraft,
        title: editDraft.title.trim(),
        amount_baht: amountBaht,
      })
      await refreshExpenses()
      setEditingExpenseId(null)
      setEditDraft(null)
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Could not update the expense. Please try again.',
      )
    } finally {
      setBusyExpenseId(null)
    }
  }

  async function handleDelete(expenseId: number): Promise<void> {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return

    setBusyExpenseId(expenseId)
    setError(null)
    try {
      await deleteExpense(expenseId)
      await refreshExpenses()
      if (editingExpenseId === expenseId) {
        setEditingExpenseId(null)
        setEditDraft(null)
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete the expense. Please try again.',
      )
    } finally {
      setBusyExpenseId(null)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your personal finance notebook</p>
          <h1>Expense Tracker</h1>
          <p className="subtitle">Keep track of where your money goes.</p>
        </div>
        <section className="total-card" aria-label="Total expenses">
          <p className="total-label">Total spent</p>
          <p className="total-amount">
            {total ? formatBaht(total.total_baht) : '—'}
          </p>
          <p className="total-caption">All recorded expenses · THB</p>
        </section>
      </header>

      {error && (
        <div className="error-message" role="alert">
          <span>{error}</span>
          <button
            className="dismiss-error"
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      <section className="content-grid">
        <section className="panel form-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">New record</p>
              <h2>Add an expense</h2>
            </div>
          </div>
          <form className="expense-form" onSubmit={handleSubmit}>
            <label className="field field-wide">
              <span>Title</span>
              <input
                autoComplete="off"
                maxLength={200}
                name="title"
                placeholder="e.g. Lunch with friends"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Amount</span>
              <div className="amount-input">
                <span aria-hidden="true">฿</span>
                <input
                  inputMode="numeric"
                  min="1"
                  name="amount_baht"
                  placeholder="0"
                  required
                  step="1"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            </label>
            <label className="field">
              <span>Category</span>
              <select
                name="category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ExpenseCategory)
                }
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field-wide">
              <span>Date spent</span>
              <input
                max={today}
                name="spent_on"
                required
                type="date"
                value={spentOn}
                onChange={(event) => setSpentOn(event.target.value)}
              />
            </label>
            <button
              className="submit-button field-wide"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Saving…' : 'Add expense'}
            </button>
          </form>
        </section>

        <section className="panel expenses-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your activity</p>
              <h2>Expenses</h2>
            </div>
            {!isLoading && (
              <span className="expense-count">
                {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>

          {isLoading ? (
            <p className="state-message" role="status">
              Loading your expenses…
            </p>
          ) : !hasLoaded ? (
            <p className="state-message">
              Expenses could not be loaded.
            </p>
          ) : expenses.length === 0 ? (
            <p className="state-message empty-state">
              No expenses yet. Add your first expense to get started.
            </p>
          ) : (
            <ul className="expense-list">
              {expenses.map((expense) => {
                const isEditing = editingExpenseId === expense.id
                const isBusy = busyExpenseId === expense.id
                const hasPendingRequest = busyExpenseId !== null

                return (
                  <li
                    className={`expense-item${isEditing ? ' is-editing' : ''}`}
                    key={expense.id}
                  >
                    {isEditing && editDraft ? (
                      <form
                        className="edit-form"
                        onSubmit={(event) => void handleUpdate(event, expense.id)}
                      >
                        <label className="field edit-title-field">
                          <span>Title</span>
                          <input
                            autoComplete="off"
                            maxLength={200}
                            required
                            value={editDraft.title}
                            onChange={(event) =>
                              setEditDraft({
                                ...editDraft,
                                title: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="field">
                          <span>Amount (Baht)</span>
                          <input
                            inputMode="numeric"
                            min="1"
                            required
                            step="1"
                            type="number"
                            value={editDraft.amount_baht}
                            onChange={(event) =>
                              setEditDraft({
                                ...editDraft,
                                amount_baht: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="field">
                          <span>Category</span>
                          <select
                            value={editDraft.category}
                            onChange={(event) =>
                              setEditDraft({
                                ...editDraft,
                                category: event.target.value as ExpenseCategory,
                              })
                            }
                          >
                            {categories.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          <span>Date spent</span>
                          <input
                            max={today}
                            required
                            type="date"
                            value={editDraft.spent_on}
                            onChange={(event) =>
                              setEditDraft({
                                ...editDraft,
                                spent_on: event.target.value,
                              })
                            }
                          />
                        </label>
                        <div className="edit-actions">
                          <button
                            className="row-button save-button"
                            disabled={hasPendingRequest}
                            type="submit"
                          >
                            {isBusy ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            className="row-button cancel-button"
                            disabled={hasPendingRequest}
                            onClick={cancelEditing}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="expense-main">
                          <span className="category-mark" aria-hidden="true" />
                          <div className="expense-description">
                            <span className="expense-title">{expense.title}</span>
                            <span className="expense-meta">
                              <span className="category-pill">
                                {expense.category}
                              </span>
                              <time dateTime={expense.spent_on}>
                                {formatExpenseDate(expense.spent_on)}
                              </time>
                            </span>
                          </div>
                        </div>
                        <span className="expense-amount">
                          {formatBaht(expense.amount_baht)}
                        </span>
                        <div className="expense-actions">
                          <button
                            className="row-button"
                            disabled={
                              hasPendingRequest || editingExpenseId !== null
                            }
                            onClick={() => startEditing(expense)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="row-button delete-button"
                            disabled={hasPendingRequest}
                            onClick={() => void handleDelete(expense.id)}
                            type="button"
                          >
                            {isBusy ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
