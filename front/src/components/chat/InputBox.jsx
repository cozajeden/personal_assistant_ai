import UserInput from "./UserInput";
import SelectModel from "./SelectModel";

export default function InputBox({ state, actions }) {
  return (
    <div className="flex flex-row h-1/4 w-full border-gray-500 border-2 rounded-md">
      <SelectModel actions={actions} state={state} />
      <UserInput actions={actions} state={state} />
    </div>
  );
}
