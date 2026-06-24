import './style.css'
import {
  getTodos,
  getError,
  clearError,
  loadTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  updateTodoPriority,
  PRIORITIES,
  EMPTY_TODO_MESSAGE,
} from './todos.js'
import {
  initAuth,
  isAuthReady,
  isAnonymous,
  getUser,
  getAuthError,
  signUp,
  signIn,
  signOut,
  onAuthChange,
} from './auth.js'
import { celebrate } from './celebrate.js'

const form = document.querySelector('#todo-form')
const input = document.querySelector('#todo-input')
const filterSelect = document.querySelector('#todo-filter')
const showCompletedToggle = document.querySelector('#todo-show-completed')
const list = document.querySelector('#todo-list')
const addButton = document.querySelector('.todo-add-button')
const errorEl = document.querySelector('.todo-error')
const inputErrorEl = document.querySelector('#todo-input-error')
const authBar = document.querySelector('#auth-bar')
const authStatus = document.querySelector('#auth-status')
const authForm = document.querySelector('#auth-form')
const authEmail = document.querySelector('#auth-email')
const authPassword = document.querySelector('#auth-password')
const authSubmit = document.querySelector('#auth-submit')
const authToggle = document.querySelector('#auth-toggle')

let loading = true
let authMode = 'signup'
let showAuthForm = false
let filterPriority = 'all'
let showCompleted = true
let wasAllComplete = false

function renderError() {
  if (!errorEl) return
  const authError = getAuthError()
  const todoError = getError()
  const error =
    authError ?? (todoError === EMPTY_TODO_MESSAGE ? null : todoError)
  errorEl.textContent = error ?? ''
  errorEl.hidden = !error
}

function renderInputError() {
  if (!inputErrorEl) return
  const isEmptyError = getError() === EMPTY_TODO_MESSAGE
  inputErrorEl.textContent = isEmptyError ? EMPTY_TODO_MESSAGE : ''
  inputErrorEl.hidden = !isEmptyError
  input.classList.toggle('todo-input-invalid', isEmptyError)
}

function getVisibleTodos() {
  let items = getTodos()

  if (!showCompleted) {
    items = items.filter((t) => !t.completed)
  }

  if (filterPriority !== 'all') {
    items = items.filter((t) => t.priority === filterPriority)
  }

  return items
}

function areAllTodosComplete() {
  const todos = getTodos()
  return todos.length > 0 && todos.every((t) => t.completed)
}

function checkCelebration() {
  const allComplete = areAllTodosComplete()

  if (allComplete && !wasAllComplete) {
    celebrate()
  }

  wasAllComplete = allComplete
}

function createPrioritySelect(todo) {
  const select = document.createElement('select')
  select.className = `todo-priority-select priority-${todo.priority}`
  select.setAttribute('aria-label', 'Priority')

  for (const priority of PRIORITIES) {
    const option = document.createElement('option')
    option.value = priority
    option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1)
    option.selected = todo.priority === priority
    select.append(option)
  }

  select.addEventListener('change', async () => {
    select.disabled = true
    await updateTodoPriority(todo.id, select.value)
    select.disabled = false
    render()
  })

  return select
}

function createDeleteButton(onDelete) {
  const deleteBtn = document.createElement('button')
  deleteBtn.type = 'button'
  deleteBtn.className = 'delete-btn'
  deleteBtn.setAttribute('aria-label', 'Delete todo')
  deleteBtn.innerHTML = `
    <svg class="delete-btn-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 6h11M7.5 6V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M6 6v10.5A1.5 1.5 0 0 0 7.5 18h5a1.5 1.5 0 0 0 1.5-1.5V6"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.5 9v5M11.5 9v5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  `
  deleteBtn.addEventListener('click', onDelete)
  return deleteBtn
}

function renderAuth() {
  if (!authBar) return

  if (!isAuthReady()) {
    authBar.hidden = true
    form.hidden = true
    return
  }

  authBar.hidden = false
  form.hidden = false

  const user = getUser()

  if (isAnonymous()) {
    authStatus.innerHTML = ''
    const guestLabel = document.createElement('span')
    guestLabel.className = 'auth-label'
    guestLabel.textContent = 'Guest'

    const toggleBtn = document.createElement('button')
    toggleBtn.type = 'button'
    toggleBtn.className = 'auth-link'
    toggleBtn.textContent = showAuthForm ? 'Cancel' : 'Sign up / Log in'
    toggleBtn.addEventListener('click', () => {
      showAuthForm = !showAuthForm
      renderAuth()
    })

    authStatus.append(guestLabel, toggleBtn)
    authForm.hidden = !showAuthForm

    authSubmit.textContent = authMode === 'signup' ? 'Sign up' : 'Log in'
    authToggle.textContent =
      authMode === 'signup'
        ? 'Already have an account? Log in'
        : 'Need an account? Sign up'
  } else {
    authForm.hidden = true
    showAuthForm = false
    authStatus.innerHTML = ''

    const emailLabel = document.createElement('span')
    emailLabel.className = 'auth-label'
    emailLabel.textContent = user?.email ?? 'Signed in'

    const signOutBtn = document.createElement('button')
    signOutBtn.type = 'button'
    signOutBtn.className = 'auth-link'
    signOutBtn.textContent = 'Sign out'
    signOutBtn.addEventListener('click', async () => {
      signOutBtn.disabled = true
      await signOut()
      await loadTodos()
      signOutBtn.disabled = false
      render()
    })

    authStatus.append(emailLabel, signOutBtn)
  }
}

function render() {
  renderError()
  renderInputError()
  renderAuth()
  list.innerHTML = ''

  if (loading || !isAuthReady()) {
    const empty = document.createElement('li')
    empty.className = 'empty-state'
    empty.textContent = 'Loading...'
    list.append(empty)
    return
  }

  const allTodos = getTodos()
  const todos = getVisibleTodos()

  if (allTodos.length === 0) {
    const empty = document.createElement('li')
    empty.className = 'empty-state'
    empty.textContent = 'No todos yet. Add one above!'
    list.append(empty)
    return
  }

  if (todos.length === 0) {
    const empty = document.createElement('li')
    empty.className = 'empty-state'
    empty.textContent = 'No todos match this filter.'
    list.append(empty)
    return
  }

  for (const todo of todos) {
    const item = document.createElement('li')
    item.className = todo.completed ? 'completed todo-row' : 'todo-row'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'todo-col-check'
    checkbox.checked = todo.completed
    checkbox.addEventListener('change', async () => {
      await toggleTodo(todo.id)
      render()
      checkCelebration()
    })

    const text = document.createElement('span')
    text.className = 'todo-text todo-col-text'
    text.textContent = todo.text

    const priorityCell = document.createElement('div')
    priorityCell.className = 'todo-col-priority'
    priorityCell.append(createPrioritySelect(todo))

    const actionsCell = document.createElement('div')
    actionsCell.className = 'todo-col-actions'

    const deleteBtn = createDeleteButton(async () => {
      await deleteTodo(todo.id)
      render()
    })

    actionsCell.append(deleteBtn)
    item.append(checkbox, text, priorityCell, actionsCell)
    list.append(item)
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  addButton.disabled = true
  await addTodo(input.value)

  if (getError() === EMPTY_TODO_MESSAGE) {
    addButton.disabled = false
    render()
    return
  }

  input.value = ''
  addButton.disabled = false
  render()
})

input.addEventListener('input', () => {
  if (getError() === EMPTY_TODO_MESSAGE) {
    clearError()
    renderInputError()
  }
})

filterSelect.addEventListener('change', () => {
  filterPriority = filterSelect.value
  render()
})

showCompletedToggle.addEventListener('change', () => {
  showCompleted = showCompletedToggle.checked
  render()
})

authForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  authSubmit.disabled = true

  const email = authEmail.value.trim()
  const password = authPassword.value
  const success =
    authMode === 'signup'
      ? await signUp(email, password)
      : await signIn(email, password)

  if (success) {
    authEmail.value = ''
    authPassword.value = ''
    showAuthForm = false
    await loadTodos()
  }

  authSubmit.disabled = false
  render()
})

authToggle.addEventListener('click', () => {
  authMode = authMode === 'signup' ? 'login' : 'signup'
  renderAuth()
})

onAuthChange(async () => {
  await loadTodos()
  render()
})

async function init() {
  loading = true
  render()
  await initAuth()
  await loadTodos()
  loading = false
  wasAllComplete = areAllTodosComplete()
  render()
}

init()
