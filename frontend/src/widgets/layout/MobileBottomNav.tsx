import { NavLink, useNavigate } from 'react-router-dom';
import { Inbox, LayoutDashboard, Plus, Store } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/marketplace', label: 'Experts', icon: Store },
  { to: '/ideas/new', label: 'New', icon: Plus, accent: true },
  { to: '/requests', label: 'Requests', icon: Inbox },
];

export function MobileBottomNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-safe backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          if (item.accent) {
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => navigate(item.to)}
                className="flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium text-primary"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-brand text-white shadow-lg">
                  <Icon className="h-5 w-5" />
                </span>
                {item.label}
              </button>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium transition',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
