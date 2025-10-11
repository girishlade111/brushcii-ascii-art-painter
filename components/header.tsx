"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Copy,
  Download,
  Settings,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Eye,
  Search,
  ArrowRight,
  Check,
  HelpCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useRef, useEffect, useMemo } from "react"
import type { Cell } from "@/app/page"
import { asciiCharacters } from "@/lib/ascii-data"
import { searchAsciiCharacters } from "@/lib/fuzzy-search"

interface HeaderProps {
  grid: Cell[][]
  canvasSize: { width: number; height: number }
  onCanvasSizeChange: (width: number, height: number) => void
  onClear: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onFindReplace: (findChar: string, replaceChar: string) => void
}

type ExportFormat = "plain" | "markdown" | "html"

export function Header({
  grid,
  canvasSize,
  onCanvasSizeChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFindReplace,
}: HeaderProps) {
  const { toast } = useToast()
  const [width, setWidth] = useState(canvasSize.width.toString())
  const [height, setHeight] = useState(canvasSize.height.toString())
  const [previewOpen, setPreviewOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>("html")
  const [includeColorStyling, setIncludeColorStyling] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [findReplaceOpen, setFindReplaceOpen] = useState(false)
  const [findChar, setFindChar] = useState("")
  const [replaceChar, setReplaceChar] = useState("")
  const [findPopoverOpen, setFindPopoverOpen] = useState(false)
  const [replacePopoverOpen, setReplacePopoverOpen] = useState(false)
  const [replaceSearchQuery, setReplaceSearchQuery] = useState("")

  const [isDraggingZoom, setIsDraggingZoom] = useState(false)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const dragStartZoom = useRef(1)

  const usedCharacters = useMemo(() => {
    const chars = new Set<string>()
    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.char) {
          chars.add(cell.char)
        }
      })
    })
    return Array.from(chars)
  }, [grid])

  const filteredReplaceCharacters = useMemo(() => {
    return searchAsciiCharacters(asciiCharacters, replaceSearchQuery)
  }, [replaceSearchQuery])

  const groupedReplaceCharacters = useMemo(() => {
    const groups: Record<string, typeof asciiCharacters> = {}
    filteredReplaceCharacters.forEach((char) => {
      if (!groups[char.category]) {
        groups[char.category] = []
      }
      groups[char.category].push(char)
    })
    return groups
  }, [filteredReplaceCharacters])

  const handleFindReplaceSubmit = () => {
    if (findChar && replaceChar) {
      onFindReplace(findChar, replaceChar)
      toast({
        title: "Replaced!",
        description: `All instances of "${findChar}" replaced with "${replaceChar}"`,
      })
      setFindChar("")
      setReplaceChar("")
      setFindReplaceOpen(false)
    }
  }

  const handleZoomDragStart = (e: React.MouseEvent) => {
    setIsDraggingZoom(true)
    dragStartX.current = e.clientX
    dragStartY.current = e.clientY
    dragStartZoom.current = zoom
    e.preventDefault()
  }

  useEffect(() => {
    if (!isDraggingZoom) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current
      const deltaY = dragStartY.current - e.clientY
      const delta = deltaX + deltaY
      const zoomDelta = delta * 0.005
      const newZoom = Math.max(0.25, Math.min(3.0, dragStartZoom.current + zoomDelta))

      const steps = Math.round((newZoom - dragStartZoom.current) / 0.25)
      if (steps > 0) {
        for (let i = 0; i < steps; i++) onZoomIn()
      } else if (steps < 0) {
        for (let i = 0; i < Math.abs(steps); i++) onZoomOut()
      }
    }

    const handleMouseUp = () => {
      setIsDraggingZoom(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingZoom, onZoomIn, onZoomOut, zoom])

  const generateAsciiArt = () => {
    if (!includeColorStyling) {
      // Plain ASCII without color classes
      return grid
        .map((row) => {
          const line = row.map((cell) => cell.char || " ").join("")
          return line.padEnd(canvasSize.width, " ")
        })
        .join("\n")
    }

    // ASCII with color classes (for HTML/styled output)
    return grid
      .map((row) => {
        return row
          .map((cell) => {
            if (!cell.char) return " "
            const colorClass = cell.colorToken === "foreground" ? "text-foreground" : "text-muted-foreground"
            return `<span class="${colorClass}">${cell.char}</span>`
          })
          .join("")
      })
      .join("\n")
  }

  const generateAsciiArtWithFormatting = () => {
    const art = generateAsciiArt()

    if (exportFormat === "markdown") {
      return "```\n" + art + "\n```"
    }

    if (exportFormat === "html") {
      return "<pre>\n" + art + "\n</pre>"
    }

    return art
  }

  const handleCopy = () => {
    const art = generateAsciiArtWithFormatting()
    navigator.clipboard.writeText(art)

    let description = "ASCII art copied"
    if (exportFormat === "markdown") description += " with markdown code block"
    else if (exportFormat === "html") description += " with HTML <pre> tag"
    if (includeColorStyling) description += " (with color styling)"

    toast({
      title: "Copied!",
      description,
    })
  }

  const handleCopyFromPreview = () => {
    const art = generateAsciiArtWithFormatting()
    navigator.clipboard.writeText(art)

    let description = "ASCII art copied"
    if (exportFormat === "markdown") description += " with markdown code block"
    else if (exportFormat === "html") description += " with HTML <pre> tag"
    if (includeColorStyling) description += " (with color styling)"

    toast({
      title: "Copied!",
      description,
    })
    setPreviewOpen(false)
  }

  const handleDownload = () => {
    const art = generateAsciiArtWithFormatting()
    const blob = new Blob([art], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ascii-art.txt"
    a.click()
    URL.revokeObjectURL(url)

    let description = "ASCII art saved"
    if (exportFormat === "markdown") description += " with markdown code block"
    else if (exportFormat === "html") description += " with HTML <pre> tag"
    if (includeColorStyling) description += " (with color styling)"

    toast({
      title: "Downloaded!",
      description,
    })
  }

  const handleSizeChange = () => {
    const w = Number.parseInt(width)
    const h = Number.parseInt(height)
    if (w > 0 && w <= 64 && h > 0 && h <= 64) {
      onCanvasSizeChange(w, h)
      toast({
        title: "Canvas resized",
        description: `New size: ${w}×${h}`,
      })
    }
  }

  const presetSizes = [
    { label: "12×12", width: 12, height: 12 },
    { label: "16×16", width: 16, height: 16 },
    { label: "24×24", width: 24, height: 24 },
    { label: "32×16", width: 32, height: 16 },
  ]

  const getPreviewDescription = () => {
    let desc = "Copy the ASCII art below. "
    if (exportFormat === "markdown") {
      desc +=
        "It includes code block formatting (```) for easy pasting into markdown-aware apps like Discord, Slack, GitHub, etc."
    } else if (exportFormat === "html") {
      desc += "It includes HTML <pre> tag formatting for easy pasting into HTML documents or editors."
    } else {
      desc += "It's in clean format without any wrapping - paste into any monospace text editor."
    }
    if (includeColorStyling) {
      desc += " Color styling is included using shadcn classes."
    }
    return desc
  }

  return (
    <header className="fixed top-6 left-0 right-0 z-40 px-6">
      <div className="flex items-center justify-between w-full mx-auto">
        <div className="bg-card border border-border rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] px-4 py-2">
          <h1 className="text-sm font-semibold text-foreground">Brushcii</h1>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] px-2 py-2 flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="h-8 w-8 p-0 cursor-pointer">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} className="h-8 w-8 p-0 cursor-pointer">
            <Redo className="h-4 w-4" />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Popover open={findReplaceOpen} onOpenChange={setFindReplaceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={findReplaceOpen ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer"
                title="Find and Replace"
              >
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground">Find and Replace</h3>
                <div className="flex items-center gap-2">
                  <Popover open={findPopoverOpen} onOpenChange={setFindPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-12 h-10 font-mono text-lg cursor-pointer bg-transparent"
                        disabled={usedCharacters.length === 0}
                      >
                        {findChar || <HelpCircle className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start" side="bottom">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Characters in canvas:</p>
                        <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
                          {usedCharacters.map((char) => (
                            <Button
                              key={char}
                              variant={findChar === char ? "default" : "ghost"}
                              size="sm"
                              onClick={() => {
                                setFindChar(char)
                                setFindPopoverOpen(false)
                              }}
                              className="font-mono text-base w-9 h-9 p-0 cursor-pointer"
                            >
                              {char}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <ArrowRight className="h-4 w-4 text-muted-foreground" />

                  <Popover open={replacePopoverOpen} onOpenChange={setReplacePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-12 h-10 font-mono text-lg cursor-pointer bg-transparent">
                        {replaceChar || <HelpCircle className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-4" align="start" side="bottom">
                      <div className="space-y-3">
                        <Input
                          placeholder="Search (e.g., arrow, heart, star)..."
                          value={replaceSearchQuery}
                          onChange={(e) => setReplaceSearchQuery(e.target.value)}
                          className="h-9"
                        />
                        <div className="max-h-[300px] overflow-y-auto space-y-3">
                          {Object.entries(groupedReplaceCharacters).map(([category, chars]) => (
                            <div key={category}>
                              <h4 className="text-xs font-semibold text-muted-foreground mb-2 capitalize">
                                {category}
                              </h4>
                              <div className="grid grid-cols-10 gap-1">
                                {chars.map(({ char }) => (
                                  <Button
                                    key={char}
                                    variant={replaceChar === char ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => {
                                      setReplaceChar(char)
                                      setReplacePopoverOpen(false)
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

                  <Button
                    size="sm"
                    onClick={handleFindReplaceSubmit}
                    disabled={!findChar || !replaceChar}
                    className="h-10 w-10 p-0 cursor-pointer"
                    title="Replace all"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-4 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            disabled={zoom <= 0.25}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Zoom Out (Cmd+-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={handleZoomDragStart}
            onClick={onZoomReset}
            className={`h-8 px-2 text-xs font-mono ${isDraggingZoom ? "cursor-ew-resize" : "cursor-pointer"}`}
            title="Click to reset zoom (Cmd+0) or drag to zoom"
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            disabled={zoom >= 3.0}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Zoom In (Cmd++)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button variant={settingsOpen ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0 cursor-pointer">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Canvas Size</h3>
                  <div className="flex gap-2 mb-3">
                    {presetSizes.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWidth(preset.width.toString())
                          setHeight(preset.height.toString())
                          onCanvasSizeChange(preset.width, preset.height)
                        }}
                        className="text-xs cursor-pointer"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="width" className="text-xs">
                        Width
                      </Label>
                      <Input
                        id="width"
                        type="number"
                        min="1"
                        max="64"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="height" className="text-xs">
                        Height
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        min="1"
                        max="64"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSizeChange}
                    variant="secondary"
                    className="w-full mt-2 cursor-pointer"
                    size="sm"
                  >
                    Apply Size
                  </Button>
                </div>
                <div>
                  <Button onClick={onClear} variant="ghost" className="w-full cursor-pointer" size="sm">
                    Clear Canvas
                  </Button>
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold mb-3 text-sm">Export Format</h3>
                  <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="plain" id="plain" />
                      <Label htmlFor="plain" className="text-sm cursor-pointer">
                        ASCII Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="markdown" id="markdown" />
                      <Label htmlFor="markdown" className="text-sm cursor-pointer">
                        Markdown Code Block
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="html" id="html" />
                      <Label htmlFor="html" className="text-sm cursor-pointer">
                        {"HTML <pre> Tag"}
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-3">Choose how to format your exported ASCII art</p>
                </div>
                {exportFormat === "html" && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-color"
                        checked={includeColorStyling}
                        onCheckedChange={(checked) => setIncludeColorStyling(checked as boolean)}
                      />
                      <Label htmlFor="include-color" className="text-sm cursor-pointer">
                        Include shadcn color styling
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Wraps characters with text-foreground and text-muted-foreground classes
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer" title="Preview ASCII Art">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>ASCII Art Preview</DialogTitle>
                <DialogDescription>{getPreviewDescription()}</DialogDescription>
              </DialogHeader>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs font-mono whitespace-pre leading-none">
                  {includeColorStyling ? (
                    <div dangerouslySetInnerHTML={{ __html: generateAsciiArt() }} />
                  ) : (
                    generateAsciiArt()
                  )}
                </pre>
                <Button
                  onClick={handleCopyFromPreview}
                  size="sm"
                  className="absolute top-2 right-2 cursor-pointer"
                  variant="secondary"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Quick Copy"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
