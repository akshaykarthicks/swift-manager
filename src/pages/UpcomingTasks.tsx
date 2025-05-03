
import { useState, useEffect } from "react";
import { Task, User } from "@/types";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Fetch tasks from Supabase instead of local store
        const { data: taskData, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', user.id);
          
        if (error) {
          console.error("Error fetching tasks:", error);
          setLoading(false);
          return;
        }
        
        // Transform task data
        const myTasks: Task[] = taskData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assigned_to,
          createdBy: task.created_by,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
          tags: task.tags || [],
        }));
        
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
      } catch (err) {
        console.error("Error processing task data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [user]);
  
  const handleTaskAdded = (task: Task) => {
    if (!user) return;
    
    // Refresh all tasks when a new task is added
    const fetchTasks = async () => {
      try {
        // Fetch tasks from Supabase
        const { data: taskData, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', user.id);
          
        if (error) {
          console.error("Error fetching tasks:", error);
          return;
        }
        
        // Transform task data
        const myTasks: Task[] = taskData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assigned_to,
          createdBy: task.created_by,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
          tags: task.tags || [],
        }));
        
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
      } catch (err) {
        console.error("Error processing task data:", err);
      }
    };
    
    fetchTasks();
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
            isLoading={loading}
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
          isLoading={loading}
        />
      </div>
      
      <div>
        <TaskList 
          tasks={thisWeekTasks} 
          title="This Week" 
          emptyMessage="No tasks due this week" 
          showFilters={false}
          onTaskAdded={handleTaskAdded} 
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default UpcomingTasks;
