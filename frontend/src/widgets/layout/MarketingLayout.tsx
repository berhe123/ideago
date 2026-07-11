import { useState, type ReactNode } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { MobileSheet } from '@/shared/ui/mobile-sheet';
import { useAuthStore } from '@/entities/user/store';
import { Logo } from './Logo';

export function MarketingLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border glass pt-safe">
        <div className="container flex h-14 items-center gap-3 sm:h-16">
          <Logo />

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            <Link
              to="/marketplace"
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Marketplace
            </Link>
            <a
              href="/#how"
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="/#features"
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Features
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate('/dashboard')} className="hidden sm:inline-flex">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
                  Sign in
                </Button>
                <Button size="sm" onClick={() => navigate('/register')} className="hidden sm:inline-flex">
                  Start free
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileSheet open={menuOpen} onClose={close} title="Menu">
        <nav className="flex flex-col gap-1">
          <MobileNavLink to="/marketplace" onClick={close}>
            Marketplace
          </MobileNavLink>
          <MobileNavLink href="/#how" onClick={close}>
            How it works
          </MobileNavLink>
          <MobileNavLink href="/#features" onClick={close}>
            Features
          </MobileNavLink>
          <hr className="my-3 border-border" />
          {isAuthenticated ? (
            <Button className="w-full" onClick={() => { close(); navigate('/dashboard'); }}>
              Go to dashboard
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => { close(); navigate('/login'); }}>
                Sign in
              </Button>
              <Button className="w-full" onClick={() => { close(); navigate('/register'); }}>
                Start free
              </Button>
            </div>
          )}
        </nav>
      </MobileSheet>

      <main className="flex-1 pb-safe">
        <Outlet />
      </main>

      <footer className="border-t border-border pb-safe">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-center md:flex-row md:py-10 md:text-left">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ideago — turn ideas into companies.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/marketplace" className="hover:text-foreground">
              Marketplace
            </Link>
            <Link to="/register" className="hover:text-foreground">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileNavLink({
  children,
  onClick,
  to,
  href,
}: {
  children: ReactNode;
  onClick: () => void;
  to?: string;
  href?: string;
}) {
  const className =
    'flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium hover:bg-muted';

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
