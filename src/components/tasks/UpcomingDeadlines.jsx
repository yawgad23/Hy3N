import { motion } from "framer-motion";
import { Clock, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

function getTimeUntilDeadline(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  
  if (diffHours <= 0) return { text: "Overdue", urgent: true };
  if (diffHours < 24) return { text: `${diffHours}h left`, urgent: true };
  
  const diffDays = Math.ceil(diffHours / 24);
  if (diffDays === 1) return { text: "Tomorrow", urgent: true };
  return { text: `${diffDays} days`, urgent: false };
}

export default function UpcomingDeadlines({ tasks }) {
  const now = new Date();
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  // Filter tasks due within 48 hours and not completed
  const upcomingTasks = tasks?.filter(task => {
    if (!task.due_date || task.status === "completed") return false;
    const dueDate = new Date(task.due_date);
    return dueDate <= fortyEightHoursFromNow && dueDate >= now;
  }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  // Get overdue tasks
  const overdueTasks = tasks?.filter(task => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < now;
  }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  if (!upcomingTasks?.length && !overdueTasks?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="w-5 h-5" />
          <p className="text-sm font-medium">No upcoming deadlines in the next 48 hours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg">Upcoming Deadlines</h2>
          <p className="text-xs text-muted-foreground">Tasks due within 48 hours</p>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Overdue</span>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((task) => {
              const timeInfo = getTimeUntilDeadline(task.due_date);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/30 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">{task.title}</p>
                    <p className="text-xs text-destructive/70 mt-0.5">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-lg">
                    {timeInfo.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks?.length > 0 && (
        <div>
          {overdueTasks?.length > 0 && (
            <div className="flex items-center gap-2 mb-3 pt-4 border-t border-border">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Due Soon</span>
            </div>
          )}
          <div className="space-y-2">
            {upcomingTasks.map((task) => {
              const timeInfo = getTimeUntilDeadline(task.due_date);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-secondary border border-border rounded-xl"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-xs font-bold rounded-lg",
                    timeInfo.urgent 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {timeInfo.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}