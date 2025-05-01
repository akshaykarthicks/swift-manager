
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { taskStore } from "@/lib/store";
import { TaskList } from "@/components/tasks/TaskList";

const AllTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    // Fetch all tasks
    const allTasks = taskStore.getTasks();
    setTasks(allTasks);
  }, []);
  
  const handleTaskAdded = (task: Task) => {
    // Refresh tasks
    const allTasks = taskStore.getTasks();
    setTasks(allTasks);
  };
  
  return (
    <div>
      <TaskList 
        tasks={tasks} 
        title="All Tasks" 
        emptyMessage="No tasks found" 
        onTaskAdded={handleTaskAdded} 
      />
    </div>
  );
};

export default AllTasks;
