import { useEffect, useState } from "react";
import { fetchModels } from "../api/models";
import { Model, ModelFilters } from "../types/models";

const ASC_FILTERS = Object.keys(new ModelFilters()).filter((key) =>
  key.endsWith("_asc")
);

function HeaderCell({
  columnHeader,
  columnId,
  handleOrder,
  modelFilters,
  setModelFilters,
  state,
}) {
  return (
    <th className="text-lg font-semibold border border-gray-700">
      <div className="flex flex-row justify-between px-4 gap-2">
        <div>{columnHeader}</div>
        <div className="flex flex-row gap-2">
          <div
            className={`cursor-pointer ${state === true ? "text-white" : ""}`}
            onClick={() =>
              handleOrder(columnId, "asc", modelFilters, setModelFilters)
            }
          >
            ⮝
          </div>
          <div
            className={`cursor-pointer ${state === false ? "text-white" : ""}`}
            onClick={() =>
              handleOrder(columnId, "desc", modelFilters, setModelFilters)
            }
          >
            ⮟
          </div>
        </div>
      </div>
    </th>
  );
}

const columns = [
  { header: "Model Name", asc: "model_name_asc" },
  { header: "Context Window", asc: "context_window_asc" },
  { header: "Capabilities", asc: "capabilities_asc" },
  { header: "Size", asc: "size_asc" },
];

const checkboxFilters = [
  { id: "completion", label: "Completion" },
  { id: "thinking", label: "Thinking" },
  { id: "vision", label: "Vision" },
  { id: "insert", label: "Insert" },
  { id: "embedding", label: "Embedding" },
  { id: "tools", label: "Tools" },
];

const handleOrder = (columnId, direction, modelFilters, setModelFilters) => {
  const currentValue = modelFilters[columnId];
  const targetValue = direction === "asc" ? true : false;

  if (currentValue === targetValue) {
    // If checked was clicked again, uncheck it
    setModelFilters({ ...modelFilters, [columnId]: undefined });
  } else {
    // If unchecked was clicked, uncheck all other ascending filters and check the current one
    setModelFilters({
      ...modelFilters,
      ...Object.fromEntries(
        ASC_FILTERS.filter((filter) => filter !== columnId).map((filter) => [
          filter,
          undefined,
        ])
      ),
      [columnId]: targetValue,
    });
  }
};

export default function Models() {
  const [modelFilters, setModelFilters] = useState(new ModelFilters());
  const [allModels, setAllModels] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels()
      .then((data) => {
        setAllModels(data.database_models.map((model) => new Model(model)));
        setModels(data.database_models.map((model) => new Model(model)));
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    // Apply filters
    let filteredModels = allModels.filter((model) => {
      let passesFilters = model.model_name
        .toLowerCase()
        .includes(modelFilters.model_name.toLowerCase());
      checkboxFilters.forEach((filter) => {
        passesFilters =
          passesFilters &&
          (model[filter.id] === modelFilters[filter.id] ||
            !modelFilters[filter.id]);
      });

      return passesFilters;
    });

    // Apply sorting
    ASC_FILTERS.forEach((filter) => {
      if (modelFilters[filter] === undefined) {
        return;
      }
      const column = filter.slice(0, -4);
      filteredModels = filteredModels.sort((a, b) => {
        if (modelFilters[filter] === true) {
          if (typeof a[column] === "string") {
            return a[column].localeCompare(b[column]);
          } else {
            return a[column] - b[column];
          }
        } else if (modelFilters[filter] === false) {
          if (typeof b[column] === "string") {
            return b[column].localeCompare(a[column]);
          } else {
            return b[column] - a[column];
          }
        } else {
          return 0;
        }
      });
    });

    setModels(filteredModels);
  }, [modelFilters]);

  if (error) {
    return <p className="page text-red-500">Error: {error}</p>;
  }

  const handleFilter = (e) => {
    console.log(`${e.target.id}`, e.target.checked);
    setModelFilters({ ...modelFilters, [e.target.id]: e.target.checked });
  };

  return (
    <div className="page flex flex-col gap-4 w-full items-center">
      <h1 className="text-2xl font-bold mb-4 text-gray-300">
        Available Models
      </h1>
      <div className="flex flex-row flex-wrap gap-4 w-full items-center justify-center">
        <input
          className="border-gray-700 border-2 rounded-md p-2"
          type="text"
          placeholder="model name partial search"
          value={modelFilters.model_name}
          required={false}
          onChange={(e) =>
            setModelFilters({ ...modelFilters, model_name: e.target.value })
          }
        />
        {/* Map over checkboxes */}
        {checkboxFilters.map(({ id, label }) => (
          <div key={id} className="flex items-center gap-2">
            <input
              id={id}
              type="checkbox"
              checked={modelFilters[id] || false}
              onChange={handleFilter}
            />
            <label htmlFor={id}>{label}</label>
          </div>
        ))}
      </div>
      <table className="w-fit border-collapse text-gray-400 border border-gray-700 font-bold">
        <thead>
          <tr className="bg-black p-4 rounded-md text-amber-600  shadow-md border border-gray-700">
            {/* Map over column headers */}
            {columns.map(({ header, asc }) => (
              <HeaderCell
                key={header}
                columnHeader={header}
                columnId={asc}
                handleOrder={handleOrder}
                modelFilters={modelFilters}
                setModelFilters={setModelFilters}
                state={modelFilters[asc]}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Map over models */}
          {models.map((model) => (
            <tr
              key={model.model_name}
              className="bg-black p-4 rounded-md shadow-md border border-gray-700"
            >
              <td className="text-lg px-4 font-semibold text-amber-600 border border-gray-700">
                {model.model_name}
              </td>
              <td className="text-sm px-4 border border-gray-700">
                {model.get_context_window_kb()} K
              </td>
              <td className="text-sm px-4 border border-gray-700">
                {model.get_capabilities()}
              </td>
              <td className="text-sm px-4 border border-gray-700">
                {model.get_size_gb()} GB
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
