export function fuzzySearch(query: string, text: string): boolean {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  let queryIndex = 0
  let textIndex = 0

  while (queryIndex < queryLower.length && textIndex < textLower.length) {
    if (queryLower[queryIndex] === textLower[textIndex]) {
      queryIndex++
    }
    textIndex++
  }

  return queryIndex === queryLower.length
}

export function searchAsciiCharacters(
  characters: Array<{ char: string; tags: string[] }>,
  query: string,
): Array<{ char: string; tags: string[] }> {
  if (!query.trim()) return characters

  return characters.filter(({ char, tags }) => {
    // Check if any tag matches the fuzzy search
    return tags.some((tag) => fuzzySearch(query, tag)) || fuzzySearch(query, char)
  })
}
