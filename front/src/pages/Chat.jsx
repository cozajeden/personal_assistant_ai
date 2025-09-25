import ChatList from "../components/chat/ChatList";
import ChatBox from "../components/chat/ChatBox";


export default function Chat() {
    return (
        <div className="flex flex-col min-h-0 w-full flex-grow">
            <h1 className="text-2xl font-bold mb-4 justify-center">Chat</h1>
            <div className="flex flex-row min-h-0 h-full">
            <ChatList />
            <ChatBox />
            </div>
        </div>
    );
}