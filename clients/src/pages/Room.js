import { useEffect, useState } from "react";
import axios from "axios";
import { getSocket } from "./socket";

const API = "http://localhost:4000";

export default function App() {
  const socket = getSocket();

  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [roomName, setRoomName] = useState("");

  // load rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data } = await axios.get(`${API}/rooms`);
    setRooms(data);
  };

  // join room + load messages
  const selectRoom = async (room) => {
    setSelected(room);
    socket.emit("join_room", room.id);

    const { data } = await axios.get(`${API}/messages/${room.id}`);
    setMessages(data);
  };

  // listen for messages
  useEffect(() => {
    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("new_message");
  }, []);

  // send message
  const sendMessage = () => {
    if (!text.trim() || !selected) return;

    socket.emit("send_message", {
      roomId: selected.id,
      text,
    });

    setText("");
  };

  // create room
  const createRoom = async () => {
    if (!roomName.trim()) return;

    await axios.post(`${API}/rooms`, { name: roomName });
    setRoomName("");
    fetchRooms();
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT: ROOMS */}
      <div style={{ width: 250, borderRight: "1px solid #ccc", padding: 10 }}>
        <h3>Rooms</h3>

        <input
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={createRoom}>Create</button>

        {rooms.map((r) => (
          <div
            key={r.id}
            onClick={() => selectRoom(r)}
            style={{
              padding: 8,
              cursor: "pointer",
              background: selected?.id === r.id ? "#ddd" : "",
            }}
          >
            {r.name}
          </div>
        ))}
      </div>

      {/* RIGHT: CHAT */}
      <div style={{ flex: 1, padding: 10 }}>
        {selected ? (
          <>
            <h3>{selected.name}</h3>

            <div style={{ height: "70%", overflowY: "auto" }}>
              {messages.map((m) => (
                <div key={m.id}>{m.text}</div>
              ))}
            </div>

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </>
        ) : (
          <p>Select a room</p>
        )}
      </div>
    </div>
  );
}
