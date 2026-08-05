import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  disabled = false,
  renderOption,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = options.filter((o) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return o.label.toLowerCase().includes(q);
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (option) => {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="input w-full flex items-center justify-between text-left cursor-pointer"
      >
        <span className={selected ? "text-secondary-900" : "text-secondary-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selected && (
            <span
              onClick={handleClear}
              className="p-0.5 hover:bg-secondary-200 rounded"
            >
              <X className="w-3.5 h-3.5 text-secondary-400" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-secondary-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-secondary-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-secondary-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <ul className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-secondary-400 text-center">
                No results found
              </li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                    String(option.value) === String(value)
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "hover:bg-secondary-50 text-secondary-700"
                  }`}
                >
                  {renderOption ? renderOption(option) : option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
