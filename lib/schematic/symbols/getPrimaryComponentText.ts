export function getPrimaryComponentText(displayText: string): string {
  return displayText.split(/[_/\s]+/u).find(Boolean) ?? displayText
}
