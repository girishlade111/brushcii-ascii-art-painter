export interface AsciiChar {
  char: string
  tags: string[]
  category: string
}

export const asciiCharacters: AsciiChar[] = [
  // Shapes & Symbols
  { char: "█", tags: ["block", "full", "solid", "square"], category: "shapes" },
  { char: "▓", tags: ["block", "dark", "shade"], category: "shapes" },
  { char: "▒", tags: ["block", "medium", "shade"], category: "shapes" },
  { char: "░", tags: ["block", "light", "shade"], category: "shapes" },
  { char: "▀", tags: ["block", "top", "half"], category: "shapes" },
  { char: "▄", tags: ["block", "bottom", "half"], category: "shapes" },
  { char: "▌", tags: ["block", "left", "half"], category: "shapes" },
  { char: "▐", tags: ["block", "right", "half"], category: "shapes" },
  { char: "■", tags: ["square", "solid", "small"], category: "shapes" },
  { char: "□", tags: ["square", "empty", "outline"], category: "shapes" },
  { char: "●", tags: ["circle", "solid", "dot"], category: "shapes" },
  { char: "○", tags: ["circle", "empty", "outline"], category: "shapes" },
  { char: "◆", tags: ["diamond", "solid"], category: "shapes" },
  { char: "◇", tags: ["diamond", "empty", "outline"], category: "shapes" },
  { char: "▲", tags: ["triangle", "up", "arrow"], category: "shapes" },
  { char: "▼", tags: ["triangle", "down", "arrow"], category: "shapes" },
  { char: "◀", tags: ["triangle", "left", "arrow"], category: "shapes" },
  { char: "▶", tags: ["triangle", "right", "arrow"], category: "shapes" },

  // Arrows
  { char: "→", tags: ["arrow", "right", "direction"], category: "arrows" },
  { char: "←", tags: ["arrow", "left", "direction"], category: "arrows" },
  { char: "↑", tags: ["arrow", "up", "direction"], category: "arrows" },
  { char: "↓", tags: ["arrow", "down", "direction"], category: "arrows" },
  { char: "↗", tags: ["arrow", "diagonal", "up-right"], category: "arrows" },
  { char: "↘", tags: ["arrow", "diagonal", "down-right"], category: "arrows" },
  { char: "↙", tags: ["arrow", "diagonal", "down-left"], category: "arrows" },
  { char: "↖", tags: ["arrow", "diagonal", "up-left"], category: "arrows" },
  { char: "⇒", tags: ["arrow", "double", "right"], category: "arrows" },
  { char: "⇐", tags: ["arrow", "double", "left"], category: "arrows" },

  // Lines & Borders
  { char: "─", tags: ["line", "horizontal", "border"], category: "lines" },
  { char: "│", tags: ["line", "vertical", "border"], category: "lines" },
  { char: "┌", tags: ["corner", "top-left", "border"], category: "lines" },
  { char: "┐", tags: ["corner", "top-right", "border"], category: "lines" },
  { char: "└", tags: ["corner", "bottom-left", "border"], category: "lines" },
  { char: "┘", tags: ["corner", "bottom-right", "border"], category: "lines" },
  { char: "├", tags: ["junction", "left", "border"], category: "lines" },
  { char: "┤", tags: ["junction", "right", "border"], category: "lines" },
  { char: "┬", tags: ["junction", "top", "border"], category: "lines" },
  { char: "┴", tags: ["junction", "bottom", "border"], category: "lines" },
  { char: "┼", tags: ["cross", "junction", "border"], category: "lines" },
  { char: "═", tags: ["line", "double", "horizontal"], category: "lines" },
  { char: "║", tags: ["line", "double", "vertical"], category: "lines" },

  // Special Characters
  { char: "★", tags: ["star", "solid", "favorite"], category: "special" },
  { char: "☆", tags: ["star", "empty", "outline"], category: "special" },
  { char: "♥", tags: ["heart", "love", "solid"], category: "special" },
  { char: "♡", tags: ["heart", "love", "empty"], category: "special" },
  { char: "♪", tags: ["music", "note", "sound"], category: "special" },
  { char: "♫", tags: ["music", "notes", "sound"], category: "special" },
  { char: "☀", tags: ["sun", "weather", "bright"], category: "special" },
  { char: "☁", tags: ["cloud", "weather"], category: "special" },
  { char: "☂", tags: ["umbrella", "rain", "weather"], category: "special" },
  { char: "☃", tags: ["snowman", "winter", "cold"], category: "special" },
  { char: "✓", tags: ["check", "tick", "yes", "done"], category: "special" },
  { char: "✗", tags: ["cross", "x", "no", "wrong"], category: "special" },
  { char: "✦", tags: ["sparkle", "star", "shine"], category: "special" },
  { char: "✧", tags: ["sparkle", "star", "shine"], category: "special" },

  // Letters & Numbers
  { char: "A", tags: ["letter", "alphabet", "uppercase"], category: "text" },
  { char: "B", tags: ["letter", "alphabet", "uppercase"], category: "text" },
  { char: "C", tags: ["letter", "alphabet", "uppercase"], category: "text" },
  { char: "X", tags: ["letter", "alphabet", "uppercase", "cross"], category: "text" },
  { char: "O", tags: ["letter", "alphabet", "uppercase", "circle"], category: "text" },
  { char: "0", tags: ["number", "zero"], category: "text" },
  { char: "1", tags: ["number", "one"], category: "text" },
  { char: "2", tags: ["number", "two"], category: "text" },

  // Punctuation & Symbols
  { char: ".", tags: ["dot", "period", "point"], category: "punctuation" },
  { char: ",", tags: ["comma", "separator"], category: "punctuation" },
  { char: ":", tags: ["colon", "separator"], category: "punctuation" },
  { char: ";", tags: ["semicolon", "separator"], category: "punctuation" },
  { char: "!", tags: ["exclamation", "emphasis"], category: "punctuation" },
  { char: "?", tags: ["question", "query"], category: "punctuation" },
  { char: "#", tags: ["hash", "number", "tag"], category: "punctuation" },
  { char: "@", tags: ["at", "email"], category: "punctuation" },
  { char: "*", tags: ["asterisk", "star", "multiply"], category: "punctuation" },
  { char: "+", tags: ["plus", "add", "cross"], category: "punctuation" },
  { char: "-", tags: ["minus", "dash", "hyphen"], category: "punctuation" },
  { char: "=", tags: ["equals", "line"], category: "punctuation" },
  { char: "/", tags: ["slash", "divide", "forward"], category: "punctuation" },
  { char: "\\", tags: ["backslash", "escape"], category: "punctuation" },
  { char: "|", tags: ["pipe", "bar", "vertical"], category: "punctuation" },
  { char: "~", tags: ["tilde", "wave"], category: "punctuation" },
  { char: "^", tags: ["caret", "up", "power"], category: "punctuation" },
  { char: "_", tags: ["underscore", "line", "bottom"], category: "punctuation" },
]

export const defaultBrushes = ["█", "●", "★", "♥", "→"]
