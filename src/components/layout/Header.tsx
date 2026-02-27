import { Moon, Sun, LayoutDashboard, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoard } from '../../context/BoardContext';
import * as React from 'react';

export function Header() {
  const { state, dispatch } = useBoard();
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">

        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-md">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="hidden text-lg font-bold tracking-tight sm:block">
            Kan<span className="text-primary">Flow</span>
          </span>
        </div>

        {/* Desktop search — centered */}
        <div className="hidden sm:flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search tasks..."
              className="h-9 w-full rounded-full border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search toggle */}
          <button
            className="sm:hidden h-8 w-8 flex items-center justify-center rounded-full border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle search"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            className="relative h-8 w-8 overflow-hidden flex items-center justify-center rounded-full border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm shadow-sm hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={state.theme}
                initial={{ y: -14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 14, opacity: 0 }}
                transition={{ duration: 0.16, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {state.theme === 'light'
                  ? <Moon className="h-3.5 w-3.5 text-foreground/80" />
                  : <Sun className="h-3.5 w-3.5 text-amber-400" />
                }
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

      </div>

      {/* Mobile search bar (expandable) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden sm:hidden border-t border-white/20 dark:border-white/5"
          >
            <div className="px-4 py-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  type="search"
                  placeholder="Search tasks..."
                  className="h-9 w-full rounded-full border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
