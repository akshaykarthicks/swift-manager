
import { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, List } from "lucide-react";

interface DashboardSummaryProps {
  tasks: Task[];
}

export const DashboardSummary = ({ tasks }: DashboardSummaryProps) => {
  const getTotalTasks = () => tasks.length;
  
  const getCompletedTasks = () => tasks.filter((task) => task.status === "completed").length;
  
  const getInProgressTasks = () => tasks.filter((task) => task.status === "in-progress").length;
  
  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== "completed"
    ).length;
  };
  
  const completionRate = tasks.length > 0 
    ? Math.round((getCompletedTasks() / tasks.length) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <List className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalTasks()}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getInProgressTasks()}</div>
          <p className="text-xs text-muted-foreground">
            {tasks.length > 0 ? Math.round((getInProgressTasks() / tasks.length) * 100) : 0}% of all tasks
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getCompletedTasks()}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getOverdueTasks()}</div>
          <div className="mt-1">
            {getOverdueTasks() > 0 ? (
              <Badge variant="destructive">Requires attention</Badge>
            ) : (
              <Badge variant="outline" className="border-green-400 bg-green-50 text-green-700">
                All on track
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
