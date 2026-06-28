import { supabase } from './supabase.js'

export const PRIORITIES = ['low', 'medium', 'high']
export const EMPTY_TODO_MESSAGE = 'You need to write a todo first'

export const TODO_COLORS = [
  { id: 'green', label: 'Green', hex: '#3bcf73' },
  { id: 'blue', label: 'Blue', hex: '#7eb8da' },
  { id: 'amber', label: 'Amber', hex: '#efd844' },
  { id: 'coral', label: 'Coral', hex: '#e85d4c' },
  { id: 'purple', label: 'Purple', hex: '#b794f4' },
  { id: 'teal', label: 'Teal', hex: '#5ec4bc' },
]

let todos = []
let lastError = null

export function getTodos() {
  return todos
}

export function getError() {
  return lastError
}

export function clearError() {
  lastError = null
}

export async function loadTodos() {
  lastError = null
  const { data, error } = await supabase
    .from('todos')
    .select('id, text, completed, priority, color, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    lastError = error.message
    todos = []
    return
  }

  todos = data
}

export async function addTodo(text) {
  const trimmed = text.trim()
  if (!trimmed) {
    lastError = EMPTY_TODO_MESSAGE
    return
  }

  lastError = null
  const { error } = await supabase
    .from('todos')
    .insert({ text: trimmed, completed: false, priority: 'medium' })

  if (error) {
    lastError = error.message
    return
  }

  await loadTodos()
}

export async function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id)
  if (!todo) return

  lastError = null
  const { error } = await supabase
    .from('todos')
    .update({ completed: !todo.completed })
    .eq('id', id)

  if (error) {
    lastError = error.message
    return
  }

  await loadTodos()
}

export async function updateTodoPriority(id, priority) {
  lastError = null
  const { error } = await supabase
    .from('todos')
    .update({ priority })
    .eq('id', id)

  if (error) {
    lastError = error.message
    return
  }

  await loadTodos()
}

export async function updateTodoColor(id, color) {
  lastError = null
  const todo = todos.find((t) => t.id === id)
  const { error } = await supabase.from('todos').update({ color }).eq('id', id)

  if (error) {
    if (color === null && todo) {
      todo.color = null
      return
    }
    lastError = error.message
    return
  }

  if (todo) {
    todo.color = color
  }
}

export async function deleteTodo(id) {
  lastError = null
  const { error } = await supabase.from('todos').delete().eq('id', id)

  if (error) {
    lastError = error.message
    return
  }

  await loadTodos()
}
