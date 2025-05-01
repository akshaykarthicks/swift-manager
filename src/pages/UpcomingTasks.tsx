
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { useAuth } from "@/components/auth/AuthContext";
import { taskStore } from "@/lib/store";
import { TaskList } from "@/components/tasks/TaskList";
import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const UpcomingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [thisWeekTasks, setThisWeekTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    // Get all tasks assigned to the user
    const myTasks = taskStore.getMyTasks(user.id);
    setTasks(myTasks);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 6);
    
    // Filter overdue tasks
    const overdue = myTasks.filter(
      task => task.dueDate && 
              new Date(task.dueDate) < today && 
              task.status !== "completed"
    );
    setOverdueTasks(overdue);
    
    // Filter today's tasks
    const todaysList = myTasks.filter(
      task => task.dueDate && 
              isSameDay(new Date(task.dueDate), today)
    );
    setTodayTasks(todaysList);
    
    // Filter this week's tasks (excluding today and overdue)
    const thisWeekList = myTasks.filter(
      task => task.dueDate && 
              new Date(task.dueDate) > today && 
              new Date(task.dueDate) <= endOfCurrentWeek
    );
    setThisWeekTasks(thisWeekList);
    
  }, [user]);
  
  const handleTaskAdded = (task: Task) => {
    if (!user) return;
    
    // Refresh all task lists
    const myTasks = taskStore.getMyTasks(user.id);
    setTasks(myTasks);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const endOfCurrentWeek = addDays(startOfCurrentWeek, 6);
    
    // Filter overdue tasks
    const overdue = myTasks.filter(
      task => task.dueDate && 
              new Date(task.dueDate) < today && 
              task.status !== "completed"
    );
    setOverdueTasks(overdue);
    
    // Filter today's tasks
    const todaysList = myTasks.filter(
      task => task.dueDate && 
              isSameDay(new Date(task.dueDate), today)
    );
    setTodayTasks(todaysList);
    
    // Filter this week's tasks (excluding today)
    const thisWeekList = myTasks.filter(
      task => task.dueDate && 
              new Date(task.dueDate) > today && 
              new Date(task.dueDate) <= endOfCurrentWeek
    );
    setThisWeekTasks(thisWeekList);
  };
  
  return (
    <div className="space-y-8">
      {overdueTasks.length > 0 && (
        <div>
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600">
                These tasks have passed their due date and require your immediate attention.
              </p>
            </CardContent>
          </Card>
          <TaskList 
            tasks={overdueTasks} 
            title="Overdue" 
            emptyMessage="No overdue tasks found" 
            showFilters={false}
            onTaskAdded={handleTaskAdded} 
          />
        </div>
      )}
      
      <div>
        <TaskList 
          tasks={todayTasks} 
          title="Today" 
          emptyMessage="No tasks due today" 
          showFilters={false}
          onTaskAdded={handleTaskAdded} 
        />
      </div>
      
      <div>
        <TaskList 
          tasks={thisWeekTasks} 
          title="This Week" 
          emptyMessage="No tasks due this week" 
          showFilters={false}
          onTaskAdded={handleTaskAdded} 
        />
      </div>
    </div>
  );
};

export default UpcomingTasks;
