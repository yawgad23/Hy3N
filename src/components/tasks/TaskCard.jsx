import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-red-100 text-red-800"
};

function getDueDateStyle(dueDate) {
  if (!dueDate) return { color: "text-muted-foreground", bg: "bg-muted" };
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 0) return { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" };
  if (diffHours < 24) return { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" };
  if (diffHours < 48) return { color: "text-primary", bg: "bg-primary/10 border-primary/30" };
  return { color: "text-muted-foreground", bg: "bg-muted" };
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={task.status} />
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          
          <h3 className="font-heading font-bold text-lg mb-1">{task.title}</h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs">
            {task.due_date && (
              <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg border", getDueDateStyle(task.due_date).bg)}>
                <Clock className={cn("w-3.5 h-3.5", getDueDateStyle(task.due_date).color)} />
                <span className={cn("font-medium", getDueDateStyle(task.due_date).color)}>
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{task.assignee}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="text-muted-foreground hover:text-primary"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status change buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        {task.status !== "pending" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(task.id, "pending")}
            className="flex-1 text-xs"
          >
            Set Pending
          </Button>
        )}
        {task.status !== "in_progress" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(task.id, "in_progress")}
            className="flex-1 text-xs"
          >
            In Progress
          </Button>
        )}
        {task.status !== "completed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(task.id, "completed")}
            className="flex-1 text-xs bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
          >
            Complete
          </Button>
        )}
      </div>
    </motion.div>
  );
}