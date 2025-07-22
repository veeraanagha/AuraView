
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Music2, Sparkles, Wand2, MapPin, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SuggestionCard } from "./suggestion-card"
import { getActivitySuggestion, getMusicSuggestion, getImageGeneration } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "./ui/skeleton"

const formSchema = z.object({
  mood: z.enum(["Chill", "Creative", "Romantic", "Adventurous"]),
  language: z.enum(["English", "Hindi", "Telugu", "Tamil", "Malayalam"]),
})

type FormValues = z.infer<typeof formSchema>

interface Suggestions {
  activity: string | null
  music: string[] | null
  imageUrl: string | null
}

const weatherConditions = ["Sunny", "Rainy", "Cloudy", "Windy", "Drizzle", "Snowy", "Stormy"];

function AuraViewInternal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get('location');

  const [suggestions, setSuggestions] = useState<Suggestions>({ activity: null, music: null, imageUrl: null })
  const [isLoading, setIsLoading] = useState(false)
  const [weather, setWeather] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(location || '');
  const { toast } = useToast()

  useEffect(() => {
    if (!location) {
        router.push('/');
        return;
    }
    // "detect" weather
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    setWeather(randomWeather);
    setCurrentLocation(location);
  }, [location, router]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "Creative",
      language: "English",
    },
  })
  
  const { watch } = form;
  const mood = watch("mood");
  const language = watch("language");

  useEffect(() => {
    if(location && weather && mood && language) {
        // Debounce fetching suggestions
        const handler = setTimeout(() => {
            fetchSuggestions({mood, language});
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }
  }, [mood, language, weather, location]);


  async function fetchSuggestions(values: FormValues) {
    if (!location || !weather) return;
    setIsLoading(true)
    // Keep previous suggestions while loading new ones for a better UX
    
    try {
      const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Evening' : 'Night';
      const imagePrompt = `${values.mood} ${weather} ${timeOfDay} in ${location}`.toLowerCase();

      const [activityRes, musicRes, imageRes] = await Promise.all([
        getActivitySuggestion({
          location,
          mood: values.mood,
          timeOfDay,
          weather: weather,
        }),
        getMusicSuggestion({
          mood: values.mood,
          weather: weather,
          language: values.language,
        }),
        getImageGeneration({ prompt: imagePrompt })
      ])

      if (activityRes.success && musicRes.success && imageRes.success) {
        setSuggestions({
          activity: activityRes.data.suggestion,
          music: musicRes.data.playlistSuggestion,
          imageUrl: imageRes.data.imageUrl
        })
      } else {
        let errorMsg = "An unknown error occurred.";
        if (!activityRes.success) errorMsg = activityRes.error || "Activity suggestion failed.";
        else if (!musicRes.success) errorMsg = musicRes.error || "Music suggestion failed.";
        else if (!imageRes.success) errorMsg = imageRes.error || "Image generation failed.";
        throw new Error(errorMsg)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
      setSuggestions({ activity: null, music: null, imageUrl: `https://placehold.co/1200x800.png` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newLocation = (e.currentTarget.elements.namedItem('location') as HTMLInputElement).value;
    setIsEditingLocation(false);
    router.push(`/suggestions?location=${newLocation}`);
  }

  if (!location) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1 sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              Craft Your Aura
            </CardTitle>
            <CardDescription>
              Your personalized experience based on location, weather and mood.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <FormLabel>Location</FormLabel>
                  {isEditingLocation ? (
                    <div className="flex gap-2">
                       <form onSubmit={handleLocationSubmit} className="flex gap-2">
                        <Input name="location" defaultValue={currentLocation} />
                        <Button type="submit">Set</Button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-md border border-input">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{location}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" type="button" onClick={() => setIsEditingLocation(true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel>Detected Weather</FormLabel>
                  <div className="flex items-center justify-between p-2 rounded-md border border-input">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span>{weather || "Detecting..."}</span>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a mood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Chill">Chill</SelectItem>
                          <SelectItem value="Creative">Creative</SelectItem>
                          <SelectItem value="Romantic">Romantic</SelectItem>
                          <SelectItem value="Adventurous">Adventurous</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Music Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Telugu">Telugu</SelectItem>
                          <SelectItem value="Tamil">Tamil</SelectItem>
                          <SelectItem value="Malayalam">Malayalam</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden shadow-xl">
                 <AnimatePresence>
                    <motion.div
                    key={suggestions.imageUrl || 'placeholder'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                    {isLoading && !suggestions.imageUrl ? (
                        <Skeleton className="w-full aspect-[3/2]" />
                    ) : (
                        <Image
                            src={suggestions.imageUrl || `https://placehold.co/1200x800.png`}
                            alt="Dynamic visual based on weather and mood"
                            width={1200}
                            height={800}
                            className="w-full h-auto object-cover aspect-[3/2] transition-all duration-500 hover:scale-105"
                            data-ai-hint="ambience"
                            priority
                        />
                    )}
                    </motion.div>
                </AnimatePresence>
            </Card>
          
          <AnimatePresence>
            {isLoading && (!suggestions.activity || !suggestions.music) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                  <SuggestionCard.Skeleton />
                  <SuggestionCard.Skeleton />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            <AnimatePresence>
              {suggestions.activity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                  exit={{ opacity: 0 }}
                >
                  <SuggestionCard icon={Sparkles} title="Activity Suggestions">
                    {suggestions.activity}
                  </SuggestionCard>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {suggestions.music && suggestions.music.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                  exit={{ opacity: 0 }}
                >
                  <SuggestionCard icon={Music2} title="Music Suggestions">
                    <ul className="list-disc list-inside space-y-1 font-code">
                      {suggestions.music.map((song, index) => (
                        <li key={index}>{song}</li>
                      ))}
                    </ul>
                  </SuggestionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuraViewClient() {
  return (
    <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
        <AuraViewInternal />
    </Suspense>
  )
}

    