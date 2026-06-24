import { supabase } from './supabase.js'

let user = null
let authReady = false
let lastAuthError = null
const listeners = new Set()

function notify() {
  for (const callback of listeners) {
    callback(user)
  }
}

export function getUser() {
  return user
}

export function isAuthReady() {
  return authReady
}

export function getAuthError() {
  return lastAuthError
}

export function isAnonymous() {
  return user?.is_anonymous === true
}

export function onAuthChange(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export async function initAuth() {
  lastAuthError = null

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) {
    user = session.user
  } else {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) {
      lastAuthError = error.message
      authReady = true
      notify()
      return
    }
    user = data.user
  }

  authReady = true
  notify()

  supabase.auth.onAuthStateChange((_event, session) => {
    user = session?.user ?? null
    notify()
  })
}

export async function signUp(email, password) {
  lastAuthError = null
  const { data, error } = await supabase.auth.updateUser({ email, password })

  if (error) {
    lastAuthError = error.message
    return false
  }

  user = data.user
  notify()
  return true
}

export async function signIn(email, password) {
  lastAuthError = null

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  const anonId = currentUser?.is_anonymous ? currentUser.id : null

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    lastAuthError = error.message
    return false
  }

  user = data.user

  if (anonId && anonId !== user.id) {
    const { error: mergeError } = await supabase.rpc('merge_anonymous_todos', {
      anonymous_id: anonId,
    })

    if (mergeError) {
      lastAuthError = mergeError.message
      return false
    }
  }

  notify()
  return true
}

export async function signOut() {
  lastAuthError = null

  const { error: signOutError } = await supabase.auth.signOut()
  if (signOutError) {
    lastAuthError = signOutError.message
    return false
  }

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    lastAuthError = error.message
    return false
  }

  user = data.user
  notify()
  return true
}
