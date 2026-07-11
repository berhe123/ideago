import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Store,
  Sun,
  User as UserIcon,
  Inbox,
  Shield,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { initials } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { MobileSheet } from '@/shared/ui/mobile-sheet';
import { useAuthStore } from '@/entities/user/store';
import { useThemeStore } from '@/features/theme/store';
import { useMarkAllRead, useNotifications } from '@/features/notification/api';
import { Logo } from './Logo';
import { MobileBottomNav } from './MobileBottomNav';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/marketplace', label: 'Marketplace', icon: Store },
  { to: '/requests', label: 'Requests', icon: Inbox },
];

export function AppShell({ admin = false }: { admin?: boolean }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const { data: notifications } = useNotifications();
  const markAll = useMarkAllRead();
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const unread = notifications?.unread ?? 0;

  const closeOverlays = () => {
    setBellOpen(false);
    setMenuOpen(false);
    setNavOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border glass pt-safe">
        <div className="container flex h-14 items-center gap-2 sm:h-16 sm:gap-4">
          <Logo to="/dashboard" />

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-full px-3 py-2 text-sm transition',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            ))}
            {user?.role === 'ADMIN' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-full px-3 py-2 text-sm transition',
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <Shield className="h-4 w-4" />
                Admin
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <Button onClick={() => navigate('/ideas/new')} size="sm" className="hidden md:inline-flex">
              <Plus className="h-4 w-4" /> New idea
            </Button>

            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="hidden sm:inline-flex">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                onClick={() => {
                  setBellOpen((v) => !v);
                  setMenuOpen(false);
                  if (!bellOpen && unread) markAll.mutate();
                }}
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {unread}
                  </span>
                )}
              </Button>
              {bellOpen && (
                <>
                  <button type="button" className="fixed inset-0 z-40 md:hidden" aria-label="Close notifications" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-border bg-card p-2 shadow-2xl sm:w-80">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Notifications
                    </p>
                    <div className="max-h-[min(60vh,20rem)] overflow-y-auto">
                      {notifications?.items.length ? (
                        notifications.items.map((n) => (
                          <Link
                            key={n.id}
                            to={n.link ?? '#'}
                            onClick={() => setBellOpen(false)}
                            className="block rounded-xl px-3 py-2 hover:bg-muted"
                          >
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground">{n.body}</p>
                          </Link>
                        ))
                      ) : (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">You’re all caught up.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setBellOpen(false);
                }}
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-muted text-sm font-semibold"
              >
                {user ? initials(`${user.firstName} ${user.lastName}`) : <UserIcon className="h-4 w-4" />}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-border bg-card p-2 shadow-2xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <MenuLink to="/profile" onClick={closeOverlays}>
                    Profile
                  </MenuLink>
                  <MenuLink to="/expert/setup" onClick={closeOverlays}>
                    Become an expert
                  </MenuLink>
                  <button
                    onClick={() => logout().then(() => navigate('/'))}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="Open menu"
              onClick={() => {
                setNavOpen(true);
                setBellOpen(false);
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {admin && (
          <div className="border-t border-border bg-card/40">
            <div className="container flex h-11 items-center gap-1 overflow-x-auto scrollbar-hide">
              {[
                { to: '/admin', label: 'Overview' },
                { to: '/admin/ideas', label: 'Ideas' },
                { to: '/admin/users', label: 'Users' },
              ].map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'shrink-0 rounded-full px-3 py-1.5 text-sm transition',
                      isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <MobileSheet open={navOpen} onClose={() => setNavOpen(false)} title="Account">
        <div className="mb-4 rounded-xl bg-muted/50 p-4">
          <p className="font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setNavOpen(false)}
              className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 hover:bg-muted"
            >
              <n.icon className="h-5 w-5 text-primary" />
              {n.label}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setNavOpen(false)}
              className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 hover:bg-muted"
            >
              <Shield className="h-5 w-5 text-primary" />
              Admin
            </Link>
          )}
          <hr className="my-2 border-border" />
          <Link to="/profile" onClick={() => setNavOpen(false)} className="flex min-h-[48px] items-center rounded-xl px-4 hover:bg-muted">
            Profile
          </Link>
          <Link to="/expert/setup" onClick={() => setNavOpen(false)} className="flex min-h-[48px] items-center rounded-xl px-4 hover:bg-muted">
            Become an expert
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-left hover:bg-muted"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            type="button"
            onClick={() => logout().then(() => navigate('/'))}
            className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-left text-destructive hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </nav>
      </MobileSheet>

      <main className={cn('container flex-1 py-5 md:py-8', admin ? 'pb-6' : 'pb-24 md:pb-8')}>
        <Outlet />
      </main>

      {!admin && <MobileBottomNav />}
    </div>
  );
}

function MenuLink({ to, children, onClick }: { to: string; children: ReactNode; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">
      {children}
    </Link>
  );
}
