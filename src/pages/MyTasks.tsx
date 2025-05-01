
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { useAuth } from "@/components/auth/AuthContext";
import { TaskList } from "@/components/tasks/TaskList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchMyTasks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id);
        
      if (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Convert Supabase data to our Task type
      const mappedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to || undefined,
        createdBy: task.created_by,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        tags: task.tags || [],
      }));
      
      setTasks(mappedTasks);
    } catch (err) {
      console.error("Unexpected error fetching tasks:", err);
      toast({
        title: "Error fetching tasks",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user]);
  
  const handleTaskAdded = () => {
    fetchMyTasks();
  };
  
  return (
    <div>
      <TaskList 
        tasks={tasks} 
        title="My Tasks" 
        emptyMessage="You don't have any tasks assigned yet" 
        onTaskAdded={handleTaskAdded}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MyTasks;
