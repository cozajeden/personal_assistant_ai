import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="flex gap-6 p-4 shadow-md bg-gray-100">
            <Link to="/chat" className="hover:text-lue-6000 font-medium">
                Chat
            </Link>
            <Link to="/models" className="hover:text-lue-6000 font-medium">
                Models
            </Link>
        </nav>
    );
}