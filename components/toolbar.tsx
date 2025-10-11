"use client"

import { Button } from "@/components/ui/button"
import { ChevronUp, Eraser, Square, Circle, Move, Sun, Moon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { asciiCharacters } from "@/lib/ascii-data"
import { searchAsciiCharacters } from "@/lib/fuzzy-search"
import { useState, useMemo } from "react"
import { useTheme } from "next-themes"
import type { BrushSize, ToolMode, ColorToken } from "@/app/page"

interface ToolbarProps {
  selectedBrush: string
  selectedColorToken: ColorToken
  brushSize: BrushSize
  recentBrushes: string[]
  usageCount: Record<string, number>
  toolMode: ToolMode
  onBrushSelect: (char: string) => void
  onColorTokenChange: (token: ColorToken) => void
  onBrushSizeChange: (size: BrushSize) => void
  onToolModeChange: (mode: ToolMode) => void
}

const brushSizes: { size: BrushSize; label: string; shortLabel: string }[] = [
  { size: 1, label: "Fine (1×1)", shortLabel: "XS" },
  { size: 2, label: "Small (2×2)", shortLabel: "SM" },
  { size: 3, label: "Medium (3×3)", shortLabel: "MD" },
  { size: 4, label: "Large (4×4)", shortLabel: "LG" },
]

export function Toolbar({
  selectedBrush,
  selectedColorToken,
  brushSize,
  recentBrushes,
  usageCount,
  toolMode,
  onBrushSelect,
  onColorTokenChange,
  onBrushSizeChange,
  onToolModeChange,
}: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const sortedByUsage = useMemo(() => {
    return [...asciiCharacters].sort((a, b) => {
      const countA = usageCount[a.char] || 0
      const countB = usageCount[b.char] || 0
      return countB - countA
    })
  }, [usageCount])

  const filteredCharacters = useMemo(() => {
    return searchAsciiCharacters(sortedByUsage, searchQuery)
  }, [sortedByUsage, searchQuery])

  const groupedCharacters = useMemo(() => {
    const groups: Record<string, typeof asciiCharacters> = {}
    filteredCharacters.forEach((char) => {
      if (!groups[char.category]) {
        groups[char.category] = []
      }
      groups[char.category].push(char)
    })
    return groups
  }, [filteredCharacters])

  const currentSizeLabel = brushSizes.find((s) => s.size === brushSize)?.shortLabel || "XS"

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {recentBrushes.map((brush) => (
              <Button
                key={brush}
                variant={selectedBrush === brush && toolMode === "brush" ? "default" : "outline"}
                size="sm"
                onClick={() => onBrushSelect(brush)}
                className={`font-mono text-lg w-9 h-9 p-0 cursor-pointer ${
                  selectedBrush === brush && toolMode === "brush"
                    ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]"
                    : selectedBrush === brush
                      ? "border-2 border-primary shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)]"
                      : "shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)]"
                }`}
              >
                {brush}
              </Button>
            ))}

            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0 cursor-pointer shadow-none">
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-4" align="center" side="top" sideOffset={12}>
                <div className="space-y-3">
                  <Input
                    placeholder="Search (e.g., arrow, heart, star)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                  <div className="max-h-[300px] overflow-y-auto space-y-3">
                    {Object.entries(groupedCharacters).map(([category, chars]) => (
                      <div key={category}>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 capitalize">{category}</h4>
                        <div className="grid grid-cols-10 gap-1">
                          {chars.map(({ char }) => (
                            <Button
                              key={char}
                              variant={selectedBrush === char ? "default" : "ghost"}
                              size="sm"
                              onClick={() => {
                                onBrushSelect(char)
                                setIsOpen(false)
                              }}
                              className="font-mono text-base w-9 h-9 p-0 cursor-pointer"
                              title={char}
                            >
                              {char}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            <Button
              variant={toolMode === "eraser" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolModeChange(toolMode === "eraser" ? "brush" : "eraser")}
              className={`w-9 h-9 p-0 cursor-pointer ${
                toolMode === "eraser"
                  ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]"
                  : "shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)]"
              }`}
              title="Eraser (E)"
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              variant={toolMode === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolModeChange(toolMode === "rectangle" ? "brush" : "rectangle")}
              className={`w-9 h-9 p-0 cursor-pointer ${
                toolMode === "rectangle"
                  ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]"
                  : "shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)]"
              }`}
              title="Rectangle"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={toolMode === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolModeChange(toolMode === "circle" ? "brush" : "circle")}
              className={`w-9 h-9 p-0 cursor-pointer ${
                toolMode === "circle"
                  ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]"
                  : "shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)]"
              }`}
              title="Circle"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={toolMode === "move" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolModeChange(toolMode === "move" ? "brush" : "move")}
              className={`w-9 h-9 p-0 cursor-pointer ${
                toolMode === "move"
                  ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]"
                  : "shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)]"
              }`}
              title="Move (M)"
            >
              <Move className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onColorTokenChange("foreground")}
              className={`w-9 h-9 rounded-md border-2 cursor-pointer transition-all ${
                selectedColorToken === "foreground"
                  ? "border-primary ring-2 ring-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]"
                  : "border-border shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)] hover:border-primary/50"
              } bg-foreground`}
              title="Foreground color"
              aria-label="Select foreground color"
            />
            <button
              onClick={() => onColorTokenChange("muted-foreground")}
              className={`w-9 h-9 rounded-md border-2 cursor-pointer transition-all ${
                selectedColorToken === "muted-foreground"
                  ? "border-primary ring-2 ring-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]"
                  : "border-border shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)] hover:border-primary/50"
              } bg-muted-foreground`}
              title="Muted foreground color"
              aria-label="Select muted foreground color"
            />
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 p-0 cursor-pointer shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)]"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9 p-0 font-semibold text-xs bg-transparent shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)] cursor-pointer"
                >
                  {currentSizeLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="center" side="top" sideOffset={12}>
                <div className="space-y-1">
                  {brushSizes.map(({ size, label }) => (
                    <Button
                      key={size}
                      variant={brushSize === size ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onBrushSizeChange(size)}
                      className="w-full justify-start text-sm cursor-pointer"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}
