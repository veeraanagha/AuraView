'use server';

/**
 * @fileOverview Suggests music playlists in the user's preferred language that match the selected mood and current weather.
 *
 * - suggestMusic - A function that handles the music suggestion process.
 * - SuggestMusicInput - The input type for the suggestMusic function.
 * - SuggestMusicOutput - The return type for the suggestMusic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMusicInputSchema = z.object({
  mood: z
    .string()
    .describe('The user selected mood (e.g., Chill, Creative, Romantic, Adventurous).'),
  weather: z.string().describe('The current weather conditions (e.g., Sunny, Rainy, Cloudy).'),
  language: z.string().describe('The user preferred language for music (e.g., English, Hindi, Telugu).'),
});
export type SuggestMusicInput = z.infer<typeof SuggestMusicInputSchema>;

const SuggestMusicOutputSchema = z.object({
  playlistSuggestion: z.string().describe('A suggestion for a music playlist that matches the mood, weather, and language.'),
});
export type SuggestMusicOutput = z.infer<typeof SuggestMusicOutputSchema>;

export async function suggestMusic(input: SuggestMusicInput): Promise<SuggestMusicOutput> {
  return suggestMusicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMusicPrompt',
  input: {schema: SuggestMusicInputSchema},
  output: {schema: SuggestMusicOutputSchema},
  prompt: `You are a music recommendation expert. Given the user's mood, the current weather, and their preferred language, suggest a music playlist that fits these criteria.\
\
Mood: {{{mood}}}\
Weather: {{{weather}}}\
Language: {{{language}}}\
\
Suggest a relevant music playlist:`,
});

const suggestMusicFlow = ai.defineFlow(
  {
    name: 'suggestMusicFlow',
    inputSchema: SuggestMusicInputSchema,
    outputSchema: SuggestMusicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
