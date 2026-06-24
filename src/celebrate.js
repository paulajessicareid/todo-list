const CONFETTI_COLORS = [
  '#3bcf73',
  '#7eb8da',
  '#efd844',
  '#e85d4c',
  '#faf6eb',
  '#ffffff',
]

export function celebrate() {
  const layer = document.createElement('div')
  layer.className = 'celebration-layer'
  layer.setAttribute('aria-hidden', 'true')

  const message = document.createElement('p')
  message.className = 'celebration-message'
  message.textContent = 'All done — nice work!'
  layer.append(message)

  for (let i = 0; i < 72; i++) {
    const piece = document.createElement('span')
    piece.className = 'confetti-piece'
    piece.style.left = `${Math.random() * 100}%`
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
    piece.style.animationDelay = `${Math.random() * 0.6}s`
    piece.style.animationDuration = `${2.2 + Math.random() * 1.8}s`
    piece.style.setProperty('--spin', `${360 + Math.random() * 720}deg`)

    if (i % 3 === 0) {
      piece.style.width = '6px'
      piece.style.height = '14px'
    } else if (i % 3 === 1) {
      piece.style.width = '10px'
      piece.style.height = '10px'
      piece.style.borderRadius = '50%'
    }

    layer.append(piece)
  }

  document.body.append(layer)

  window.setTimeout(() => {
    layer.remove()
  }, 4200)
}
