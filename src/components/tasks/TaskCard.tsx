
import { format } from "date-fns";
import { Task, User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { userStore } from "@/lib/store";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const assignee = task.assignedTo ? userStore.getUserById(task.assignedTo) : undefined;
  const isCompleted = task.status === "completed";
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
  
  const getPriorityColor = () => {
    if (isCompleted) return "bg-task-completed";
    
    switch (task.priority) {
      case "high":
        return "bg-task-high";
      case "medium":
        return "bg-task-medium";
      case "low":
        return "bg-task-low";
      default:
        return "bg-gray-400";
    }
  };
  
  const getStatusBadge = () => {
    switch (task.status) {
      case "todo":
        return <Badge variant="outline">To Do</Badge>;
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "review":
        return <Badge variant="outline" className="border-blue-400 bg-blue-50 text-blue-700">In Review</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-green-400 bg-green-50 text-green-700">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "relative cursor-pointer overflow-hidden transition-shadow hover:shadow-md",
        isCompleted && "opacity-70"
      )}
      onClick={onClick}
    >
      <div className={cn("absolute left-0 top-0 h-full w-1", getPriorityColor())} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className={cn("text-lg font-medium", isCompleted && "line-through text-gray-500")}>{task.title}</h3>
          {getStatusBadge()}
        </div>
        
        {task.description && (
          <p className={cn("mt-2 text-sm text-gray-600", isCompleted && "text-gray-400")}>
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description}
          </p>
        )}
        
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {task.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          {assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">{assignee.name}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Unassigned</span>
          )}
          
          {task.dueDate && (
            <div className={cn("flex items-center gap-1", isOverdue && "text-red-500")}>
              {isOverdue ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-xs">
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
