/**
 * Palette colors are locked hex values (see DECISIONS.md). Skia gradients need
 * the same hues at varying transparency, so we derive them here rather than
 * adding new entries to the palette.
 */
export function withAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
