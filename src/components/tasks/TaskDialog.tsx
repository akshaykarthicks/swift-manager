import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Priority, Task, TaskStatus } from "@/types";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onTaskSaved: (task: Task) => void;
}

export const TaskDialog = ({ isOpen, onClose, task, onTaskSaved }: TaskDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string; avatar?: string }>>([]);
  
  const isEditing = !!task;
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      setIsLoadingUsers(true);
      try {
        // Fetch all available users from the profiles table with improved error handling
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, avatar_url');
          
        if (error) {
          console.error("Error fetching users:", error);
          toast({
            title: "Error fetching users",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        if (data && data.length > 0) {
          console.log("Fetched users:", data);
          const formattedUsers = data.map(user => ({
            id: user.id,
            name: user.name || 'Anonymous',
            avatar: user.avatar_url || undefined
          }));
          setUsers(formattedUsers);
        } else {
          console.log("No users found or empty data array");
          setUsers([]);
          toast({
            title: "No users found",
            description: "You may need to create more user accounts",
            variant: "default",
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching users:", err);
        toast({
          title: "Failed to load users",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [isOpen, toast]);
  
  // Set initial values when editing a task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignedTo);
      setDueDate(task.dueDate);
    } else {
      // Default values for new task
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setAssigneeId(undefined);
      setDueDate(undefined);
    }
  }, [task]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare task data for Supabase (snake_case)
      const taskData = {
        title,
        description: description || null,
        status: status as TaskStatus,
        priority: priority as Priority,
        assigned_to: assigneeId || null,
        due_date: dueDate ? dueDate.toISOString() : null,
        created_by: user.id,
        tags: [] as string[]
      };
      
      let savedTask: Task | undefined;
      
      if (isEditing && task) {
        // Update existing task
        const { data, error } = await supabase
          .from('tasks')
          .update({
            ...taskData,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        // Convert to our Task type
        savedTask = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assigned_to || undefined,
          createdBy: data.created_by,
          dueDate: data.due_date ? new Date(data.due_date) : undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          tags: data.tags || [],
        };
        
        toast({
          title: "Task updated",
          description: "Task has been updated successfully.",
        });
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();
          
        if (error) {
          console.error("Error creating task:", error);
          throw error;
        }
        
        // Convert to our Task type
        savedTask = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assigned_to || undefined,
          createdBy: data.created_by,
          dueDate: data.due_date ? new Date(data.due_date) : undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          tags: data.tags || [],
        };
        
        toast({
          title: "Task created",
          description: "New task has been created successfully.",
        });
      }
      
      if (savedTask) {
        onTaskSaved(savedTask);
      }
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value: TaskStatus) => setStatus(value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select 
                  value={assigneeId || "unassigned"} 
                  onValueChange={(value) => setAssigneeId(value === "unassigned" ? undefined : value)}
                >
                  <SelectTrigger id="assignee" className="truncate">
                    <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select assignee"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{user.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        No users available. Create accounts first.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {users.length === 0 && !isLoadingUsers && (
                  <p className="text-xs text-amber-600 mt-1">
                    No users found. Create more accounts using the signup page.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dueDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar 
                      mode="single" 
                      selected={dueDate} 
                      onSelect={(date) => setDueDate(date)}
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
