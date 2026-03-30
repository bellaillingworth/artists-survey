import { Link } from "wouter";
import { Button } from "@/components/ui/Button";
import { Sparkles, BarChart, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto space-y-12">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span>BAIS:3300 Spring 2026 Project</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-serif text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
          What is the soundtrack <br className="hidden sm:block"/> of our class?
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          Share your musical tastes and discover what the rest of the undergraduate business students are listening to this semester.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500 fill-mode-both">
        <Link href="/survey" className="w-full sm:w-auto">
          <Button size="lg" className="w-full group">
            Take the Survey
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/results" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full group">
            <BarChart className="mr-2 w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            View Results
          </Button>
        </Link>
      </div>

      <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full animate-in fade-in duration-1000 delay-700 fill-mode-both">
        <div className="p-6 rounded-2xl bg-white border border-border/50 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary mb-4">
            <span className="font-serif font-bold text-xl">1</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">4 Quick Questions</h3>
          <p className="text-sm text-muted-foreground">It takes less than 60 seconds to share your favorite artist and genres.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-border/50 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary mb-4">
            <span className="font-serif font-bold text-xl">2</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Live Results</h3>
          <p className="text-sm text-muted-foreground">Watch the charts update in real-time as classmates submit their answers.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-border/50 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary mb-4">
            <span className="font-serif font-bold text-xl">3</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Discover New Music</h3>
          <p className="text-sm text-muted-foreground">Find out what everyone else is listening to and expand your playlist.</p>
        </div>
      </div>
    </div>
  );
}
