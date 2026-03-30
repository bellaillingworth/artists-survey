import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart3, ClipboardEdit, Sparkles } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1 -ml-1"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-serif font-semibold text-lg tracking-tight">Artist Survey</span>
          </Link>
          
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link 
              href="/survey" 
              className={cn(
                "px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2",
                location === "/survey" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <ClipboardEdit className="w-4 h-4" />
              <span className="hidden sm:inline">Take Survey</span>
            </Link>
            <Link 
              href="/results" 
              className={cn(
                "px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2",
                location === "/results" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">View Results</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="w-full border-t border-border/50 bg-white py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            Survey by Bella, BAIS:3300 - spring 2026.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
