import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Category } from "@/hooks/useCategories";

interface SearchFilterProps {
  categories: Category[];
  onSearch: (query: string) => void;
  onFilterCategory: (category: string | null) => void;
  onFilterPrice: (price: string | null) => void;
  selectedCategory: string | null;
  selectedPrice: string | null;
}

const priceOptions = [
  { value: null, label: "All Prices" },
  { value: "Free", label: "Free" },
  { value: "paid", label: "Paid" }
];

const SearchFilter = ({
  categories,
  onSearch,
  onFilterCategory,
  onFilterPrice,
  selectedCategory,
  selectedPrice
}: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    onSearch("");
    onFilterCategory(null);
    onFilterPrice(null);
  };

  const hasFilters = searchQuery || selectedCategory || selectedPrice;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={handleSearch}
            className="input-glass pl-12 w-full"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-glass flex items-center gap-2 ${showFilters ? 'border-primary/50' : ''}`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card p-4 animate-fade-in-down">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
              <select
                value={selectedCategory || ""}
                onChange={(e) => onFilterCategory(e.target.value || null)}
                className="input-glass bg-card w-full"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Price</label>
              <select
                value={selectedPrice || ""}
                onChange={(e) => onFilterPrice(e.target.value || null)}
                className="input-glass bg-card w-full"
              >
                {priceOptions.map((option) => (
                  <option key={option.label} value={option.value || ""}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <span className="badge-gradient flex items-center gap-1">
              {selectedCategory}
              <button onClick={() => onFilterCategory(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedPrice && (
            <span className="badge-gradient flex items-center gap-1">
              {selectedPrice === "paid" ? "Paid" : selectedPrice}
              <button onClick={() => onFilterPrice(null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="badge-gradient flex items-center gap-1">
              "{searchQuery}"
              <button onClick={() => { setSearchQuery(""); onSearch(""); }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
