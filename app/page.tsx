'use client'

import { useEffect, useRef } from 'react'

export default function PongPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Portrait dimensions
    const width = canvas.width
    const height = canvas.height
    let ballX = width / 2
    let ballY = height / 2
    let ballSpeedX = 4
    let ballSpeedY = 4

    // Horizontal paddles (for portrait, paddles on top/bottom)
    const paddleWidth = 80
    const paddleHeight = 10
    const paddleOffset = 10
    let topPaddleX = (width - paddleWidth) / 2
    let bottomPaddleX = (width - paddleWidth) / 2

    const keyState: Record<string, boolean> = {}

    // Keyboard input
    window.addEventListener('keydown', (e) => (keyState[e.key] = true))
    window.addEventListener('keyup', (e) => (keyState[e.key] = false))

    const loop = () => {
      // Update ball position
      ballX += ballSpeedX
      ballY += ballSpeedY

      // Bounce left/right
      if (ballX < 0 || ballX > width) ballSpeedX *= -1

      // Bounce top/bottom paddles
      if (
        ballY < (paddleHeight+paddleOffset) &&
        ballX > topPaddleX &&
        ballX < topPaddleX + paddleWidth
      )
        ballSpeedY *= -1

      if (
        ballY > (height - paddleHeight - paddleOffset) &&
        ballX > bottomPaddleX &&
        ballX < bottomPaddleX + paddleWidth
      )
        ballSpeedY *= -1

      // Reset ball if out of bounds
      if (ballY < 0 || ballY > height) {
        ballX = width / 2
        ballY = height / 2
        ballSpeedY *= -1
      }

      // Move paddles
      if (keyState['a']) topPaddleX -= 6
      if (keyState['d']) topPaddleX += 6
      if (keyState['ArrowLeft']) bottomPaddleX -= 6
      if (keyState['ArrowRight']) bottomPaddleX += 6

      // Clamp paddles
      topPaddleX = Math.max(0, Math.min(width - paddleWidth, topPaddleX))
      bottomPaddleX = Math.max(0, Math.min(width - paddleWidth, bottomPaddleX))

      // Draw
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = 'slategray'
      // ctx.fillRect(topPaddleX, 0, paddleWidth, paddleHeight)
      // ctx.fillRect(bottomPaddleX, height - paddleHeight, paddleWidth, paddleHeight)
      ctx.beginPath()
      ctx.roundRect(topPaddleX, paddleOffset, paddleWidth, paddleHeight, paddleHeight / 2)
      ctx.roundRect(bottomPaddleX, height - paddleHeight - paddleOffset, paddleWidth, paddleHeight, paddleHeight / 2)
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2)
      ctx.fill()

      requestAnimationFrame(loop)
    }

    loop()
  }, [])

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <canvas
        ref={canvasRef}
        width={500}   
        height={600}  
        className="border-2 border-slate-300 rounded-lg"
      />
    </div>
  )
}
