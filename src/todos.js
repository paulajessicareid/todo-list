const STORAGE_KEY = 'todolist-app-todos'

let todos = []

export function getTodos() {
  return todos
}

export function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    todos = stored ? JSON.parse(stored) : []
  } catch {
    todos = []
  }
}

export function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function addTodo(text) {
  const trimmed = text.trim()
  if (!trimmed) return

  todos.push({
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
  })
  saveTodos()
}

export function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos()
  }
}

export function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id)
  saveTodos()
}
