import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { useBoard } from '../../context/BoardContext';
import type { Task, Priority } from '../../types/kanban';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function KanbanBoard() {
  const { state, dispatch } = useBoard();
  
  // Local state for modals
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | undefined>(undefined);
  const [defaultColumnForNewTask, setDefaultColumnForNewTask] = React.useState<string | undefined>(undefined);

  // DnD state
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag intent to allow clicking items inside Draggable
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks based on search and priority
  const filteredTasks = React.useMemo(() => {
    return state.tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                            task.description?.toLowerCase().includes(state.searchQuery.toLowerCase());
      const matchesPriority = state.priorityFilter === 'All' || task.priority === state.priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [state.tasks, state.searchQuery, state.priorityFilter]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = state.tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      const activeTaskData = active.data.current?.task as Task;
      const overTaskData = over.data.current?.task as Task;

      if (activeTaskData.columnId !== overTaskData.columnId) {
        // Find index of overTask in its column to insert there
        const columnTasks = state.tasks.filter(t => t.columnId === overTaskData.columnId);
        const overIndex = columnTasks.findIndex(t => t.id === overId);
        
        dispatch({
          type: 'MOVE_TASK',
          payload: {
            taskId: activeId,
            toColumnId: overTaskData.columnId,
            newIndex: overIndex,
          },
        });
      }
    }

    // Dropping a Task over an empty Column
    if (isActiveTask && isOverColumn) {
      const activeTaskData = active.data.current?.task as Task;
      if (activeTaskData.columnId !== overId) {
        const columnTasksCount = state.tasks.filter(t => t.columnId === overId).length;
        dispatch({
          type: 'MOVE_TASK',
          payload: {
            taskId: activeId,
            toColumnId: overId,
            newIndex: columnTasksCount, // Add to end
          },
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';

    // If dropping over a task IN THE SAME COLUMN, reorder them
    if (isActiveTask && isOverTask) {
       const activeTaskData = active.data.current?.task as Task;
       const overTaskData = over.data.current?.task as Task;

       if (activeTaskData.columnId === overTaskData.columnId) {
          // Both in same column, we need to reorder
          // For a fully robust approach, arrayMove is preferred, but simple indexing works if done carefully globally.
          // Since our tasks array is flat, we must find flat indices.
          const activeIndex = state.tasks.findIndex(t => t.id === activeId);
          const overIndex = state.tasks.findIndex(t => t.id === overId);
          
          if (activeIndex !== overIndex) {
             // To properly preserve position across UI, we basically swap them in the main tasks array or re-insert
             // Let's create a new 'MOVE_TASK' specific for same-column reorder via absolute index for simplicity here.
             // Actually, doing this directly with `dispatch` and an arrayMove action is cleanest:
             // Instead, let's implement a quick workaround: since MOVE_TASK accepts newIndex relative to column, let's calculate the relative overIndex:
             const columnTasks = state.tasks.filter(t => t.columnId === activeTaskData.columnId);
             const relativeOverIndex = columnTasks.findIndex(t => t.id === overId);
             
             dispatch({
               type: 'MOVE_TASK',
               payload: {
                 taskId: activeId,
                 toColumnId: activeTaskData.columnId,
                 newIndex: relativeOverIndex,
               }
             });
          }
       }
    }
  };

  // Helpers to open modals
  const handleOpenCreateModal = (columnId?: string) => {
    setDefaultColumnForNewTask(columnId);
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeModal = () => {
    setIsTaskModalOpen(false);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Board Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Priority chips — scrollable row on very narrow screens */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => dispatch({ type: 'SET_PRIORITY_FILTER', payload: p as Priority | 'All' })}
              className={cn(
                'h-7 shrink-0 rounded-full px-3 text-xs font-semibold transition-all border',
                state.priorityFilter === p
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-foreground hover:bg-white/70 dark:hover:bg-white/10',
              )}
            >
              {p}
            </button>
          ))}
          {(state.searchQuery || state.priorityFilter !== 'All') && (
            <span className="shrink-0 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium border border-primary/20">
              Filtered
            </span>
          )}
        </div>

        <Button
          onClick={() => handleOpenCreateModal()}
          className="shrink-0 rounded-full px-4 h-7 text-xs font-semibold"
        >
          + Add Task
        </Button>
      </div>

      {/* Board Columns Area — horizontal scroll on mobile */}
      <div className="flex flex-1 overflow-x-auto overflow-y-hidden rounded-2xl border border-white/20 dark:border-white/8 bg-white/15 dark:bg-black/20 backdrop-blur-sm">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full w-full gap-4 p-4">
            <SortableContext items={state.columns.map((c) => c.id)}>
              {state.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={filteredTasks.filter((task) => task.columnId === column.id)}
                  onAddTask={handleOpenCreateModal}
                  onEditTask={handleOpenEditModal}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 scale-105 shadow-xl transition-transform">
                <TaskCard task={activeTask} onEdit={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Main Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <Modal
            isOpen={isTaskModalOpen}
            onClose={closeModal}
            title={editingTask ? 'Edit Task' : 'Create Task'}
            description={editingTask ? 'Update the details for this task.' : 'Add a new task to your board.'}
          >
            <TaskForm
              initialTask={editingTask}
              defaultColumnId={defaultColumnForNewTask}
              onSuccess={closeModal}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
