
import { User, Task, Notification, Priority } from '@/types';
import { format } from 'date-fns';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=7C3AED&color=fff',
    role: 'member',
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=EF4444&color=fff',
    role: 'member',
  },
];

// Utility function for date calculations
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new user dashboard',
    description: 'Create wireframes and high-fidelity designs for the new user dashboard.',
    status: 'in-progress',
    priority: 'high',
    assignedTo: '1',
    createdBy: '2',
    dueDate: tomorrow,
    createdAt: yesterday,
    updatedAt: today,
    tags: ['design', 'frontend'],
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Set up JWT authentication for user login and registration.',
    status: 'todo',
    priority: 'high',
    assignedTo: '1',
    createdBy: '2',
    dueDate: nextWeek,
    createdAt: yesterday,
    updatedAt: yesterday,
    tags: ['backend', 'security'],
  },
  {
    id: '3',
    title: 'Fix pagination bug',
    description: 'The pagination component is not working correctly on mobile devices.',
    status: 'review',
    priority: 'medium',
    assignedTo: '2',
    createdBy: '1',
    dueDate: yesterday,
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: yesterday,
    tags: ['bug', 'frontend'],
  },
  {
    id: '4',
    title: 'Update documentation',
    description: 'Update the API documentation with new endpoints.',
    status: 'todo',
    priority: 'low',
    assignedTo: '3',
    createdBy: '1',
    dueDate: nextWeek,
    createdAt: yesterday,
    updatedAt: yesterday,
    tags: ['documentation'],
  },
  {
    id: '5',
    title: 'Optimize database queries',
    description: 'Improve database performance by optimizing slow queries.',
    status: 'completed',
    priority: 'medium',
    assignedTo: '2',
    createdBy: '3',
    dueDate: yesterday,
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: yesterday,
    tags: ['backend', 'database'],
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    message: 'Jane assigned you a new task: Design new user dashboard',
    type: 'assignment',
    taskId: '1',
    read: false,
    createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000),
  },
  {
    id: '2',
    message: 'Task "Fix pagination bug" is due tomorrow',
    type: 'reminder',
    taskId: '3',
    read: false,
    createdAt: new Date(today.getTime() - 3 * 60 * 60 * 1000),
  },
  {
    id: '3',
    message: 'Alex completed the task: Optimize database queries',
    type: 'completion',
    taskId: '5',
    read: true,
    createdAt: new Date(today.getTime() - 12 * 60 * 60 * 1000),
  },
];

// Current logged-in user (for mocking purposes)
export const currentUser = mockUsers[0];

// Local storage keys
const LS_KEYS = {
  TASKS: 'tasks',
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
  CURRENT_USER: 'currentUser',
};

// Initialize local storage with mock data
export const initializeStore = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(LS_KEYS.TASKS)) {
    localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(mockTasks));
  }
  
  if (!localStorage.getItem(LS_KEYS.USERS)) {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(mockUsers));
  }
  
  if (!localStorage.getItem(LS_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(LS_KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications));
  }
  
  if (!localStorage.getItem(LS_KEYS.CURRENT_USER)) {
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }
};

// Store API for tasks
export const taskStore = {
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return mockTasks;
    const tasks = localStorage.getItem(LS_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  },
  
  getTaskById: (id: string): Task | undefined => {
    const tasks = taskStore.getTasks();
    return tasks.find(task => task.id === id);
  },
  
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const tasks = taskStore.getTasks();
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedTasks = [...tasks, newTask];
    localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(updatedTasks));
    
    // Create a notification if task is assigned
    if (newTask.assignedTo) {
      const currentUser = userStore.getCurrentUser();
      notificationStore.createNotification({
        message: `${currentUser.name} assigned you a new task: ${newTask.title}`,
        type: 'assignment',
        taskId: newTask.id,
        read: false
      });
    }
    
    return newTask;
  },
  
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Task | undefined => {
    const tasks = taskStore.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return undefined;
    
    const oldTask = tasks[taskIndex];
    const updatedTask: Task = {
      ...oldTask,
      ...updates,
      updatedAt: new Date()
    };
    
    tasks[taskIndex] = updatedTask;
    localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(tasks));
    
    // Create notification for assignment change
    if (updates.assignedTo && updates.assignedTo !== oldTask.assignedTo) {
      const currentUser = userStore.getCurrentUser();
      notificationStore.createNotification({
        message: `${currentUser.name} assigned you a task: ${updatedTask.title}`,
        type: 'assignment',
        taskId: updatedTask.id,
        read: false
      });
    }
    
    // Create notification for completion
    if (updates.status === 'completed' && oldTask.status !== 'completed') {
      const currentUser = userStore.getCurrentUser();
      notificationStore.createNotification({
        message: `${currentUser.name} completed the task: ${updatedTask.title}`,
        type: 'completion',
        taskId: updatedTask.id,
        read: false
      });
    }
    
    return updatedTask;
  },
  
  deleteTask: (id: string): boolean => {
    const tasks = taskStore.getTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    
    if (updatedTasks.length === tasks.length) return false;
    
    localStorage.setItem(LS_KEYS.TASKS, JSON.stringify(updatedTasks));
    return true;
  },
  
  getMyTasks: (userId: string): Task[] => {
    const tasks = taskStore.getTasks();
    return tasks.filter(task => task.assignedTo === userId);
  },
  
  getCreatedTasks: (userId: string): Task[] => {
    const tasks = taskStore.getTasks();
    return tasks.filter(task => task.createdBy === userId);
  },
  
  getOverdueTasks: (userId: string): Task[] => {
    const tasks = taskStore.getTasks();
    const now = new Date();
    
    return tasks.filter(task => 
      task.assignedTo === userId && 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'completed'
    );
  }
};

// Store API for users
export const userStore = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return mockUsers;
    const users = localStorage.getItem(LS_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },
  
  getUserById: (id: string): User | undefined => {
    const users = userStore.getUsers();
    return users.find(user => user.id === id);
  },
  
  getCurrentUser: (): User => {
    if (typeof window === 'undefined') return currentUser;
    const user = localStorage.getItem(LS_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : currentUser;
  },
  
  setCurrentUser: (user: User): void => {
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(user));
  },
  
  login: (email: string, password: string): User | null => {
    // In a real app, this would validate credentials
    const users = userStore.getUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      userStore.setCurrentUser(user);
      return user;
    }
    
    return null;
  },
  
  logout: (): void => {
    localStorage.removeItem(LS_KEYS.CURRENT_USER);
  }
};

// Store API for notifications
export const notificationStore = {
  getNotifications: (): Notification[] => {
    if (typeof window === 'undefined') return mockNotifications;
    const notifications = localStorage.getItem(LS_KEYS.NOTIFICATIONS);
    return notifications ? JSON.parse(notifications) : [];
  },
  
  getUnreadCount: (): number => {
    const notifications = notificationStore.getNotifications();
    return notifications.filter(n => !n.read).length;
  },
  
  markAsRead: (id: string): void => {
    const notifications = notificationStore.getNotifications();
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    
    localStorage.setItem(LS_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
  },
  
  markAllAsRead: (): void => {
    const notifications = notificationStore.getNotifications();
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    
    localStorage.setItem(LS_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
  },
  
  createNotification: (notif: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const notifications = notificationStore.getNotifications();
    const newNotification: Notification = {
      ...notif,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date()
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    localStorage.setItem(LS_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
    
    return newNotification;
  }
};

// Initialize the store
export const initStore = () => {
  initializeStore();
};
