import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, Column, Priority, BoardState } from '../types/kanban';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; toColumnId: string; newIndex: number } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_PRIORITY_FILTER'; payload: Priority | 'All' }
  | { type: 'REORDER_COLUMNS'; payload: Column[] }
  | { type: 'TOGGLE_THEME' }
  | { type: 'hydrate'; payload: BoardState };

const initialState: BoardState = {
  tasks: [],
  columns: [
    { id: 'todo', title: 'Todo' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ],
  searchQuery: '',
  priorityFilter: 'All',
  theme: 'light',
};

const BoardContext = createContext<{
  state: BoardState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function boardReducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'hydrate':
      return { ...action.payload, searchQuery: '', priorityFilter: 'All' }; // Don't persist temporary filters
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case 'MOVE_TASK': {
      const { taskId, toColumnId, newIndex } = action.payload;
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return state;

      const taskToMove = { ...state.tasks[taskIndex], columnId: toColumnId };
      const newTasks = [...state.tasks];
      newTasks.splice(taskIndex, 1); // remove from old index

      // Insert at new index, considering the column it belongs to
      // Since `newIndex` is relative to the *column*, we need to find the absolute index in `newTasks`
      const columnTasks = newTasks.filter(t => t.columnId === toColumnId);
      
      if (newIndex >= columnTasks.length) {
         // Appending to the end of the column tasks -> can just push or correctly position it globally
         newTasks.push(taskToMove);
      } else {
         // Finding absolute insertion point
         const targetTask = columnTasks[newIndex];
         const absoluteIndex = newTasks.indexOf(targetTask);
         newTasks.splice(absoluteIndex, 0, taskToMove);
      }

      return { ...state, tasks: newTasks };
    }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_PRIORITY_FILTER':
      return { ...state, priorityFilter: action.payload };
    case 'REORDER_COLUMNS':
      return { ...state, columns: action.payload };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    default:
      return state;
  }
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [persistedData, setPersistedData] = useLocalStorage<BoardState>('kanban-state', initialState);
  const [state, dispatch] = useReducer(boardReducer, persistedData);

  // Sync state changes to local storage
  useEffect(() => {
    setPersistedData(state);
    
    // update theme data attribute
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state, setPersistedData]);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
