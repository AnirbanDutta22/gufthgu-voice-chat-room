import { RiRefreshLine } from "react-icons/ri";

const RegistryLayout = ({
  title,
  italicTitle,
  subtitle,
  onRefresh,
  isLoading,
  filters, // Tab selectors/filters element
  subFilters, // Topic pills/sub-navigation element
  isEmpty,
  emptyState,
  children,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Universal Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 pb-6 border-b border-text-main/10">
        <div>
          <h1 className="font-display text-5xl tracking-tight text-text-main">
            {title}{" "}
            {italicTitle && (
              <span className="italic text-brand">{italicTitle}</span>
            )}
          </h1>
          {subtitle && (
            <p className="text-text-muted text-base mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn-secondary flex items-center justify-center gap-2 text-sm px-5! py-2.5! self-start sm:self-auto"
          >
            <RiRefreshLine
              size={15}
              className={isLoading ? "animate-spin" : ""}
            />
            Refresh Registry
          </button>
        )}
      </div>

      {/* Dynamic Filter Sections */}
      {filters && <div className="mb-6">{filters}</div>}
      {subFilters && <div className="mb-10">{subFilters}</div>}

      {/* Main Grid Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-card border border-text-main/10 rounded-[20px] p-6 space-y-4"
            >
              <div className="h-4 rounded bg-text-main/5 w-1/3 animate-pulse" />
              <div className="h-6 rounded bg-text-main/5 animate-pulse" />
              <div className="h-4 rounded bg-text-main/5 w-2/3 animate-pulse" />
              <div className="h-10 rounded-lg bg-text-main/5 pt-2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-text-main/20 rounded-3xl bg-surface-card/50">
          {emptyState}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default RegistryLayout;
