import { useState } from "react";
import Chat from "./Chat";

function Dashbaord() {
    const [showChat, setShowChat] = useState(true);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]);
    

    const users = Array.from({length : 30}, (_, i) => `User ${i + 1}`)

    return(
        <>
        <div className="flex h-[calc(100vh-3rem)] bg-black text-white">
            <div className="w-64 border-r border-zinc-700 p-4 flex flex-col">
                <div className="font-bold text-xl mb-6">Direct Messages</div>
                    <ul className="flex-1 flex flex-col gap-y-2 overflow-y-auto pr-2">
                        {users.map((user, i) => (
                            <li key={i} onClick={ () => {
                                setActiveUser(user);
                                setShowChat(true);
                            }}  className={`font-medium py-2 px-4 rounded cursor-pointer transition
                                ${
                                activeUser === user
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:text-gray-300 hover:bg-zinc-800"
                                }`}
                            >
                            {user}
                            </li>
                        ))}
                    </ul>
            </div>
           
            {showChat ? (
                <Chat ActiveUser={activeUser}
                messages={messages}
                setMessages={setMessages}
                />
            )  : (  
            <div className="flex-1 flex justify-center items-center">
                    <h1 className="font-bold text-3xl">Dashboard</h1>
            </div>
        )}
        </div>

        </>
        )
}

export default Dashbaord;