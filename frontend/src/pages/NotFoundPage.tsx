import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';

export default function NotFoundPage() {
  return (
    <div className="container grid min-h-[70vh] place-items-center text-center">
      <div>
        <p className="font-display text-7xl font-bold gradient-text">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">The page you’re looking for doesn’t exist.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Back home</Button>
        </Link>
      </div>
    </div>
  );
}
