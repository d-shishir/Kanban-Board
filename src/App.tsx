
import { BoardProvider } from './context/BoardContext';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/layout/Layout';
import KanbanBoard from './features/kanban/KanbanBoard';

export default function App() {
  return (
    <ToastProvider>
      <BoardProvider>
        <Layout>
          {/* Main Board View */}
          <KanbanBoard />
        </Layout>
      </BoardProvider>
    </ToastProvider>
  );
}
