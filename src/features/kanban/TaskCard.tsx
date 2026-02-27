import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Calendar, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '../../types/kanban';
import { cn } from '../../utils/cn';
import { useBoard } from '../../context/BoardContext';
import { useToast } from '../../components/ui/Toast';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const PRIORITY_STYLES = {
  High: {
    border: 'border-l-red-400',
    badge: 'bg-red-50/80 dark:bg-red-500/15 text-red-600 dark:text-red-300 border-red-200/60 dark:border-red-400/25',
    dot: 'bg-red-400',
  },
  Medium: {
    border: 'border-l-amber-400',
    badge: 'bg-amber-50/80 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-400/25',
    dot: 'bg-amber-400',
  },
  Low: {
    border: 'border-l-emerald-400',
    badge: 'bg-emerald-50/80 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-400/25',
    dot: 'bg-emerald-400',
  },
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { dispatch } = useBoard();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  });

  const style = { transition, transform: CSS.Transform.toString(transform) };
  const priority = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'DELETE_TASK', payload: task.id });
    toast({ title: 'Task deleted', type: 'info' });
    setIsMenuOpen(false);
  };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex cursor-grab flex-col gap-2.5 rounded-xl p-3 text-foreground',
        'bg-white/70 dark:bg-black/35 backdrop-blur-md',
        'border border-white/50 dark:border-white/10 border-l-[3px] shadow-sm',
        'hover:shadow-md hover:bg-white/85 dark:hover:bg-black/45 transition-all duration-200',
        'active:cursor-grabbing',
        priority.border,
        isDragging && 'opacity-40 scale-[1.02] shadow-xl ring-2 ring-primary/30',
      )}
      {...attributes}
      {...listeners}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
          priority.badge
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', priority.dot)} />
          {task.priority}
        </span>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsMenuOpen(!isMenuOpen);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/8 dark:hover:bg-white/10"
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-7 z-30 w-36 rounded-xl border border-white/30 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-1 shadow-xl"
              >
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  onClick={(e) => { e.stopPropagation(); onEdit(task); setIsMenuOpen(false); }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Edit task
                </button>
                <div className="my-0.5 h-px bg-border/40" />
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  onClick={handleDelete}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete task
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title + description */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer */}
      {task.dueDate && (
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-black/5 dark:border-white/5">
          <Calendar className="h-3 w-3 text-muted-foreground/70 shrink-0" />
          <span className="text-[10px] font-medium text-muted-foreground">
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </span>
        </div>
      )}
    </motion.div>
  );
}
