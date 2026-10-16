import { useEffect, useState } from 'react'
import {
  createExpense,
  getTotal,
  listExpenses,
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
              {expenses.map((expense) => (
                <li className="expense-item" key={expense.id}>
                  <div className="expense-main">
                    <span className="category-mark" aria-hidden="true" />
                    <div className="expense-description">
                      <span className="expense-title">{expense.title}</span>
                      <span className="expense-meta">
                        <span className="category-pill">{expense.category}</span>
                        <time dateTime={expense.spent_on}>
                          {formatExpenseDate(expense.spent_on)}
                        </time>
                      </span>
                    </div>
                  </div>
                  <span className="expense-amount">
                    {formatBaht(expense.amount_baht)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
