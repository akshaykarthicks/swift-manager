
import { useState, useEffect } from "react";
import { userStore, taskStore } from "@/lib/store";
import { User, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const TeamView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userTasks, setUserTasks] = useState<Record<string, Task[]>>({});
  
  useEffect(() => {
    // Fetch all users
    const allUsers = userStore.getUsers();
    setUsers(allUsers);
    
    // Fetch all tasks
    const allTasks = taskStore.getTasks();
    
    // Group tasks by assignee
    const tasksByUser: Record<string, Task[]> = {};
    allUsers.forEach(user => {
      tasksByUser[user.id] = allTasks.filter(task => task.assignedTo === user.id);
    });
    
    setUserTasks(tasksByUser);
  }, []);
  
  const getCompletionRate = (userId: string) => {
    const tasks = userTasks[userId] || [];
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };
  
  const getOverdueTasks = (userId: string) => {
    const tasks = userTasks[userId] || [];
    const now = new Date();
    
    return tasks.filter(
      task => task.dueDate && 
              new Date(task.dueDate) < now && 
              task.status !== "completed"
    ).length;
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team</h1>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => {
          const tasks = userTasks[user.id] || [];
          const completionRate = getCompletionRate(user.id);
          const overdueTasks = getOverdueTasks(user.id);
          
          return (
            <Card key={user.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{user.name}</CardTitle>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role === "admin" ? "Admin" : "Member"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Task completion</span>
                      <span className="font-medium">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-md bg-blue-50 p-2">
                      <p className="text-xl font-bold text-blue-700">{tasks.length}</p>
                      <p className="text-xs text-blue-600">Assigned</p>
                    </div>
                    <div className="rounded-md bg-amber-50 p-2">
                      <p className="text-xl font-bold text-amber-700">{overdueTasks}</p>
                      <p className="text-xs text-amber-600">Overdue</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TeamView;
