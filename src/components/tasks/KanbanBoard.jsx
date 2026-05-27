import { DragDropContext } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { LayoutGrid, Plus, Search, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import KanbanColumn from "./KanbanColumn";
import TaskForm from "./TaskForm";
import FilterSidebar from "./FilterSidebar";
import UpcomingDeadlines from "./UpcomingDeadlines";
import TaskDashboard from "./TaskDashboard";
import { useState } from "react";

export default function KanbanBoard() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban', 'list', or 'dashboard'
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
    initialData: [],
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, taskData }) => base44.entities.Task.update(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task updated successfully");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted successfully");
    },
  });

  const handleDragEnd = (result) => {
    const { destination, draggableId } = result;

    // If dropped outside valid area
    if (!destination) return;

    // If dropped in same position
    if (
      destination.droppableId === draggableId &&
      destination.index === 0
    ) return;

    // Update task status based on new column
    const newStatus = destination.droppableId;
    
    updateTaskMutation.mutate({
      id: draggableId,
      taskData: { status: newStatus }
    });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleSubmit = (taskData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, taskData });
    } else {
      base44.entities.Task.create(taskData).then(() => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        toast.success("Task created successfully");
      });
    }
    setShowForm(false);
    setEditingTask(null);
  };

  // Filter tasks by search query (title, description, or assignee)
  const filteredTasks = searchQuery
    ? tasks?.filter(task => {
        const query = searchQuery.toLowerCase();
        return (
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.assignee?.toLowerCase().includes(query)
        );
      }) || []
    : tasks || [];

  // Group tasks by status
  const tasksByStatus = {
    pending: filteredTasks?.filter(t => t.status === "pending") || [],
    in_progress: filteredTasks?.filter(t => t.status === "in_progress") || [],
    completed: filteredTasks?.filter(t => t.status === "completed") || []
  };

  const taskCounts = {
    all: tasks?.length || 0,
    pending: tasksByStatus.pending.length,
    in_progress: tasksByStatus.in_progress.length,
    completed: tasksByStatus.completed.length
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentFilter="all"
          onFilterChange={() => {}}
          taskCounts={taskCounts}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-secondary rounded-lg"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-heading font-bold text-3xl">Task Board</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? `${filteredTasks?.length || 0} results` : `${taskCounts.all} tasks • ${taskCounts.completed} completed`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "kanban" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Board</span>
                </Button>
                <Button
                  variant={viewMode === "dashboard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("dashboard")}
                  className="gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
                <Button
                  onClick={() => {
                    setEditingTask(null);
                    setShowForm(!showForm);
                  }}
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Task</span>
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or assignee..."
                className="pl-10 pr-10 bg-secondary border-border focus:border-primary/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Task Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <TaskForm
                task={editingTask}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTask(null);
                }}
              />
            </motion.div>
          )}

          {/* Upcoming Deadlines */}
          <UpcomingDeadlines tasks={tasks} />

          {/* Kanban Board */}
          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[500px]">
              <KanbanColumn
                status="pending"
                tasks={tasksByStatus.pending}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddTask={() => {
                  setEditingTask(null);
                  setShowForm(true);
                }}
              />
              <KanbanColumn
                status="in_progress"
                tasks={tasksByStatus.in_progress}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <KanbanColumn
                status="completed"
                tasks={tasksByStatus.completed}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ) : viewMode === "dashboard" ? (
            <TaskDashboard />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">List view coming soon</p>
            </div>
          )}
        </main>
      </div>
    </DragDropContext>
  );
}