import {  useEffect } from "react";
import {  useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if(!user) return;
    const socket = io(BASE_URL); 
    socket.emit("joinChat", { targetUserId, userId: user?._id });
    socket.on("messageReceived", (message) => {
      setMessages((prevMessages=[]) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
   
  }, [user, targetUserId])
  
    useEffect(() => {
      const fetchMessages = async () => {
        const response = await axios.get(`${BASE_URL}/chat?targetUserId=${targetUserId}`,{withCredentials:true});
        const data=response?.data
        console.log(data);
        setMessages(data?.chats[0]?.messages);
      };
      fetchMessages();
    }, []);

  const sendMessage = () => {
    const socket = io(BASE_URL);
    socket.emit("sendMessage",{
      text:newMessage,
      targetUserId,
      userId: user?._id,
      firstName: user.firstName,
    })
    // setMessages((prevMessages) => [
    //   ...prevMessages,
    //   {
    //     text: newMessage,
    //     firstName: user.firstName,
    //   }
    // ]);
    setNewMessage("");
  }

  return (
    <div className="w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">
      <h1 className="p-5 border-b border-gray-600">Chat</h1>
      <div className="flex-1 overflow-scroll p-5">
        {messages?.map((msg, index) => {
          return (
            <div
              key={index}
              className={
                "chat " +
                (user.firstName === msg.firstName ? "chat-end" : "chat-start")
              }
            >
              <div className="chat-header">
                {`${msg.firstName}`}
                <time className="text-xs opacity-50"> 2 hours ago</time>
              </div>
              <div className="chat-bubble">{msg.text}</div>
              <div className="chat-footer opacity-50">Seen</div>
            </div>
          );
        })}
      </div>
      <div className="p-5 border-t border-gray-600 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-gray-500 text-black rounded p-2"
        ></input>
        <button onClick={sendMessage} className="btn btn-secondary">
          Send
        </button>
      </div>
    </div>
  );
};
export default Chat;
