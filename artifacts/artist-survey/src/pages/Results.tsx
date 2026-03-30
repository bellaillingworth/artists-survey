import { useGetSurveyResults } from "@/hooks/use-survey";
import { Loader2, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from "recharts";

export default function Results() {
  const { data, isLoading, isError } = useGetSurveyResults();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-primary">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-medium text-foreground">Loading latest results...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2 text-foreground">Unable to load results</h2>
        <p className="text-muted-foreground mb-8">We encountered an error while fetching the survey data. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Define custom tooltip for better aesthetic
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-foreground text-background px-4 py-2 rounded-lg shadow-xl text-sm font-medium border border-border/10">
          <p className="opacity-80 text-xs uppercase tracking-wider mb-1">{label}</p>
          <p className="text-lg">{payload[0].value} response{payload[0].value !== 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  const hasData = data.total_responses > 0;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-3 text-foreground">Class Results</h1>
          <p className="text-muted-foreground text-lg">Aggregated insights from the Spring 2026 cohort.</p>
        </div>
        <Link href="/survey">
          <Button variant="outline">Take Survey</Button>
        </Link>
      </div>

      {!hasData ? (
        <div className="bg-white p-12 rounded-3xl border border-border text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif mb-2">No responses yet</h3>
          <p className="text-muted-foreground mb-6">Be the first to share your musical tastes!</p>
          <Link href="/survey">
            <Button>Take the Survey</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Stat */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary to-accent text-white p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Users className="w-48 h-48 -mt-10 -mr-10" />
            </div>
            <div className="relative z-10">
              <p className="text-primary-foreground/80 font-medium tracking-wide uppercase text-sm mb-2">Total Responses</p>
              <p className="text-6xl sm:text-8xl font-serif font-bold">{data.total_responses}</p>
            </div>
          </div>

          {/* Top Artists */}
          <div className="col-span-1 bg-white p-6 rounded-3xl border border-border shadow-sm">
            <h3 className="font-serif font-bold text-xl mb-6">Most Popular Artists</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_artists} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={40}>
                    {data.top_artists.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                    ))}
                    <LabelList dataKey="count" position="right" fill="hsl(var(--muted-foreground))" fontSize={12} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Year in College */}
          <div className="col-span-1 bg-white p-6 rounded-3xl border border-border shadow-sm">
            <h3 className="font-serif font-bold text-xl mb-6">Demographics: Year in College</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.year_counts} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    <LabelList dataKey="count" position="top" fill="hsl(var(--primary))" fontSize={14} fontWeight={700} dy={-5} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Genres */}
          <div className="col-span-1 bg-white p-6 rounded-3xl border border-border shadow-sm">
            <h3 className="font-serif font-bold text-xl mb-6">Favorite Genres</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.genre_counts} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} maxBarSize={30}>
                     <LabelList dataKey="count" position="right" fill="hsl(var(--muted-foreground))" fontSize={12} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Platforms */}
          <div className="col-span-1 bg-white p-6 rounded-3xl border border-border shadow-sm">
            <h3 className="font-serif font-bold text-xl mb-6">Listening Platforms</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.platform_counts} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} maxBarSize={30}>
                    <LabelList dataKey="count" position="right" fill="hsl(var(--muted-foreground))" fontSize={12} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
