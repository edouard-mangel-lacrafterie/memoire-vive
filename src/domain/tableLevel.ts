export function tableLevel(memories: number): string {
  if (memories >= 7) return 'Inséparables'
  if (memories >= 4) return 'Complices'
  if (memories >= 1) return 'Curieux'
  return 'Timides'
}
