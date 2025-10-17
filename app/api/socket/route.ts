// app/api/socket/route.ts
import { createGameState, GameStateType } from "@/components/datatypes"
import { NextRequest } from "next/server"
import { Server } from "socket.io"

let gameRooms: { [roomId: string]: GameStateType } = {};

const io = new Server(3001, { cors: { origin: "*" } })
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id)

  socket.on("join_room", (roomId) => {
    socket.join(roomId)

    // Create room if it doesn't exist
    if (!gameRooms[roomId]) {
      gameRooms[roomId] = createGameState()
      startGameLoop(roomId)
      console.log('Created room');
    }
    
    console.log(`${socket.id} joined ${roomId}`)
  })

  socket.on("move_paddle", ({ roomId, player, dir }) => {
    const game = gameRooms[roomId]
    if (game)
      game.paddles[player] += dir * 6;

    console.log(game.paddles);
  })

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id)
  })

  socket.on("test", (msg) => {
    console.log("Received test message from client:", msg)
  })
})

function startGameLoop(roomId: string) {
  setInterval( () => {
    const game = gameRooms[roomId]
    if (!game) {
      console.log('no game');
      return;
    }

    updatePhysics(game)
    io.to(roomId).emit("state_update", game)
    
  }, 1000 / 60) // 60 FPS
}


function updatePhysics(game: GameStateType) {
  const { ball } = game
  ball.x += ball.vx
  ball.y += ball.vy

  // Collision logic here--------------------------------------
}

export async function GET(req: NextRequest) {
  // Needed to keep Next.js API happy
  return new Response("WebSocket Server Running")
}
