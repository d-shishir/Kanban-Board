import * as React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Column, Task } from '../../types/kanban';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { Plus, ListTodo, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
}

const COLUMN_META: Record<string, { icon: React.ReactNode; accent: string }> = {
  todo: {
    icon: <ListTodo className="h-3.5 w-3.5" />,
    accent: 'text-slate-500 dark:text-slate-300',
  },
  inProgress: {
    icon: <Loader2 className="h-3.5 w-3.5" />,
    accent: 'text-primary',
  },
  done: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    accent: 'text-emerald-500',
  },
};

export function KanbanColumn({ column, tasks, onAddTask, onEditTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const taskIds = React.useMemo(() => tasks.map((t) => t.id), [tasks]);
  const meta = COLUMN_META[column.id] ?? { icon: null, accent: 'text-muted-foreground' };

  return (
    <div
      className={cn(
        'flex h-full flex-1 min-w-[270px] flex-col rounded-2xl p-3.5 transition-all duration-200',
        'bg-white/40 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/8 shadow-sm',
        isOver && 'ring-2 ring-primary/50 ring-inset bg-white/55 dark:bg-black/45',
      )}
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('shrink-0', meta.accent)}>{meta.icon}</span>
          <h3 className="font-semibold tracking-tight text-foreground text-sm">{column.title}</h3>
          <span className={cn(
            'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
            'bg-white/60 dark:bg-white/10 text-muted-foreground border border-white/40 dark:border-white/10'
          )}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          aria-label={`Add task to ${column.title}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 rounded-xl transition-colors min-h-[80px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-900/20 dark:border-white/10 py-7 text-center"
          >
            <span className="text-xs text-muted-foreground/60">Drop tasks here or</span>
            <button
              onClick={() => onAddTask(column.id)}
              className="text-xs text-primary hover:underline font-semibold"
            >
              + Add a task
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
