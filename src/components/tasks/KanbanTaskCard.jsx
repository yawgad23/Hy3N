import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";

const priorityColors = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-red-50 text-red-700 border-red-200"
};

function getDueDateStyle(dueDate) {
  if (!dueDate) return { color: "text-muted-foreground", bg: "bg-muted" };
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 0) return { color: "text-destructive", bg: "bg-destructive/10" };
  if (diffHours < 24) return { color: "text-destructive", bg: "bg-destructive/10" };
  if (diffHours < 48) return { color: "text-primary", bg: "bg-primary/10" };
  return { color: "text-muted-foreground", bg: "bg-muted" };
}

export default function KanbanTaskCard({ task, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={task.status} size="sm" />
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="h-6 w-6 text-muted-foreground hover:text-primary"
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <h3 className="font-heading font-semibold text-sm mb-2 line-clamp-2">{task.title}</h3>
      
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        {task.due_date && (
          <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded", getDueDateStyle(task.due_date).bg)}>
            <Clock className={cn("w-3 h-3", getDueDateStyle(task.due_date).color)} />
            <span className={cn("font-medium", getDueDateStyle(task.due_date).color)}>
              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
        {task.assignee && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{task.assignee}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}