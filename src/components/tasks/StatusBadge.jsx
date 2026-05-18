import { cn } from "@/lib/utils";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  completed: "bg-green-100 text-green-800 border-green-300"
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed"
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusColors[status] || statusColors.pending
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}