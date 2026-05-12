import { ChevronLeft, ChevronRight } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const DataTable = ({
  columns,
  data: rawData,
  loading = false,
  pagination = null,
  onPageChange,
  emptyMessage = "No data available",
}) => {
  const data = Array.isArray(rawData) ? rawData : [];
  if (loading) {
    return (
      <div className="card">
        <div className="p-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={column.className || ""}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-secondary-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={column.cellClassName || ""}>
                      {column.render
                        ? column.render(row)
                        : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
