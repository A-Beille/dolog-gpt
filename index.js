import express from "express";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { Mistral } from "@mistralai/mistralai";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const http = new Server(app);
const io = new SocketServer(http);

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

// Deployment of index.html using socket.io

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  })
app.use(express.static("assets"))
const testEnabled = false
io.on('connection', (socket) => {// Event listener for connection
    socket.on("answerWaited",async (id, content)=>{
        if(id == socket.id){
            if(testEnabled) return io.emit(`answer`,id, "Test mode is enabled")
            const result = await client.agents.complete({
                messages: [
                  {
                    content:
                      `${content}`,
                    role: "user",
                  },
                ],
                agentId: process.env.DOLOG_AI
              });
              const final = result.choices[0].message.content
              console.log(final)
              io.emit(`answer`,id, final)
        }
    })
  })

http.listen(2000, () => { // Listening to port 3333
    console.log(`Launched`)
  });