/**
 * Project color utilities
 * Provides random color selection and name utilities for projects
 */

/**
 * Predefined project colors using Tailwind color palette
 */
export const PROJECT_COLORS = [
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#F59E0B', // amber-500
  '#10B981', // emerald-500
  '#06B6D4', // cyan-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#84CC16', // lime-500
  '#22C55E', // green-500
  '#A855F7', // purple-500
  '#F43F5E', // rose-500
  '#0EA5E9', // sky-500
];

/**
 * Returns a random color from the predefined project colors
 */
export function getRandomProjectColor(): string {
  const randomIndex = Math.floor(Math.random() * PROJECT_COLORS.length);
  return PROJECT_COLORS[randomIndex];
}

/**
 * Returns the first letter of a string in uppercase
 * @param name - The string to extract the first letter from
 * @returns The first letter in uppercase, or empty string if name is empty
 */
export function getFirstLetter(name: string): string {
  return name ? name.charAt(0).toUpperCase() : '';
}
