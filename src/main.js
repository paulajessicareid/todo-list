import './style.css'
import {
  getTodos,
  getError,
  loadTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
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

const form = document.querySelector('#todo-form')
const input = document.querySelector('#todo-input')
const list = document.querySelector('#todo-list')
const addButton = document.querySelector('.todo-add-button')
const errorEl = document.querySelector('.todo-error')
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

function renderError() {
  if (!errorEl) return
  const error = getAuthError() ?? getError()
  errorEl.textContent = error ?? ''
  errorEl.hidden = !error
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
  renderAuth()
  list.innerHTML = ''

  if (loading || !isAuthReady()) {
    const empty = document.createElement('li')
    empty.className = 'empty-state'
    empty.textContent = 'Loading...'
    list.append(empty)
    return
  }

  const todos = getTodos()

  if (todos.length === 0) {
    const empty = document.createElement('li')
    empty.className = 'empty-state'
    empty.textContent = 'No todos yet. Add one above!'
    list.append(empty)
    return
  }

  for (const todo of todos) {
    const item = document.createElement('li')
    item.className = todo.completed ? 'completed' : ''

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.completed
    checkbox.addEventListener('change', async () => {
      await toggleTodo(todo.id)
      render()
    })

    const text = document.createElement('span')
    text.className = 'todo-text'
    text.textContent = todo.text

    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'delete-btn'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', async () => {
      await deleteTodo(todo.id)
      render()
    })

    item.append(checkbox, text, deleteBtn)
    list.append(item)
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  addButton.disabled = true
  await addTodo(input.value)
  input.value = ''
  addButton.disabled = false
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
  render()
}

init()
