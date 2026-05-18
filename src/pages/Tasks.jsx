import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Menu, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import FilterSidebar from "@/components/tasks/FilterSidebar";
import TaskForm from "@/components/tasks/TaskForm";
import TaskCard from "@/components/tasks/TaskCard";

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
    initialData: [],
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.Task.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setEditingTask(null);
      toast.success("Task created successfully");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, taskData }) => base44.entities.Task.update(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setEditingTask(null);
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

  const handleStatusChange = async (taskId, newStatus) => {
    updateTaskMutation.mutate({
      id: taskId,
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
      createTaskMutation.mutate(taskData);
    }
  };

  // Calculate task counts for filter sidebar
  const taskCounts = {
    all: tasks?.length || 0,
    pending: tasks?.filter(t => t.status === "pending").length || 0,
    in_progress: tasks?.filter(t => t.status === "in_progress").length || 0,
    completed: tasks?.filter(t => t.status === "completed").length || 0
  };

  // Filter tasks based on selected status
  const filteredTasks = filter === "all" 
    ? tasks 
    : tasks?.filter(task => task.status === filter);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentFilter={filter}
        onFilterChange={setFilter}
        taskCounts={taskCounts}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading font-bold text-3xl">Tasks</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {taskCounts.all} tasks • {taskCounts.completed} completed
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingTask(null);
              setShowForm(!showForm);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Task Form */}
        <AnimatePresence>
          {showForm && (
            <TaskForm
              task={editingTask}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredTasks?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!isLoading && filteredTasks?.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-bold text-lg mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {filter === "all" 
                ? "Create your first task to get started" 
                : `No ${filter} tasks. Try a different filter.`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}