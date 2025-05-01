
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { useAuth } from "@/components/auth/AuthContext";
import { taskStore } from "@/lib/store";
import { TaskList } from "@/components/tasks/TaskList";

const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    // Fetch tasks assigned to the current user
    const myTasks = taskStore.getMyTasks(user.id);
    setTasks(myTasks);
  }, [user]);
  
  const handleTaskAdded = (task: Task) => {
    if (!user) return;
    
    // Refresh tasks
    const myTasks = taskStore.getMyTasks(user.id);
    setTasks(myTasks);
  };
  
  return (
    <div>
      <TaskList 
        tasks={tasks} 
        title="My Tasks" 
        emptyMessage="You don't have any tasks assigned yet" 
        onTaskAdded={handleTaskAdded} 
      />
    </div>
  );
};

export default MyTasks;
