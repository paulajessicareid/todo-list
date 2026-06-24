import { supabase } from './supabase.js'

let todos = []
let lastError = null

export function getTodos() {
  return todos
}

export function getError() {
  return lastError
}

export async function loadTodos() {
  lastError = null
  const { data, error } = await supabase
    .from('todos')
    .select('id, text, completed, created_at')
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
  if (!trimmed) return

  lastError = null
  const { error } = await supabase
    .from('todos')
    .insert({ text: trimmed, completed: false })

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

export async function deleteTodo(id) {
  lastError = null
  const { error } = await supabase.from('todos').delete().eq('id', id)

  if (error) {
    lastError = error.message
    return
  }

  await loadTodos()
}
