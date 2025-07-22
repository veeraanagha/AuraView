
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Music2, Sparkles, Wand2 } from "lucide-react"

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

const formSchema = z.object({
  location: z.string().min(2, "Location is too short.").max(50, "Location is too long."),
  mood: z.enum(["Chill", "Creative", "Romantic", "Adventurous"]),
  weather: z.enum(["Sunny", "Rainy", "Cloudy", "Windy", "Drizzle"]),
  timeOfDay: z.enum(["Morning", "Afternoon", "Evening", "Night"]),
  language: z.enum(["English", "Hindi", "Telugu", "Tamil", "Malayalam"]),
})

type FormValues = z.infer<typeof formSchema>

interface Suggestions {
  activity: string | null
  music: string[] | null
  imageUrl: string | null
}

export function AuraViewClient() {
  const [suggestions, setSuggestions] = useState<Suggestions>({ activity: null, music: null, imageUrl: null })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "San Francisco",
      mood: "Creative",
      weather: "Sunny",
      timeOfDay: "Afternoon",
      language: "English",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setSuggestions({ activity: null, music: null, imageUrl: `https://placehold.co/1200x800.png` })
    
    try {
      const imagePrompt = `${values.mood} ${values.weather}`.toLowerCase();
      const [activityRes, musicRes, imageRes] = await Promise.all([
        getActivitySuggestion({
          location: values.location,
          mood: values.mood,
          timeOfDay: values.timeOfDay,
          weather: values.weather,
        }),
        getMusicSuggestion({
          mood: values.mood,
          weather: values.weather,
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

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1 sticky top-20">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              Craft Your Aura
            </CardTitle>
            <CardDescription>
              Tell us your location, mood, and more to generate a personalized experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paris, France" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="weather"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weather</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select weather" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sunny">Sunny</SelectItem>
                            <SelectItem value="Rainy">Rainy</SelectItem>
                            <SelectItem value="Cloudy">Cloudy</SelectItem>
                            <SelectItem value="Windy">Windy</SelectItem>
                            <SelectItem value="Drizzle">Drizzle</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="timeOfDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Day</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time of day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Morning">Morning</SelectItem>
                            <SelectItem value="Afternoon">Afternoon</SelectItem>
                            <SelectItem value="Evening">Evening</SelectItem>
                            <SelectItem value="Night">Night</SelectItem>
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
                </div>

                <Button type="submit" className="w-full !mt-8 bg-accent hover:bg-accent/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Experience"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden shadow-xl">
            <motion.div
              key={suggestions.imageUrl}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Image
                src={suggestions.imageUrl || `https://placehold.co/1200x800.png`}
                alt="Dynamic visual based on weather and mood"
                width={1200}
                height={800}
                className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-500 hover:scale-105"
                priority
              />
            </motion.div>
          </Card>
          
          <AnimatePresence>
            {isLoading && (
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
                  <SuggestionCard icon={Sparkles} title="Activity Suggestion">
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
                  <SuggestionCard icon={Music2} title="Music Suggestion">
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
  )
}
