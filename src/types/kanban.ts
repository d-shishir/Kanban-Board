export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO string 
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
}

export interface BoardState {
  tasks: Task[];
  columns: Column[];
  searchQuery: string;
  priorityFilter: Priority | 'All';
  theme: 'light' | 'dark';
}
