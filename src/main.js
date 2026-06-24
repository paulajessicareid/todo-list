import './style.css'
import {
  getTodos,
  getError,
  loadTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
} from './todos.js'

const form = document.querySelector('#todo-form')
const input = document.querySelector('#todo-input')
const list = document.querySelector('#todo-list')
const addButton = document.querySelector('.todo-add-button')
const errorEl = document.querySelector('.todo-error')

let loading = true

function renderError() {
  if (!errorEl) return
  const error = getError()
  errorEl.textContent = error ?? ''
  errorEl.hidden = !error
}

function render() {
  renderError()
  list.innerHTML = ''

  if (loading) {
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

async function init() {
  loading = true
  render()
  await loadTodos()
  loading = false
  render()
}

init()
