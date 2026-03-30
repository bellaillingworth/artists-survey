import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Survey from "@/pages/Survey";
import Results from "@/pages/Results";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-serif font-bold text-foreground mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">This track isn't on the album.</p>
      <a href="/" className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
        Back to Home
      </a>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/survey" component={Survey} />
        <Route path="/results" component={Results} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
