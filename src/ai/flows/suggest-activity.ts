// This file uses server-side code.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting activities based on weather, time of day, and user mood.
 *
 * The flow takes weather conditions, time of day, and user mood as input and returns a suggested activity.
 * It uses a prompt to generate the suggestion.
 *
 * @interface SuggestActivityInput - Input for the suggestActivity function.
 * @interface SuggestActivityOutput - Output of the suggestActivity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestActivityInputSchema = z.object({
  weather: z.string().describe('The current weather conditions (e.g., sunny, rainy, cloudy).'),
  timeOfDay: z.string().describe('The time of day (e.g., morning, afternoon, evening, night).'),
  mood: z.string().describe('The user selected mood (e.g., Chill, Creative, Romantic, Adventurous).'),
  location: z.string().describe('The user\u0027s location (e.g., city, park).'),
});
export type SuggestActivityInput = z.infer<typeof SuggestActivityInputSchema>;

const SuggestActivityOutputSchema = z.object({
  suggestion: z.string().describe('A few simple, creative, and unique suggested activities based on the weather, time of day, and mood.'),
});
export type SuggestActivityOutput = z.infer<typeof SuggestActivityOutputSchema>;

const suggestActivityPrompt = ai.definePrompt({
  name: 'suggestActivityPrompt',
  input: {schema: SuggestActivityInputSchema},
  output: {schema: SuggestActivityOutputSchema},
  prompt: `You are an imaginative assistant who suggests unique and creative activities. Based on the user's mood, weather, time of day, and location, provide a few out-of-the-box and inspiring activity ideas. Avoid common or cliché suggestions. The suggestions should be simple enough to be actionable, but spark a sense of novelty and fun.

Weather: {{{weather}}}
Time of Day: {{{timeOfDay}}}
Mood: {{{mood}}}
Location: {{{location}}}

Suggest a few creative and unique activities:`,
});

const suggestActivityFlow = ai.defineFlow(
  {
    name: 'suggestActivityFlow',
    inputSchema: SuggestActivityInputSchema,
    outputSchema: SuggestActivityOutputSchema,
  },
  async input => {
    const {output} = await suggestActivityPrompt(input);
    return output!;
  }
);

export async function suggestActivity(input: SuggestActivityInput): Promise<SuggestActivityOutput> {
  return suggestActivityFlow(input);
}
