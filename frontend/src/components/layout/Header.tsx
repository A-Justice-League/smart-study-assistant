import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <BookOpen className="w-6 h-6 text-primary" />
          <span>Smart Study</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Home
          </Link>
          <Link
            to="/study"
            className="text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Study
          </Link>
        </nav>
      </div>
    </header>
  );
}
