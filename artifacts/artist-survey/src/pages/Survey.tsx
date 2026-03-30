import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/Button";
import { useSubmitSurvey } from "@/hooks/use-survey";
import { Check, ChevronDown, Music, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const GENRES = [
  "Classical", "Country", "Electronic / EDM", "Hip-Hop / Rap", 
  "Indie / Alternative", "Jazz / Blues", "K-Pop", "Latin", 
  "Pop", "R&B / Soul", "Rock / Metal", "Other"
] as const;

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year or More"] as const;

const PLATFORMS = ["Spotify", "Apple Music", "YouTube", "SoundCloud", "Radio", "Other"] as const;

const surveySchema = z.object({
  favorite_artist: z.string().min(1, "Please enter your favorite artist"),
  genre: z.string().min(1, "Please select a genre"),
  college_year: z.enum(YEARS, { 
    errorMap: () => ({ message: "Please select your year in college" })
  }),
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  other_platform: z.string().optional()
}).refine(data => {
  if (data.platforms.includes("Other")) {
    return !!data.other_platform && data.other_platform.trim().length > 0;
  }
  return true;
}, {
  message: "Please specify the other platform",
  path: ["other_platform"]
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function Survey() {
  const { mutate, isPending, isError, error } = useSubmitSurvey();
  const [submittedData, setSubmittedData] = useState<SurveyFormValues | null>(null);
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      favorite_artist: "",
      genre: "",
      platforms: [],
      other_platform: ""
    }
  });

  const platforms = watch("platforms");
  const hasOtherPlatform = platforms?.includes("Other");
  const otherInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasOtherPlatform && otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [hasOtherPlatform]);

  const onSubmit = (data: SurveyFormValues) => {
    // Cast enum manually since Orval generates specific const string maps, but the values match exactly
    mutate({ data: data as any }, {
      onSuccess: () => {
        setSubmittedData(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto pt-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl shadow-subtle border border-border text-center space-y-8"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Thank you for sharing!</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Your musical tastes have been added to the class dataset. Here is a quick summary of what you submitted:
          </p>
          
          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 max-w-sm mx-auto border border-slate-100">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Artist</span>
              <p className="font-medium text-foreground">{submittedData.favorite_artist}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Genre</span>
              <p className="font-medium text-foreground">{submittedData.genre}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">College Year</span>
              <p className="font-medium text-foreground">{submittedData.college_year}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Platforms</span>
              <p className="font-medium text-foreground">
                {submittedData.platforms.filter(p => p !== "Other").join(", ")}
                {submittedData.platforms.includes("Other") && submittedData.other_platform 
                  ? `${submittedData.platforms.length > 1 ? ', ' : ''}${submittedData.other_platform}` 
                  : ''}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/results">
              <Button size="lg" className="w-full sm:w-auto">
                View Class Results
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-4 pb-20">
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-3 text-foreground">Favorite Artist Survey</h1>
          <p className="text-muted-foreground text-lg">Let's find out what the class is listening to.</p>
        </div>
        <Music className="w-16 h-16 text-primary/20 hidden sm:block" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
        {isError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to submit survey</p>
              <p className="text-sm opacity-90">{(error as any)?.message || "Please try again later."}</p>
            </div>
          </div>
        )}

        {/* Question 1 */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-border/60 transition-all hover:shadow-subtle hover:border-primary/20">
          <label htmlFor="favorite_artist" className="block text-lg font-semibold text-foreground mb-1">
            1. Who is your favorite artist or band? <span className="text-destructive">*</span>
          </label>
          <p className="text-sm text-muted-foreground mb-4">Enter the name exactly as it appears.</p>
          
          <input
            id="favorite_artist"
            type="text"
            autoFocus
            placeholder="e.g. Taylor Swift"
            {...register("favorite_artist")}
            aria-invalid={!!errors.favorite_artist}
            aria-describedby={errors.favorite_artist ? "artist-error" : undefined}
            className={cn(
              "w-full px-4 py-3 rounded-xl bg-background border-2 text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:outline-none focus:ring-4",
              errors.favorite_artist 
                ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                : "border-input focus:border-primary focus:ring-primary/20 hover:border-primary/40"
            )}
          />
          {errors.favorite_artist && (
            <p id="artist-error" className="mt-2 text-sm text-destructive font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.favorite_artist.message}
            </p>
          )}
        </div>

        {/* Question 2 */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-border/60 transition-all hover:shadow-subtle hover:border-primary/20">
          <label htmlFor="genre" className="block text-lg font-semibold text-foreground mb-1">
            2. What genre of music do you listen to most? <span className="text-destructive">*</span>
          </label>
          <p className="text-sm text-muted-foreground mb-4">Select the one you gravitate towards most often.</p>
          
          <div className="relative">
            <select
              id="genre"
              {...register("genre")}
              aria-invalid={!!errors.genre}
              aria-describedby={errors.genre ? "genre-error" : undefined}
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-background border-2 text-foreground appearance-none transition-all duration-200 focus:outline-none focus:ring-4 cursor-pointer",
                errors.genre 
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                  : "border-input focus:border-primary focus:ring-primary/20 hover:border-primary/40"
              )}
            >
              <option value="" disabled>Select a genre...</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
          {errors.genre && (
            <p id="genre-error" className="mt-2 text-sm text-destructive font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.genre.message}
            </p>
          )}
        </div>

        {/* Question 3 */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-border/60 transition-all hover:shadow-subtle hover:border-primary/20">
          <fieldset>
            <legend className="block text-lg font-semibold text-foreground mb-1">
              3. What year are you in college? <span className="text-destructive">*</span>
            </legend>
            <p className="text-sm text-muted-foreground mb-5">Select your current academic standing.</p>
            
            <div className="space-y-3">
              {YEARS.map((year) => (
                <label 
                  key={year} 
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                    watch("college_year") === year 
                      ? "border-primary bg-primary/5" 
                      : "border-input hover:border-primary/40 bg-background"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    watch("college_year") === year ? "border-primary" : "border-muted-foreground group-hover:border-primary/60"
                  )}>
                    {watch("college_year") === year && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <input
                    type="radio"
                    value={year}
                    {...register("college_year")}
                    className="sr-only"
                    aria-describedby={errors.college_year ? "year-error" : undefined}
                  />
                  <span className={cn("font-medium", watch("college_year") === year ? "text-primary" : "text-foreground")}>
                    {year}
                  </span>
                </label>
              ))}
            </div>
            {errors.college_year && (
              <p id="year-error" className="mt-3 text-sm text-destructive font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.college_year.message}
              </p>
            )}
          </fieldset>
        </div>

        {/* Question 4 */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-border/60 transition-all hover:shadow-subtle hover:border-primary/20">
          <fieldset>
            <legend className="block text-lg font-semibold text-foreground mb-1">
              4. Where do you listen to music? <span className="text-destructive">*</span>
            </legend>
            <p className="text-sm text-muted-foreground mb-5">Select all platforms that apply.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="platforms"
                control={control}
                render={({ field }) => (
                  <>
                    {PLATFORMS.map((platform) => {
                      const isChecked = field.value?.includes(platform);
                      return (
                        <label 
                          key={platform}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                            isChecked ? "border-primary bg-primary/5" : "border-input hover:border-primary/40 bg-background"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors",
                            isChecked ? "bg-primary border-primary text-white" : "border-muted-foreground group-hover:border-primary/60"
                          )}>
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(field.value || []), platform]
                                : field.value?.filter((v) => v !== platform);
                              field.onChange(updated);
                            }}
                            className="sr-only"
                            aria-describedby={errors.platforms ? "platforms-error" : undefined}
                          />
                          <span className={cn("font-medium", isChecked ? "text-primary" : "text-foreground")}>
                            {platform}
                          </span>
                        </label>
                      );
                    })}
                  </>
                )}
              />
            </div>
            
            <AnimatePresence>
              {hasOtherPlatform && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <label htmlFor="other_platform" className="sr-only">Specify other platform</label>
                  <input
                    id="other_platform"
                    type="text"
                    {...register("other_platform")}
                    ref={(e) => {
                      register("other_platform").ref(e);
                      // @ts-ignore
                      otherInputRef.current = e;
                    }}
                    placeholder="Please specify where you listen..."
                    aria-invalid={!!errors.other_platform}
                    aria-describedby={errors.other_platform ? "other-platform-error" : undefined}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl bg-background border-2 text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:outline-none focus:ring-4",
                      errors.other_platform 
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                        : "border-input focus:border-primary focus:ring-primary/20 hover:border-primary/40"
                    )}
                  />
                  {errors.other_platform && (
                    <p id="other-platform-error" className="mt-2 text-sm text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.other_platform.message}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {errors.platforms && !hasOtherPlatform && (
              <p id="platforms-error" className="mt-3 text-sm text-destructive font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.platforms.message}
              </p>
            )}
          </fieldset>
        </div>

        <div className="pt-6 border-t border-border/50">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full sm:w-auto"
            isLoading={isPending}
          >
            {isPending ? "Submitting..." : "Submit Survey"}
          </Button>
          <p className="mt-4 text-center sm:text-left text-sm text-muted-foreground">
            Your responses are completely anonymous.
          </p>
        </div>
      </form>
    </div>
  );
}
