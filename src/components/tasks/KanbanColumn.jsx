import { Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KanbanTaskCard from "./KanbanTaskCard";
import { cn } from "@/lib/utils";

const columnConfig = {
  pending: {
    title: "Pending",
    color: "border-yellow-500/50",
    bg: "bg-yellow-500/5",
    headerBg: "bg-yellow-500/10",
    textColor: "text-yellow-700"
  },
  in_progress: {
    title: "In Progress",
    color: "border-blue-500/50",
    bg: "bg-blue-500/5",
    headerBg: "bg-blue-500/10",
    textColor: "text-blue-700"
  },
  completed: {
    title: "Completed",
    color: "border-green-500/50",
    bg: "bg-green-500/5",
    headerBg: "bg-green-500/10",
    textColor: "text-green-700"
  }
};

export default function KanbanColumn({ status, tasks, onEdit, onDelete, onAddTask }) {
  const config = columnConfig[status];
  const count = tasks?.length || 0;

  return (
    <div className={cn("flex flex-col h-full rounded-xl border-2", config.color, config.bg)}>
      {/* Column Header */}
      <div className={cn("flex items-center justify-between p-4 border-b", config.headerBg)}>
        <div className="flex items-center gap-2">
          <h2 className={cn("font-heading font-bold text-sm", config.textColor)}>
            {config.title}
          </h2>
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", config.headerBg, config.textColor)}>
            {count}
          </span>
        </div>
        {status === "pending" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddTask}
            className="h-7 w-7 hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-3 overflow-y-auto min-h-[200px] transition-colors",
              snapshot.isDraggingOver && "bg-primary/5"
            )}
          >
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-xs">No tasks</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        ...provided.draggableProps.style,
                      }}
                      className={cn(
                        "mb-3 last:mb-0",
                        snapshot.isDragging && "shadow-xl rotate-2"
                      )}
                    >
                      <KanbanTaskCard
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </motion.div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}