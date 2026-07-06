import { RiRefreshLine } from "react-icons/ri";

const RegistryLayout = ({
  title,
  italicTitle,
  subtitle,
  onRefresh,
  isLoading,
  filters,
  subFilters,
  isEmpty,
  emptyState,
  children,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-8 border-b border-text-main pb-6">
        <div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight text-text-main leading-none">
            {title}{" "}
            {italicTitle && (
              <span className="italic text-brand">{italicTitle}</span>
            )}
          </h1>
          {subtitle && (
            <p className="text-text-muted font-medium text-sm mt-3 max-w-lg">
              {subtitle}
            </p>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-main border border-text-main/10 hover:border-text-main px-4 py-2.5 rounded-full transition-all"
          >
            <RiRefreshLine
              size={14}
              className={isLoading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Filters */}
      {filters && <div className="mb-4">{filters}</div>}
      {subFilters && <div className="mb-6">{subFilters}</div>}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="room-card p-6 animate-pulse space-y-3"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="h-3 bg-text-main/5 rounded-full w-1/4" />
              <div className="h-7 bg-text-main/5 rounded-lg w-full" />
              <div className="h-4 bg-text-main/5 rounded-full w-2/3" />
              <div className="h-px bg-text-main/5 mt-4" />
              <div className="flex justify-between">
                <div className="h-3 bg-text-main/5 rounded-full w-1/3" />
                <div className="w-7 h-7 rounded-full bg-text-main/5" />
              </div>
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          {emptyState}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {children}
        </div>
      )}
    </div>
  );
};

export default RegistryLayout;
