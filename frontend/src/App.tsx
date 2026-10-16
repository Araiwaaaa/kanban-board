import { useEffect, useState } from 'react'
import { createCard, listCards, type Card, type Status } from './api'
import './App.css'

const columns: { status: Status; title: string }[] = [
  { status: 'todo', title: 'To do' },
  { status: 'doing', title: 'Doing' },
  { status: 'done', title: 'Done' },
]

function App() {
  const [cards, setCards] = useState<Card[]>([])
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadCards(): Promise<void> {
      try {
        const loadedCards = await listCards()
        if (isCurrent) {
          setCards(loadedCards)
          setHasLoaded(true)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load the board. Please try again.',
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadCards()
    return () => {
      isCurrent = false
    }
  }, [])

  async function refreshCards(): Promise<void> {
    const loadedCards = await listCards()
    setCards(loadedCards)
    setHasLoaded(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    setIsAdding(true)
    setError(null)
    try {
      await createCard(trimmedTitle)
      await refreshCards()
      setTitle('')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not add the card. Please try again.',
      )
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">A clear view of your work</p>
          <h1>Kanban Board</h1>
          <p className="subtitle">
            Keep tasks moving, one step at a time.
          </p>
        </div>
      </header>

      <section className="add-card-panel" aria-labelledby="add-card-heading">
        <h2 id="add-card-heading">Add a card</h2>
        <form className="add-card-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="card-title">
            Card title
          </label>
          <input
            id="card-title"
            autoComplete="off"
            maxLength={100}
            name="title"
            placeholder="What needs to get done?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button
            className="add-button"
            disabled={isAdding || title.trim().length === 0}
            type="submit"
          >
            {isAdding ? 'Adding…' : 'Add'}
          </button>
        </form>
      </section>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="board-state" role="status">
          Loading your board…
        </p>
      ) : !hasLoaded ? (
        <p className="board-state load-error">
          The board could not be loaded. Check the error above and try again.
        </p>
      ) : (
        <section className="board" aria-label="Kanban board">
          {columns.map((column) => {
            const columnCards = cards.filter(
              (card) => card.status === column.status,
            )

            return (
              <section
                className={`board-column column-${column.status}`}
                key={column.status}
                aria-labelledby={`column-${column.status}`}
              >
                <header className="column-header">
                  <h2 id={`column-${column.status}`}>{column.title}</h2>
                  <span className="card-count" aria-label={`${columnCards.length} cards`}>
                    {columnCards.length}
                  </span>
                </header>
                {columnCards.length === 0 ? (
                  <p className="column-empty">No cards here yet.</p>
                ) : (
                  <ul className="card-list">
                    {columnCards.map((card) => (
                      <li className="card" key={card.id}>
                        <span>{card.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default App
