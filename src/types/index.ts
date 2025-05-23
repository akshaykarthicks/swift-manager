
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member';
};

export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
};

export type Notification = {
  id: string;
  message: string;
  type: 'assignment' | 'reminder' | 'mention' | 'completion';
  taskId?: string;
  read: boolean;
  createdAt: Date;
};
