import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const SortableHeader = ({
  children,
  column,
  sorting,
  onSort,
  className = "",
}) => {
  const getSortIcon = () => {
    if (sorting === "asc") {
      return <ChevronUp className="w-4 h-4 text-blue-600" />;
    } else if (sorting === "desc") {
      return <ChevronDown className="w-4 h-4 text-blue-600" />;
    }
    return <ChevronUp className="w-4 h-4 text-gray-400 opacity-50" />;
  };

  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {getSortIcon()}
      </div>
    </th>
  );
};

export default SortableHeader;
