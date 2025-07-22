'use server';

/**
 * @fileOverview A Genkit flow for suggesting weather based on a location.
 *
 * This flow takes a location as input and returns a suggested weather condition.
 *
 * @interface SuggestWeatherInput - Input for the suggestWeather function.
 * @interface SuggestWeatherOutput - Output of the suggestWeather function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestWeatherInputSchema = z.object({
  location: z.string().describe("The user's location (e.g., city, country, or specific address)."),
});
export type SuggestWeatherInput = z.infer<typeof SuggestWeatherInputSchema>;

const SuggestWeatherOutputSchema = z.object({
  weather: z
    .string()
    .describe(
      'The predicted weather conditions (e.g., Sunny, Rainy, Cloudy, Windy, Drizzle, Snowy, Stormy).'
    ),
});
export type SuggestWeatherOutput = z.infer<typeof SuggestWeatherOutputSchema>;

const suggestWeatherPrompt = ai.definePrompt({
  name: 'suggestWeatherPrompt',
  input: { schema: SuggestWeatherInputSchema },
  output: { schema: SuggestWeatherOutputSchema },
  prompt: `Based on the provided location, predict the current weather there. Be as accurate as possible. Choose one of the following weather conditions: Sunny, Rainy, Cloudy, Windy, Drizzle, Snowy, Stormy.

Location: {{{location}}}

Predicted Weather:`,
});

const suggestWeatherFlow = ai.defineFlow(
  {
    name: 'suggestWeatherFlow',
    inputSchema: SuggestWeatherInputSchema,
    outputSchema: SuggestWeatherOutputSchema,
  },
  async (input) => {
    const { output } = await suggestWeatherPrompt(input);
    return output!;
  }
);

export async function suggestWeather(
  input: SuggestWeatherInput
): Promise<SuggestWeatherOutput> {
  return suggestWeatherFlow(input);
}
