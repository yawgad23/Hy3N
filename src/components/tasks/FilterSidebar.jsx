import { Filter, CheckSquare, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "all", label: "All Tasks", icon: Filter, color: "text-gray-600" },
  { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-600" },
  { value: "in_progress", label: "In Progress", icon: CheckSquare, color: "text-blue-600" },
  { value: "completed", label: "Completed", icon: CheckCircle, color: "text-green-600" }
];

export default function FilterSidebar({ isOpen, onClose, currentFilter, onFilterChange, taskCounts }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-lg">Filter Tasks</h2>
            <button
              onClick={onClose}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isActive = currentFilter === option.value;
              const count = taskCounts[option.value] || 0;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onFilterChange(option.value);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-5 h-5", option.color)} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  {count > 0 && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-semibold">{taskCounts.all || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-sm font-semibold text-yellow-600">{taskCounts.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-sm font-semibold text-blue-600">{taskCounts.in_progress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-semibold text-green-600">{taskCounts.completed || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}