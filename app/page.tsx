'use client'

import { database } from '@/func/firebase'
import { getRandomValues } from 'crypto'
import { DataSnapshot, get, off, onDisconnect, onValue, ref, remove, set, update } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function checkPlayerPresence(roomId: number, playerId: number) {
  const myStatusRef = ref(database, `rooms/${roomId}/players/${playerId}/status`)
  const connectedRef = ref(database, ".info/connected")

  onValue(connectedRef, (snap: DataSnapshot) => {
    if (snap.val() === false) return
    // When connected, mark as online
    set(myStatusRef, true)
    // When client disconnects (closes tab, reloads, etc.)
    onDisconnect(myStatusRef).set(false)
  })

}

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [roomID, setRoomId] = useState(0);
  const [playerName, setPlayerName] = useState<string>("");
  const [iAmHost, setIAmHost] = useState<boolean>(false);
  const [player1, setPlayer1] = useState<string>('');
  const [player2, setPlayer2] = useState<string>('');
  const [player1Status, setPlayer1Status] = useState<boolean>(false);
  const [player2Status, setPlayer2Status] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);

  let animationId: number;

  let ballSpeedX = 0;
  let ballSpeedY = 0;



  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const playerNameLocal = localStorage.getItem('playerName');
    if (playerNameLocal && playerNameLocal != '') setPlayerName(playerNameLocal);


        const width = canvas.width
    const height = canvas.height

        const testLoop = () => {
              ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = 'slategray'
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil((Date.now()) / 1000) +'', width / 2, height / 2);
        animationId = requestAnimationFrame(testLoop)
    }
    testLoop();



    if (roomID == 0) return;
    //things after roomID is set

    checkPlayerPresence(roomID, iAmHost ? 1 : 2);
    //setting players
    const roomRef = ref(database, 'rooms/' + roomID);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.players[1]) {
          setPlayer1(data.players[1].name);
          setPlayer1Status(data.players[1].status);
          // console.log(data.player1, playerName)
        }
        if (data.players[2]) {
          setPlayer2(data.players[2].name);
          setPlayer2Status(data.players[2].status);
        }
        else
          setPlayer2('');
      }
      else if (!iAmHost) {
        setRoomId(0);
        // localStorage.removeItem('roomId');
        alert("Room has been closed by host.");
      }
    });


    // dimensions
    // const width = canvas.width
    // const height = canvas.height
    let ballX = width / 2
    let ballY = height / 2
    // let ballSpeedX = Math.floor(Math.random() * 4) + 2;

    //  ballSpeedY = 3; ballSpeedX = 3;


    // Horizontal paddles (for portrait, paddles on top/bottom)
    const paddleWidth = 80
    const paddleHeight = 10
    const paddleOffset = 10
    let topPaddleX = (width - paddleWidth) / 2
    let bottomPaddleX = (width - paddleWidth) / 2
    ballSpeedY = 3; ballSpeedX = 3;


    const keyState: Record<string, boolean> = {}

    // Keyboard input
    window.addEventListener('keydown', (e) => (keyState[e.key] = true))
    window.addEventListener('keyup', (e) => (keyState[e.key] = false))


    onValue(ref(database, "rooms/" + roomID), (snapshot) => {
      const data = snapshot.val();
      setStartTime(data.startTime);
    })



    const loop = () => {

      if (Date.now() < startTime) {
      // if(true)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = 'slategray'
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game starting in ' + Math.ceil((startTime - Date.now()) / 1000) + '...', width / 2, height / 2);
        animationId = requestAnimationFrame(loop)
        return
      }
      // if(player1 == playerName) setIAmHost(true);
      // Update ball position
      ballX += ballSpeedX
      ballY += ballSpeedY

      // Bounce left/right
      if (ballX < 0 || ballX > width) ballSpeedX *= -1

      // Bounce top/bottom paddles
      if (
        ballY < (paddleHeight + paddleOffset) &&
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
        // ballSpeedX = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 4) + 2);
      }

      // Move paddles
      if (keyState['ArrowLeft']) bottomPaddleX -= 6
      if (keyState['ArrowRight']) bottomPaddleX += 6

      //top paddle value from database
      onValue(ref(database, "rooms/" + roomID + '/players/' + (iAmHost ? 2 : 1) + '/position'), (snapshot) => {
        const data = snapshot.val();
        if (data)
          topPaddleX = data;
        else return
      });

      // console.log(playerName ,player1 , adminBool);

      update(ref(database, "rooms/" + roomID + '/players/' + (iAmHost ? 1 : 2)), { position: bottomPaddleX });

      // console.log(topPaddleX,bottomPaddleX);


      // Clamp paddles
      topPaddleX = Math.max(0, Math.min(width - paddleWidth, topPaddleX))
      bottomPaddleX = Math.max(0, Math.min(width - paddleWidth, bottomPaddleX))

      // Draw
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = 'slategray'
      ctx.beginPath()
      ctx.roundRect(topPaddleX, paddleOffset, paddleWidth, paddleHeight, paddleHeight / 2)
      ctx.roundRect(bottomPaddleX, height - paddleHeight - paddleOffset, paddleWidth, paddleHeight, paddleHeight / 2)
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2)
      ctx.fill()

      animationId = requestAnimationFrame(loop)
    }


    console.log(startTime);
    
    if (startTime > 0) {

      loop();
    }
    else {
      cancelAnimationFrame(animationId);
    }

  }, [roomID,startTime])



  // console.log(roomID);

  const RoomManager = () => {
    const NameSetter = () => {
      return <div className='p-2 border-2 rounded border-slate-300 '>
        <h2 className='mb-2'>Select a Name</h2>
        <input type="text" placeholder="Enter your name" id="nameInput" className="border p-2 rounded w-full" />
        <button className="mt-2 px-4 py-2 bg-slate-700 text-white rounded cursor-pointer" onClick={() => {
          const name = (document.getElementById('nameInput') as HTMLInputElement).value
          if (!name) {
            alert("Please enter a valid name.")
            return
          }
          localStorage.setItem('playerName', name)
          setPlayerName(name)
          alert("Name set to: " + name)
        }}>Set Name</button>
      </div>
    }
    const RoomCreator = () => {
      return <>
        <h2 className='font-semibold font-mono text-slate-500 text-lg'>Hi {playerName}</h2>
        <div className='p-2 border-2 rounded border-slate-300 '>
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="account">Create Room</TabsTrigger>
              <TabsTrigger value="password">Join Room</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <div className='p-4'>
                <input type="number" placeholder="Enter Room ID" id="createRoomIdInput" className="border p-2 rounded w-full mb-2" />
                <button className="px-4 py-2 bg-slate-700 text-white rounded mb-2 cursor-pointer" onClick={() => {
                  const roomId = parseInt((document.getElementById('createRoomIdInput') as HTMLInputElement).value)
                  if (!roomId || roomId == 0) {
                    alert("Please enter a valid Room ID.")
                    return
                  }
                  // Check if room already exists
                  const roomRef = ref(database, 'rooms/' + roomId)
                  onValue(roomRef, (snapshot) => {
                    if (snapshot.exists()) {
                      alert("Room ID already exists. Please choose a different ID.")
                    } else {
                      set(ref(database, 'rooms/' + roomId), {
                        start: false,
                        players: {
                          1: {
                            name: playerName, status: true,
                            position: (canvasRef.current ? (canvasRef.current.width - 80) / 2 : 210),
                          },
                        }
                      }).then(() => {
                        // localStorage.setItem('roomId', roomId.toString())
                        alert("Room created! Room ID: " + roomId + "\nShare this ID with your friend to join the game.")
                        setIAmHost(true)
                        setRoomId(roomId)
                      })
                    }
                  }, { onlyOnce: true })
                }}>Create Room</button>
              </div>
            </TabsContent>
            <TabsContent value="password">
              <div className='p-4'>
                <input type="number" placeholder="Enter Room ID" id="roomIdInput" className="border p-2 rounded w-full mb-2" />
                <button className="px-4 py-2 bg-slate-700 text-white rounded cursor-pointer" onClick={() => {
                  const roomId = parseInt((document.getElementById('roomIdInput') as HTMLInputElement).value)
                  if (!roomId || roomId == 0) {
                    alert("Please enter a valid Room ID.")
                    return
                  }
                  const roomRef = ref(database, 'rooms/' + roomId)
                  onValue(roomRef, (snapshot) => {
                    if (snapshot.exists()) {
                      update(ref(database, 'rooms/' + roomId + '/players/'), {
                        2: {
                          name: playerName, status: true,
                          position: (canvasRef.current ? (canvasRef.current.width - 80) / 2 : 210),
                        },
                      },
                      ).then(() => {
                        // localStorage.setItem('roomId', roomId.toString())
                        alert("Joined Room: " + roomId + "\nWait for host to start the game.")
                        setRoomId(roomId)
                      })
                    } else {
                      alert("Room ID not found. Please check and try again.")
                    }
                  }, { onlyOnce: true })
                }}>Join Room</button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </>
    }
    const Roombuttons = () => {
      return <div>
        <h2 className='font-semibold'>Players in Room :{roomID}</h2>
        <ul className=' list-inside mb-4'>
          <li><div className='flex items-center gap-2'><span className={`w-2 h-2 rounded-full ${player1Status ? 'bg-green-500' : 'bg-red-500'}`}></span> {player1 ? player1 : "Waiting for player..."}</div> </li>
          <li><div className='flex items-center gap-2'><span className={`w-2 h-2 rounded-full ${player2Status ? 'bg-green-500' : 'bg-red-500'}`}></span>{player2 ? player2 : "Waiting for player..."}</div></li>
        </ul>
        {(playerName == player1 && player1 != '') ?
          <div className='flex gap-2'>
            <button className="px-4 py-2 bg-green-200 text-slate-700 rounded cursor-pointer hover:border-slate-500 border-transparent border-2 font-semibold disabled:border-transparent disabled:text-slate-500" disabled={player2 == ''} onClick={() => {
              update(ref(database, 'rooms/' + roomID), {
                start: true,
                startTime: (Math.floor(Date.now() / 1000) * 1000) + 10000 //5 seconds from now
              }).then(() => {
                // alert("Game Started!")
              })
            }}>Start Game</button>
            <button className={`px-4 py-2 bg-red-200 text-slate-700 rounded cursor-pointer hover:border-slate-500 border-transparent border-2 font-semibold `} onClick={() => {
              setRoomId(0)
              //delete the room from database
              const roomRef = ref(database, 'rooms/' + roomID)
              cancelAnimationFrame(animationId);
              remove(roomRef).then(() => {
                alert("Room deleted.")
                window.location.reload();
              })

            }}>Close Room</button>
            <button className={`px-4 py-2 bg-red-200 text-slate-700 rounded cursor-pointer hover:border-slate-500 border-transparent border-2 font-semibold `} onClick={() => {
              update(ref(database, 'rooms/' + roomID), { start: false }).then(() => {
                cancelAnimationFrame(animationId);
              })
            }}>Stop</button>

          </div>
          :
          <button className="px-4 py-2 bg-red-200 text-slate-700 rounded cursor-pointer hover:border-slate-500 border-transparent border-2 font-semibold" onClick={() => {
            setRoomId(0)
            //remove player2 from room
            remove(ref(database, 'rooms/' + roomID + '/players/2')).then(() => {
              alert("You have left the room.")
              window.location.reload();
            })
          }}>Leave Room</button>}
      </div>
    }
    return <div className='m-4 flex flex-col gap-4'>
      <h1 className="text-2xl font-bold font-mono text-slate-500">Dot Matrix Pong</h1>
      {(playerName == '') ?
        <NameSetter />
        :
        <>
          {roomID == 0 ?
            <RoomCreator />
            :
            <Roombuttons />
          }
        </>}

    </div>
  }
  return (
    <div className="flex  h-screen bg-slate-100 w-full">
      <RoomManager />
      <div className="flex items-center justify-center flex-1">
        <canvas
          ref={canvasRef}
          width={500}
          height={600}
          className="border-2 border-slate-300 rounded-lg "
        />
      </div>
    </div>
  )
}
