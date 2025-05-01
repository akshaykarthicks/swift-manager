
import { useState } from "react";
import { TaskCard } from "./TaskCard";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { TaskDialog } from "./TaskDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListProps {
  tasks: Task[];
  title?: string;
  emptyMessage?: string;
  showFilters?: boolean;
  isLoading?: boolean;
  onTaskAdded?: (task: Task) => void;
}

export const TaskList = ({
  tasks,
  title = "Tasks",
  emptyMessage = "No tasks found",
  showFilters = true,
  isLoading = false,
  onTaskAdded,
}: TaskListProps) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };
  
  const handleNewTask = () => {
    setSelectedTask(null);
    setIsTaskDialogOpen(true);
  };

  // Loading skeletons
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-lg border bg-white p-4 shadow-sm">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <div className="flex justify-between">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleNewTask} className="gap-1">
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter} disabled={isLoading}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {isLoading ? (
        renderSkeletons()
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed bg-white p-6 text-center">
          <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
          <Button variant="outline" className="mt-4" onClick={handleNewTask}>
            Create a task
          </Button>
        </div>
      )}
      
      <TaskDialog 
        isOpen={isTaskDialogOpen} 
        onClose={() => setIsTaskDialogOpen(false)} 
        task={selectedTask}
        onTaskSaved={(task) => {
          setIsTaskDialogOpen(false);
          if (onTaskAdded) onTaskAdded(task);
        }}
      />
    </div>
  );
};
