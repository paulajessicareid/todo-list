import { supabase } from './supabase.js'

export const PRIORITIES = ['low', 'medium', 'high']
export const EMPTY_TODO_MESSAGE = 'You need to write a todo first'

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
    .select('id, text, completed, priority, created_at')
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

export async function deleteTodo(id) {
  lastError = null
  const { error } = await supabase.from('todos').delete().eq('id', id)

  if (error) {
    lastError = error.message
    return
  }

  await loadTodos()
}
