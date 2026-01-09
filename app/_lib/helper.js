export function convertToSubcurrency(amount, factor = 100) {
  return Math.round(amount * factor);
}
