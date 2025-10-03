import UserInput from "./UserInput";
import SelectModel from "./SelectModel";

const components = {
  UserInput,
  SelectModel,
};

export default function InputBox({
  sendMessage,
  setChoosenModel,
  choosenModel,
}) {
  return (
    <div className="flex flex-row h-1/4 w-full border-gray-500 border-2 rounded-md">
      <SelectModel
        setChoosenModel={setChoosenModel}
        choosenModel={choosenModel}
      />
      <UserInput sendMessage={sendMessage} />
    </div>
  );
}
