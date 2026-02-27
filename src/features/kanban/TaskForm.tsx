import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Priority } from '../../types/kanban';
import { useBoard } from '../../context/BoardContext';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../utils/cn';

interface TaskFormProps {
  initialTask?: Task;
  defaultColumnId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PRIORITY_OPTIONS = [
  {
    value: 'Low' as Priority,
    emoji: '🌿',
    color: 'border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20',
    active: 'bg-emerald-50/90 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500/60 text-emerald-700 dark:text-emerald-200',
  },
  {
    value: 'Medium' as Priority,
    emoji: '⚡',
    color: 'border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50/80 dark:hover:bg-amber-900/20',
    active: 'bg-amber-50/90 dark:bg-amber-900/30 border-amber-400 dark:border-amber-500/60 text-amber-700 dark:text-amber-200',
  },
  {
    value: 'High' as Priority,
    emoji: '🔥',
    color: 'border-red-300 dark:border-red-700/60 text-red-700 dark:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-900/20',
    active: 'bg-red-50/90 dark:bg-red-900/30 border-red-400 dark:border-red-500/60 text-red-700 dark:text-red-200',
  },
];

const inputClass = cn(
  'w-full rounded-xl border border-black/10 dark:border-white/10',
  'bg-white/70 dark:bg-white/5 backdrop-blur-sm',
  'px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60',
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all'
);

const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5';

export function TaskForm({ initialTask, defaultColumnId, onSuccess, onCancel }: TaskFormProps) {
  const { state, dispatch } = useBoard();
  const { toast } = useToast();

  const [title, setTitle] = React.useState(initialTask?.title || '');
  const [description, setDescription] = React.useState(initialTask?.description || '');
  const [priority, setPriority] = React.useState<Priority>(initialTask?.priority || 'Medium');
  const [dueDate, setDueDate] = React.useState(
    initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
  );
  const [columnId, setColumnId] = React.useState(
    initialTask?.columnId || defaultColumnId || state.columns[0]?.id || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Title is required', type: 'error' });
      return;
    }
    const taskData: Task = {
      id: initialTask?.id || uuidv4(),
      title: title.trim(),
      description: description.trim(),
      priority,
      columnId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
    };
    if (initialTask) {
      dispatch({ type: 'UPDATE_TASK', payload: taskData });
      toast({ title: 'Task updated', type: 'success' });
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData });
      toast({ title: 'Task created', type: 'success' });
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="task-title" className={labelClass}>
          Title <span className="text-red-400 normal-case font-normal tracking-normal">*</span>
        </label>
        <input
          id="task-title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Update landing page copy"
          required
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="task-desc" className={labelClass}>Description</label>
        <textarea
          id="task-desc"
          className={cn(inputClass, 'min-h-[72px] resize-y')}
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Priority */}
      <div>
        <label className={labelClass}>Priority</label>
        <div className="flex gap-2">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition-all',
                priority === opt.value ? opt.active : `bg-transparent ${opt.color}`
              )}
            >
              <span>{opt.emoji}</span>
              <span>{opt.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Due date + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-date" className={labelClass}>Due Date</label>
          <input
            id="task-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="task-status" className={labelClass}>Status</label>
          <select
            id="task-status"
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className={cn(inputClass, 'cursor-pointer appearance-none')}
          >
            {state.columns.map((col) => (
              <option key={col.id} value={col.id}>{col.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-3 border-t border-black/6 dark:border-white/6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 h-9 text-sm font-medium text-foreground hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-primary text-white px-5 h-9 text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
        >
          {initialTask ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
