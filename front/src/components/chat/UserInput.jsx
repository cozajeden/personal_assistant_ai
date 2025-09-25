import { useState } from "react";


export default function UserInput({ sendMessage }) {
    const [input, setInput] = useState("");
    const handleSendMessage = () => {
        if (input.trim()) {
            sendMessage(JSON.stringify({ "type": "chat", "content": input }));
            setInput("");
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendMessage();
    }
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && e.shiftKey === false) {
            e.preventDefault();
            handleSendMessage();
        }
    }
    return (
        <div className="flex flex-col h-full w-4/5 border-gray-500 border-2 rounded-md p-4 grow">
            <h5 className="text-2xl font-bold">User Input</h5>
            <form className="flex flex-row h-full relative" onSubmit={handleSubmit}>
                <textarea autoFocus name="user-input" className="flex-grow h-full border-gray-500 border-2 rounded-md p-4" type="text" value={input} onChange={(e) => setInput(e.target.value)} required onKeyDown={handleKeyDown}/>
                <button className="absolute right-0 bottom-0" type="submit">Send</button>
            </form>
        </div>
    );
}