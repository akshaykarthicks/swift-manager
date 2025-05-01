
import { useEffect, useState } from "react";
import { Task } from "@/types";
import { useAuth } from "@/components/auth/AuthContext";
import { taskStore } from "@/lib/store";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { TasksByStatusChart } from "@/components/dashboard/TasksByStatusChart";
import { TaskList } from "@/components/tasks/TaskList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    // Fetch tasks from the store
    const allTasks = taskStore.getTasks();
    setTasks(allTasks);
    
    // Get tasks assigned to current user
    const myTasksList = taskStore.getMyTasks(user.id);
    setMyTasks(myTasksList);
    
    // Get overdue tasks
    const overdueTasksList = taskStore.getOverdueTasks(user.id);
    setOverdueTasks(overdueTasksList);
  }, [user]);
  
  const handleTaskAdded = (task: Task) => {
    // Refresh the task lists
    const allTasks = taskStore.getTasks();
    setTasks(allTasks);
    
    if (user) {
      const myTasksList = taskStore.getMyTasks(user.id);
      setMyTasks(myTasksList);
      
      const overdueTasksList = taskStore.getOverdueTasks(user.id);
      setOverdueTasks(overdueTasksList);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <DashboardSummary tasks={myTasks} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TasksByStatusChart tasks={myTasks} />
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Shortcuts to help you manage your tasks efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="rounded-md bg-yellow-50 p-3">
              <div className="font-medium text-yellow-800">
                {overdueTasks.length} Overdue Tasks
              </div>
              <div className="mt-1 text-sm text-yellow-700">
                {overdueTasks.length > 0
                  ? "You have tasks that require immediate attention."
                  : "Great job! You have no overdue tasks."}
              </div>
            </div>
            
            <div className="rounded-md bg-blue-50 p-3">
              <div className="font-medium text-blue-800">
                {myTasks.filter(t => t.status === "todo").length} Tasks To Do
              </div>
              <div className="mt-1 text-sm text-blue-700">
                {myTasks.filter(t => t.status === "todo").length > 0
                  ? "These tasks are waiting for you to start working on them."
                  : "You've started all your assigned tasks!"}
              </div>
            </div>
            
            <div className="rounded-md bg-purple-50 p-3">
              <div className="font-medium text-purple-800">
                {myTasks.filter(t => t.status === "in-progress").length} Tasks In Progress
              </div>
              <div className="mt-1 text-sm text-purple-700">
                These are the tasks you're currently working on.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <TaskList 
        tasks={myTasks.slice(0, 6)} 
        title="My Tasks" 
        showFilters={false}
        emptyMessage="You don't have any tasks assigned yet" 
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
};

export default Dashboard;
