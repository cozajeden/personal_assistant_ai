import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Chat from "./pages/Chat";
import Models from "./pages/Models";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/chat",
                element: <Chat />,
            },
            {
                path: "/models",
                element: <Models />,
            },
        ],
    },
]);