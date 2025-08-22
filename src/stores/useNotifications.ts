import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  ts: number;
}

interface NotificationsState {
  items: NotificationItem[];
  initialized: boolean;
}

interface NotificationsActions {
  markAllRead: () => void;
  markRead: (id: string) => void;
  push: (item: Omit<NotificationItem, 'id' | 'ts'>) => void;
  clear: () => void;
  getUnreadCount: () => number;
}

type NotificationsStore = NotificationsState & NotificationsActions;

// Initial notifications to seed the store
const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Welcome to Finance AI!',
    body: 'Your personal finance assistant is ready to help you track expenses and achieve your financial goals.',
    read: false,
    ts: Date.now() - 1000 * 60 * 30, // 30 minutes ago
  },
  {
    id: '2',
    title: 'Budget Alert',
    body: 'You\'re approaching your monthly budget limit for Food category. Consider reviewing your spending.',
    read: false,
    ts: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: '3',
    title: 'Savings Milestone',
    body: 'Congratulations! You\'ve saved ₹25,000 this month, exceeding your 20% savings goal.',
    read: false,
    ts: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

export const useNotifications = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      initialized: false,

      // Actions
      markAllRead: () => {
        set((state) => ({
          items: state.items.map(item => ({ ...item, read: true }))
        }));
      },

      markRead: (id: string) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? { ...item, read: true } : item
          )
        }));
      },

      push: (item: Omit<NotificationItem, 'id' | 'ts'>) => {
        const newItem: NotificationItem = {
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          ts: Date.now(),
        };
        
        set((state) => ({
          items: [newItem, ...state.items].slice(0, 50) // Keep only last 50 notifications
        }));
      },

      clear: () => {
        set({ items: [] });
      },

      getUnreadCount: () => {
        return get().items.filter(item => !item.read).length;
      },
    }),
    {
      name: 'finance-ai-notifications',
      onRehydrateStorage: () => (state) => {
        // Seed with initial notifications on first run
        if (state && !state.initialized && state.items.length === 0) {
          state.items = initialNotifications;
          state.initialized = true;
        }
      },
    }
  )
);
