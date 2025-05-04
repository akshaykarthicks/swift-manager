import { useState, useEffect } from "react";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const TeamView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userTasks, setUserTasks] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get all users from profiles table with detailed logging
        console.log("Fetching all user profiles...");
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profileError) {
          console.error("Error fetching profiles:", profileError);
          toast({
            title: "Error loading team data",
            description: profileError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        console.log("Profiles data received:", profileData);
        
        if (!profileData || profileData.length === 0) {
          console.log("No profiles found in database");
          setLoading(false);
          return;
        }
        
        // Transform profile data to User type
        const formattedUsers: User[] = profileData.map(profile => ({
          id: profile.id,
          name: profile.name || 'Anonymous',
          email: '', // Email isn't stored in profiles table
          avatar: profile.avatar_url || undefined,
          role: profile.role as 'admin' | 'manager' | 'member'
        }));
        
        console.log("Formatted users:", formattedUsers);
        setUsers(formattedUsers);
        
        // Fetch tasks for each user
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*');
          
        if (taskError) {
          console.error("Error fetching tasks:", taskError);
          toast({
            title: "Error loading task data",
            description: taskError.message,
            variant: "destructive",
          });
        } else {
          console.log("Tasks data received:", taskData);
          
          // Group tasks by user
          const tasksByUser: Record<string, any[]> = {};
          
          formattedUsers.forEach(user => {
            tasksByUser[user.id] = [];
          });
          
          if (taskData) {
            taskData.forEach((task: any) => {
              if (task.assigned_to && tasksByUser[task.assigned_to]) {
                tasksByUser[task.assigned_to].push({
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
                });
              }
            });
          }
          
          console.log("Tasks by user:", tasksByUser);
          setUserTasks(tasksByUser);
        }
      } catch (err) {
        console.error("Error in data fetching:", err);
        toast({
          title: "Error",
          description: "Failed to load team data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
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
  
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Team</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team</h1>
      
      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-xl font-medium text-gray-600">No team members found</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create accounts using the signup page to add team members.
          </p>
        </div>
      ) : (
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
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
      )}
    </div>
  );
};

export default TeamView;
