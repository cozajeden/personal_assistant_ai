import { useEffect, useState } from "react";
import { fetchModels } from "../../api/models";
import { Model, ModelFilters } from "./models";
import HeaderCell from "../tables/TableHeaderWithSorting";

const ASC_FILTERS = Object.keys(new ModelFilters()).filter((key) =>
  key.endsWith("_asc")
);

const columns = [
  { header: "Model Name", columnFilter: "model_name_asc" },
  { header: "Context Window", columnFilter: "context_window_asc" },
  { header: "Capabilities", columnFilter: "capabilities_asc" },
  { header: "Size", columnFilter: "size_asc" },
];

const checkboxFilters = [
  { id: "completion", label: "Completion" },
  { id: "thinking", label: "Thinking" },
  { id: "vision", label: "Vision" },
  { id: "insert", label: "Insert" },
  { id: "embedding", label: "Embedding" },
  { id: "tools", label: "Tools" },
];

function arrayContainsAll(mainArray, subArray) {
  const set = new Set(mainArray);
  return subArray.every((item) => set.has(item));
}

export default function ModelTableList({
  filteredChoosenModelCapabilities,
  actions,
  state,
}) {
  const [modelFilters, setModelFilters] = useState(new ModelFilters());
  const [allModels, setAllModels] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels()
      .then((data) => {
        if (filteredChoosenModelCapabilities) {
          data.database_models = data.database_models.filter((model) =>
            arrayContainsAll(
              model.capabilities,
              filteredChoosenModelCapabilities
            )
          );
        }
        setAllModels(data.database_models.map((model) => new Model(model)));
        setModels(data.database_models.map((model) => new Model(model)));
        if (
          actions?.setSelectedModel !== undefined &&
          data.database_models.length > 0
        ) {
          const firstValidModel = data.database_models.find((model) => {
            const _model = new Model(model);
            return _model.get_size_gb() !== "0.00 GB" && model.completion;
          });
          actions.setSelectedModel(
            firstValidModel
              ? new Model(firstValidModel)
              : new Model({
                  model_name: undefined,
                  context_window: 0,
                  size: 0,
                  capabilities: [],
                })
          );
        }
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

    ASC_FILTERS.forEach((filter) => {
      if (modelFilters[filter] === undefined) {
        return;
      }
      const column = filter.slice(0, -4);
      filteredModels = filteredModels.sort((a, b) => {
        if (modelFilters[filter] === true) {
          if (typeof a[column] === "string") {
            return a[column].localeCompare(b[column]);
          } else if (column === "capabilities") {
            return a.get_capabilities().localeCompare(b.get_capabilities());
          } else {
            return a[column] - b[column];
          }
        } else if (modelFilters[filter] === false) {
          if (typeof b[column] === "string") {
            return b[column].localeCompare(a[column]);
          } else if (column === "capabilities") {
            return b.get_capabilities().localeCompare(a.get_capabilities());
          } else {
            return b[column] - a[column];
          }
        } else {
          return 0;
        }
      });
    });

    setModels(filteredModels);
  }, [modelFilters, state.selectedModel]);

  if (error) {
    return <p className="page text-red-500">Error: {error}</p>;
  }

  const handleFilter = (e) => {
    setModelFilters({ ...modelFilters, [e.target.id]: e.target.checked });
  };

  return (
    <div className="page flex flex-col gap-4 w-full items-center">
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
            {columns.map(({ header, columnFilter }) => (
              <HeaderCell
                key={header}
                columnHeader={header}
                columnFilter={columnFilter}
                allFilters={modelFilters}
                setAllFilters={setModelFilters}
                state={modelFilters[columnFilter]}
                usedFilters={ASC_FILTERS}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr
              key={model.model_name}
              className={`p-4 rounded-md shadow-md border border-gray-700
                ${
                  model.model_name === state.selectedModel?.model_name
                    ? "bg-gray-900"
                    : "bg-black"
                }
                ${
                  actions?.setSelectedModel !== undefined
                    ? "cursor-pointer"
                    : ""
                }`}
              onClick={() => actions.setSelectedModel(model)}
            >
              <td className="text-lg px-4 font-semibold text-amber-600 border border-gray-700">
                {model.model_name}
              </td>
              <td className="text-sm px-4 border border-gray-700">
                {model.get_context_window_kb()}
              </td>
              <td className="text-sm px-4 border border-gray-700">
                {model.get_capabilities()}
              </td>
              <td className="text-sm px-4 border border-gray-700">
                {model.get_size_gb()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
