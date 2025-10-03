import ModelTableList from "../components/models/TableListWithFilters";

export default function Models() {
  return (
    <div className="page flex flex-col gap-4 w-full items-center">
      <h1 className="text-2xl font-bold mb-4 text-gray-300">
        Available Models
      </h1>
      <ModelTableList />
    </div>
  );
}
