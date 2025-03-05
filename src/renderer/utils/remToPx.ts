/**
 * Converts a rem value to pixels
 */
export function remToPx(remValue: number): number {
  let rootFontSize = typeof window === 'undefined' 
    ? 16 
    : parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  
  return remValue * rootFontSize;
}