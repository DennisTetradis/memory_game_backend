import WebSocket from "ws";
import Generate_Matrix from "./matrix_generator";

interface CustomWebSocket extends WebSocket {
  room?: string;
  username?: string;
  isReady?: boolean;
}

export function handleSockets(ws_port: any) {
  const server = new WebSocket.Server({ port: ws_port });
  const rooms: Record<string, CustomWebSocket[]> = {};

  server.on("connection", (ws: CustomWebSocket) => {
    ws.on("message", (message: string) => {
      const data = JSON.parse(message);
      switch (data.type) {
        case "join":
          const roomName = data.room;
          if (!rooms[roomName]) {
            rooms[roomName] = [];
          }
          ws.room = roomName;
          ws.username = data.username;
          ws.isReady = false;
          rooms[roomName].push(ws);

          rooms[data.room].forEach((client) => {
            client.send(
              JSON.stringify({
                type: "player_joined",
                username: data.username,
                message: `${data.username} joined`,
              })
            );
          });

          if (rooms[roomName].length > 20) {
            rooms[data.room].forEach((client) => {
              client.send(
                JSON.stringify({
                  type: "room_alert",
                  message: "STOP RIGHT THERE!",
                })
              );
            });
            ws.close;
          }
          break;

        case "leave":
          const leaveRoom = ws.room;
          if (leaveRoom && rooms[leaveRoom]) {
            rooms[leaveRoom] = rooms[leaveRoom].filter(
              (client) => client !== ws
            );
            if (rooms[leaveRoom].length === 0) {
              delete rooms[leaveRoom];
            }
            console.log(`Client left room: ${leaveRoom}`);
          }
          break;

        case "message":
          if (data.room && rooms[data.room]) {
            rooms[data.room].forEach((client) => {
              client.send(JSON.stringify({ message: data.message }));
            });
          }
          break;

        case "update_scores":
          if (!Array.isArray(data.message)) {
            if (data.room && rooms[data.room]) {
              rooms[data.room].forEach((client) => {
                client.send(
                  JSON.stringify({
                    type: "update_scores",
                    username: data.username,
                    score: data.message,
                    message: "Score updated",
                  })
                );
              });
            }
          } else if (Array.isArray(data.message)) {
            if (data.room && rooms[data.room]) {
              rooms[data.room].forEach((client) => {
                client.send(
                  JSON.stringify({
                    type: "update_scores",
                    score_array: data.message,
                    message: "Scores updated",
                  })
                );
              });
            }
          }
          break;

        case "difficulty_set":
          if (rooms[data.room]) {
            rooms[data.room].forEach((client) => {
              client.send(
                JSON.stringify({
                  type: "difficulty_set",
                  message: "Difficulty has been set!",
                  difficulty: data.message,
                })
              );
            });
          }
          break;

        case "get_next_map":
          const map = Generate_Matrix(data.message.elements, data.message.size);
          if (rooms[data.room]) {
            rooms[data.room].forEach((client) => {
              client.send(
                JSON.stringify({
                  map: map,
                  type: "get_next_map",
                  message: "Map generated",
                })
              );
            });
          }
          break;

        case "ready":
          rooms[data.room].forEach((ws) => {
            if (ws.username === data.username) {
              ws.isReady = data.message;
            }
          });

          const allReady = rooms[data.room].every((ws) => ws.isReady === true);

          if (allReady && rooms[data.room].length > 1) {
            rooms[data.room].forEach((client) => {
              client.send(
                JSON.stringify({
                  type: "done",
                  message: "Everyone is ready",
                })
              );
            });
            rooms[data.room].forEach((ws) => {
              ws.isReady = false;
            });
          } else {
            console.log("Not all users are ready");
          }
          break;

        default:
          console.log("Unknown message type:", data.type);
          break;
      }
    });

    ws.on("close", () => {
      // Handle client disconnect
      const room = ws.room;
      if (room && rooms[room]) {
        const disconnectedUser = rooms[room].find((client) => client === ws);
        rooms[room].forEach((client) => {
          client.send(
            JSON.stringify({
              type: "remove_player",
              username: disconnectedUser?.username,
              message: `${disconnectedUser?.username} has been disconnected`,
            })
          );
        });
        rooms[room] = rooms[room].filter((client) => client !== ws);
        if (rooms[room].length === 0) {
          delete rooms[room];
        }
        console.log(
          `${disconnectedUser?.username} disconnected from room: ${room}`
        );
      }
    });
  });

  console.log("WebSocket server is running on ws://localhost:8080");
}
