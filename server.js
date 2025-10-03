import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 10000; // Render сам задаст порт

// HTTP сервер
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket сервер
const wss = new WebSocketServer({ server });

let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected, total:", clients.size);

  // Отправляем всем количество клиентов
  broadcast({ viewers: clients.size });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected, total:", clients.size);
    broadcast({ viewers: clients.size });
  });
});

function broadcast(data) {
  const message = JSON.stringify(data);
  for (let client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

// Корневая страница (для проверки)
app.get("/", (req, res) => {
  res.send("WebSocket server is running");
});
