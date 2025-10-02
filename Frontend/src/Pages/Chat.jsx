import { useState } from "react";

function Chat({ActiveUser, messages, setMessages}) {
    const [input , setinput] = useState("");

    const handleSendMessage = () => {
        if(!input.trim()) return;

        
    }




    return (
        <>
            <div className="w-screen h-screen flex flex-col text-white">
                <div>
                    <div className="flex items-center justify-between border-b border-zinc-700 p-4">
                        <h2 className="text-xl font-bold">User Name</h2>
                        <div className="gap-14 flex">
                            <button className="text-zinc-400 hover:text-white">Call</button>
                            <button className="text-zinc-400 hover:text-white">Video Call</button>
                        </div>
                        
                    </div>
                </div>
                <div className="flex justify-between items-center border-a border-zinc-700 p-4">
                    <div className="flex-1 p-4 overflow-y-auto h-[calc(100vh-10rem)]">
                        <div className="mb-4 flex flex-col items-start justify-start">
                            <div className="bg-zinc-800 p-4 rounded-lg max-w-xs">
                                <p className="text-white">Message 1</p>
                            </div>
                            <span className="text-xs text-zinc-400 py-1">10:00 AM</span>
                        </div>
                        <div className="mb-4 flex flex-col items-end justify-end">
                            <div className="bg-blue-600 p-4 rounded-lg max-w-xs inline-block">
                                <p className="text-white">message 2</p>
                            </div>
                            <span className="text-xs text-zinc-40 py-1">10:01 AM</span>
                        </div>
                    </div>
                </div>
                    
                    <div className="w-full p-4">
                        <input type="text" placeholder="Enter your message . . ." className="font-medium px-8 py-4 rounded-2xl w-full bg-zinc-900 outline-none" />
                    </div>
            </div>
        </>
    )
}

export default Chat;
