import { useEffect, useState } from "react";
import { fetchModels } from "../api/models";

export default function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels()
      .then((data) => {
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
    return <p className="page text-red-500">Error: {error}</p>;
  }

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      <h1 className="text-2xl font-bold mb-4 text-gray-300">Available Models</h1>
      <table className="w-fit border-collapse text-gray-400 border border-gray-700 font-bold">
        <thead>
          <tr className="bg-black p-4 rounded-md text-amber-600  shadow-md border border-gray-700">
            <th className="text-lg font-semibold border border-gray-700">Model Name</th>
            <th className="text-lg font-semibold border border-gray-700">Context Window</th>
            <th className="text-lg font-semibold border border-gray-700">Capabilities</th>
            <th className="text-lg font-semibold border border-gray-700">Size</th>
          </tr>
        </thead>
        <tbody>
        {models.database_models.map((model) => (
          <tr
            key={model.model_name}
            className="bg-black p-4 rounded-md shadow-md border border-gray-700"
          >
            <td className="text-lg px-4 font-semibold text-amber-600 border border-gray-700">
              {model.model_name}
            </td>
            <td className="text-sm px-4 border border-gray-700">
                {(model.context_window / 1024).toFixed(2)} K
            </td>
            <td className="text-sm px-4 border border-gray-700">
                {model.capabilities.join(", ")}
            </td>
            <td className="text-sm px-4 border border-gray-700">
                {(model.size / 1e9).toFixed(2)} GB
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
