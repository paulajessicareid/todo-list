import './style.css'
import {
  getTodos,
  loadTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
} from './todos.js'

const form = document.querySelector('#todo-form')
const input = document.querySelector('#todo-input')
const list = document.querySelector('#todo-list')

function render() {
  const todos = getTodos()
  list.innerHTML = ''

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
    checkbox.addEventListener('change', () => {
      toggleTodo(todo.id)
      render()
    })

    const text = document.createElement('span')
    text.className = 'todo-text'
    text.textContent = todo.text

    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'delete-btn'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', () => {
      deleteTodo(todo.id)
      render()
    })

    item.append(checkbox, text, deleteBtn)
    list.append(item)
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  addTodo(input.value)
  input.value = ''
  render()
})

loadTodos()
render()
