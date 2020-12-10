const dist = (p1, p2) => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx*dx + dy*dy)
}

const avg = (p1, p2, t=0.5) => ({
  x: p1.x + (p2.x - p1.x)*t,
  y: p1.y + (p2.y - p1.y)*t,
})
