import { useEffect, useState } from "react";
import { fetchModels } from "../api/models";


export default function Models() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchModels()
            .then((data) => {
                console.log("API response:", data);
                setModels(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p className="papge">Loading models...</p>;
    }

    if (error) {
        return <p className="page text-red-500">Error: {error}</p>
    }

    return (
        <div className="page">
            <h1 className="text-2xl font-bold mb-4 text-white">Available Models</h1>
            <ul className="space-y-4 grid grid-cols-5 gap-4 grid-flow-row">
                {models.database_models.map((model) => (
                    <li key={model.model_name} className="bg-black p-4 rounded-md shadow-md border border-gray-700">
                        <h2 className="text-lg font-semibold text-amber-500">{model.model_name}</h2>
                        <p className="text-sm">
                        Context window: <span className="text-rose-500 font-bold">{model.context_window}</span>
                        </p>
                        <p className="text-sm">
                        Capabilities: <span className="text-violet-500 font-bold">{model.capabilities.join(", ")}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                        Size: <span className="text-lime-500 font-bold">{(model.size / 1e9).toFixed(2)} GB</span>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
