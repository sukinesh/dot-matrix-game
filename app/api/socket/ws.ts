// import { createGameState, GameStateType } from "@/components/datatypes";
// import { NextRequest } from "next/server";

// let gameRooms: Record<string, GameStateType> = {};
// let clients: Record<string, WebSocket[]> = {}; // roomId → list of clients

// // Simple physics update
// function updatePhysics(game: GameStateType) {
//   const { ball } = game;
//   ball.x += ball.vx;
//   ball.y += ball.vy;
//   // Add paddle/edge collision logic here
// }

// function startGameLoop(roomId: string) {
//   const loop = setInterval(() => {
//     const game = gameRooms[roomId];
//     if (!game) {
//       clearInterval(loop);
//       return;
//     }

//     updatePhysics(game);

//     // Broadcast updated state to all connected clients
//     for (const ws of clients[roomId] || []) {
//       if (ws.readyState === ws.OPEN) {
//         ws.send(JSON.stringify({ type: "state_update", game }));
//       }
//     }
//   }, 1000 / 60); // 60 FPS
// }

// // 🧠 WebSocket upgrade endpoint
// export const GET = async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);
//   const roomId = searchParams.get("roomId") || "default";

//   // Ensure Next.js provides a WebSocket
//   const { socket } = (req as any);
//   if (!socket) {
//     return new Response("Expected a WebSocket request", { status: 400 });
//   }

//   // Upgrade to WebSocket
//   const { 0: client, 1: server } = Object.values(new WebSocketPair());
//   (server as WebSocket).accept();

//   // Create room state if needed
//   if (!gameRooms[roomId]) {
//     gameRooms[roomId] = createGameState();
//     clients[roomId] = [];
//     startGameLoop(roomId);
//     console.log(`Created room ${roomId}`);
//   }

//   // Add this client to room
//   clients[roomId].push(server as WebSocket);
//   console.log("Client connected to room", roomId);

//   // Handle messages
//   (server as WebSocket).addEventListener("message", (event) => {
//     try {
//       const data = JSON.parse(event.data.toString());

//       if (data.type === "move_paddle") {
//         const game = gameRooms[roomId];
//         if (game) {
//           game.paddles[data.player] += data.dir * 6;
//         }
//       }
//     } catch (err) {
//       console.error("Bad WS message:", err);
//     }
//   });

//   (server as WebSocket).addEventListener("close", () => {
//     clients[roomId] = (clients[roomId] || []).filter((c) => c !== server);
//     console.log("Client disconnected from", roomId);
//   });

//   return new Response(null, {
//     status: 101, // protocol switch
//     webSocket: client,
//   });
// };
