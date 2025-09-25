import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
    return (
        <div className="h-screen flex flex-col w-screen">
            <Navbar />
            <main className="flex-1 p-6 flex flex-col min-h-0">
                <Outlet />
            </main>
        </div>
    );
}