import PropTypes from "prop-types";

const handleOrder = (
  columnFilter,
  direction,
  filters,
  setFilters,
  usedFilters
) => {
  const currentValue = filters[columnFilter];
  const targetValue = direction === "asc" ? true : false;

  if (currentValue === targetValue) {
    setFilters({ ...filters, [columnFilter]: undefined });
  } else {
    setFilters({
      ...filters,
      ...Object.fromEntries(
        usedFilters
          .filter((filter) => filter !== columnFilter)
          .map((filter) => [filter, undefined])
      ),
      [columnFilter]: targetValue,
    });
  }
};

function HeaderCell({
  columnHeader,
  columnFilter,
  allFilters,
  setAllFilters,
  usedFilters,
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
              handleOrder(
                columnFilter,
                "asc",
                allFilters,
                setAllFilters,
                usedFilters
              )
            }
          >
            ⮝
          </div>
          <div
            className={`cursor-pointer ${state === false ? "text-white" : ""}`}
            onClick={() =>
              handleOrder(
                columnFilter,
                "desc",
                allFilters,
                setAllFilters,
                usedFilters
              )
            }
          >
            ⮟
          </div>
        </div>
      </div>
    </th>
  );
}

HeaderCell.propTypes = {
  /** Display text for the column header */
  columnHeader: PropTypes.string.isRequired,
  /** The filter key used for sorting */
  columnFilter: PropTypes.string.isRequired,
  /** Current filter state object
   * allFilters is the state object that contains the filter state for all columns
   * setAllFilters is the function that sets the filter state for all columns
   */
  allFilters: PropTypes.object.isRequired,
  /** Filter state setter function
   * setAllFilters is the function that sets the filter state for all columns
   * allFilters is the state object that contains the filter state for all columns
   */
  setAllFilters: PropTypes.func.isRequired,
  /** Array of all filter keys used for sorting
   * e.g. ["model_name_asc", "context_window_asc", "size_asc"]
   * When sorting by one column, all other columns would be reset to undefined
   */
  usedFilters: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** Current sort state
   * true for ascending, false for descending
   */
  state: PropTypes.bool,
};

export default HeaderCell;
