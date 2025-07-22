
'use server'

import { suggestActivity, type SuggestActivityInput } from '@/ai/flows/suggest-activity'
import { suggestMusic, type SuggestMusicInput } from '@/ai/flows/suggest-music'

export async function getActivitySuggestion(input: SuggestActivityInput) {
  try {
    const data = await suggestActivity(input)
    return { success: true, data }
  } catch (error) {
    console.error('Error getting activity suggestion:', error)
    return { success: false, error: 'Failed to get activity suggestion. Please try again.' }
  }
}

export async function getMusicSuggestion(input: SuggestMusicInput) {
  try {
    const data = await suggestMusic(input)
    return { success: true, data }
  } catch (error) {
    console.error('Error getting music suggestion:', error)
    return { success: false, error: 'Failed to get music suggestion. Please try again.' }
  }
}
