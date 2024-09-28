import { useEffect, useState } from "react";

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [usermessage, setUserMessage] = useState<string>("");

  //connect to the wss
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => {
      console.log("Connected to the server");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log("Received a message from the server");

      //check if the event.data is a Blob and convert it to text
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          setMessages((prevMessage) => [...prevMessage, text]);
        };
        reader.readAsText(event.data);
      } else if (typeof event.data == "string") {
        setMessages((prevMessage) => [...prevMessage, event.data]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from the server");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error(error);
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, []);
  if (!socket) {
    return (
      <div>
        <p>Connecting to the WS Server</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Websocket Chat</h1>
      <div>
        <div>
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
        <div>
          <input
            type="text"
            value={usermessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            onClick={() => {
              // send message if not empty
              if (usermessage !== "") socket.send(usermessage);
              setUserMessage("");
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
