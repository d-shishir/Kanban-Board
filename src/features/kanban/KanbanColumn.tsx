import * as React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Column, Task } from '../../types/kanban';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { Plus, ListTodo, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
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

  // On mobile, columns can collapse to save vertical space
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div
      className={cn(
        // Mobile: full-width, auto-height. Desktop: flex-1 with a min-width
        'flex w-full md:w-auto md:flex-1 md:min-w-[260px] flex-col rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 transition-all duration-200',
        'bg-white/40 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/8 shadow-sm',
        isOver && 'ring-2 ring-primary/50 ring-inset bg-white/55 dark:bg-black/45',
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="md:pointer-events-none flex items-center gap-1.5 sm:gap-2 group"
        >
          <span className={cn('shrink-0', meta.accent)}>{meta.icon}</span>
          <h3 className="font-semibold tracking-tight text-foreground text-xs sm:text-sm">{column.title}</h3>
          <span className={cn(
            'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
            'bg-white/60 dark:bg-white/10 text-muted-foreground border border-white/40 dark:border-white/10'
          )}>
            {tasks.length}
          </span>
          {/* Collapse chevron — mobile only */}
          <ChevronDown className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform md:hidden',
            collapsed && '-rotate-90'
          )} />
        </button>
        <button
          onClick={() => onAddTask(column.id)}
          className="h-7 w-7 sm:h-6 sm:w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          aria-label={`Add task to ${column.title}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drop zone — collapsible on mobile */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden md:!h-auto md:!opacity-100"
          >
            <div
              ref={setNodeRef}
              className="flex flex-col gap-2 rounded-xl transition-colors min-h-[56px] md:min-h-[80px]"
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
                  className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-900/20 dark:border-white/10 py-5 sm:py-7 text-center"
                >
                  <span className="text-[11px] text-muted-foreground/60">Drop tasks here or</span>
                  <button
                    onClick={() => onAddTask(column.id)}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    + Add a task
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
