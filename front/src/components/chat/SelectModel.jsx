import { useState } from "react";
import { Model } from "../models/models";
import ModelTableList from "../models/TableListWithFilters";

export default function SelectModel({ actions, state }) {
  const [showModelList, setShowModelList] = useState(false);
  const filteredChoosenModelCapabilities = ["completion"];

  return (
    <div className="flex flex-col h-full min-w-0 border-gray-500 border-2 rounded-md p-4">
      <h5
        className="font-bold cursor-pointer border-gray-500 border-2 rounded-md p-0.5 text-center"
        onClick={() => setShowModelList(true)}
      >
        Select Model
      </h5>
      <div className="text-white text-center text-sm">
        Now using:
        <br />
        name: <b>{state.selectedModel.model_name}</b>
        <br />
        context window: <b>{state.selectedModel.get_context_window_kb()}</b>
        <br />
        size: <b>{state.selectedModel.get_size_gb()}</b>
        <br />
        capabilities: <b>{state.selectedModel.get_capabilities()}</b>
      </div>
      <div
        className={`fixed flex flex-col justify-center items-center h-screen overflow-hidden w-screen left-0 top-0 z-100 gap-2 bg-black/80 ${
          showModelList ? "block" : "hidden"
        }`}
        onClick={() => setShowModelList(false)}
      >
        <div className="bg-black border-gray-500 border-2 rounded-md p-4 h-4/5 w-4/5 overflow-auto">
          <div className="font-bold text-amber-600 text-center mb-4 text-2xl">
            Click to choose model
          </div>
          <ModelTableList
            actions={actions}
            state={state}
            filteredChoosenModelCapabilities={filteredChoosenModelCapabilities}
          />
        </div>
      </div>
    </div>
  );
}
