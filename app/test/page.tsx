'use client'
import { io } from "socket.io-client"
import { useEffect, useRef, useState } from "react"
import { createGameState, GameStateType } from "@/components/datatypes"

export default function PongClient() {
  const [socket, setSocket] = useState<any>(null)
  const [gameState, setGameState] = useState<GameStateType>(createGameState())

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keyState = useRef<Record<string, boolean>>({}) // ✅ persistent between renders

  useEffect(() => {
    // Keyboard input
    window.addEventListener('keydown', (e) => (keyState.current[e.key] = true))
    window.addEventListener('keyup', (e) => (keyState.current[e.key] = false))


    // const socket = io(window.location.href.slice(0,-5)+':3001')
    const socket = io(
      window.location.hostname.includes("localhost")
        ? "http://localhost:3001"
        : `${window.location.origin.replace(/\/$/, "")}/api/socket`
    );
    console.log(`${window.location.origin.replace(/\/$/, "")}/api/socket`);

    setSocket(socket)

    socket.emit("join_room", "123");

    socket.on("state_update", (state) => {
      // console.log(state);
      setGameState(state)
    })

    return () => { socket.disconnect(); }

  }, [])

  useEffect(() => {

    if (!socket) return;


    // handle paddle move
    // function move(dir: number) {
    //   socket.emit("move_paddle", { roomId: "123", player: 0, dir })
    // }
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    // Horizontal paddles (for portrait, paddles on top/bottom)
    const paddleWidth = 80
    const paddleHeight = 10
    const paddleOffset = 10
    const width = canvas.width
    const height = canvas.height


    // Move paddles
    // console.log(keyState.current['ArrowLeft'] ? 'left' : keyState.current['ArrowRight'] ? 'right' : '' );
    socket.emit("move_paddle", { roomId: "123", player: 0, dir: keyState.current['ArrowLeft'] ? -1 : keyState.current['ArrowRight'] ? 1 : 0 })

    // move(  keyState['ArrowLeft'] ? -1 : keyState['ArrowRight'] ? 1 : 0 );

    // Draw
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'slategray'
    ctx.beginPath()
    ctx.roundRect(gameState.paddles[1], paddleOffset, paddleWidth, paddleHeight, paddleHeight / 2)
    ctx.roundRect(gameState.paddles[0], height - paddleHeight - paddleOffset, paddleWidth, paddleHeight, paddleHeight / 2)
    ctx.arc(gameState.ball.x % 420, gameState.ball.y % 600, 8, 0, Math.PI * 2)
    ctx.fill();

  }, [gameState, socket]) //redraw on gamestate change


  return (
    <div className="w-full h-full items-center justify-center flex">
      <button className="border" onClick={() => {
        socket.emit("test", "hello from client")
      }}>Click</button>
      <canvas
        ref={canvasRef}
        width={500}
        height={600}
        className="border-2 border-slate-300 rounded-lg "
      />
    </div>
  )
}
