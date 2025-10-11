"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Canvas } from "@/components/canvas"
import { Toolbar } from "@/components/toolbar"
import { Header } from "@/components/header"
import { defaultBrushes } from "@/lib/ascii-data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type BrushSize = 1 | 2 | 3 | 4
export type ToolMode = "brush" | "eraser" | "rectangle" | "circle" | "move"
export type ColorToken = "foreground" | "muted-foreground"

export interface Cell {
  char: string
  colorToken: ColorToken
}

export default function Home() {
  const [canvasSize, setCanvasSize] = useState({ width: 16, height: 16 })
  const [grid, setGrid] = useState<Cell[][]>(
    Array(16)
      .fill(null)
      .map(() =>
        Array(16)
          .fill(null)
          .map(() => ({ char: "", colorToken: "foreground" as ColorToken })),
      ),
  )
  const [history, setHistory] = useState<Cell[][][]>([
    Array(16)
      .fill(null)
      .map(() =>
        Array(16)
          .fill(null)
          .map(() => ({ char: "", colorToken: "foreground" as ColorToken })),
      ),
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  const [selectedBrush, setSelectedBrush] = useState("█")
  const [selectedColorToken, setSelectedColorToken] = useState<ColorToken>("foreground")
  const [brushSize, setBrushSize] = useState<BrushSize>(1)
  const [toolMode, setToolMode] = useState<ToolMode>("brush")
  const [recentBrushes, setRecentBrushes] = useState<string[]>(defaultBrushes)
  const [usageCount, setUsageCount] = useState<Record<string, number>>({})
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [zoom, setZoom] = useState(1.0)

  const strokeStartGrid = useRef<Cell[][] | null>(null)
  const isStrokeActive = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault()
        handleZoomIn()
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "-" || e.key === "_")) {
        e.preventDefault()
        handleZoomOut()
      } else if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault()
        handleZoomReset()
      }
      // Brush shortcut (B)
      else if (e.key === "b" || e.key === "B") {
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault()
          setToolMode("brush")
        }
      }
      // Eraser shortcut (E)
      else if (e.key === "e" || e.key === "E") {
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault()
          setToolMode("eraser")
        }
      } else if (e.key === "m" || e.key === "M") {
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault()
          setToolMode("move")
        }
      }
      // Clear canvas shortcut (DEL)
      else if (e.key === "Delete" || e.key === "Backspace") {
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault()
          setShowClearDialog(true)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [historyIndex, history])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setGrid(history[newIndex])
    }
  }, [historyIndex, history])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setGrid(history[newIndex])
    }
  }, [historyIndex, history])

  const updateGrid = useCallback(
    (row: number, col: number, shouldAddToHistory = false) => {
      setGrid((prev) => {
        const newGrid = prev.map((r) => [...r])

        // Apply brush size
        for (let i = 0; i < brushSize; i++) {
          for (let j = 0; j < brushSize; j++) {
            const targetRow = row + i
            const targetCol = col + j

            if (targetRow < canvasSize.height && targetCol < canvasSize.width) {
              if (toolMode === "eraser") {
                newGrid[targetRow][targetCol] = {
                  char: "",
                  colorToken: "foreground",
                }
              } else {
                newGrid[targetRow][targetCol] = {
                  char: selectedBrush,
                  colorToken: selectedColorToken,
                }
              }
            }
          }
        }

        if (shouldAddToHistory) {
          setHistory((prevHistory) => {
            const newHistory = prevHistory.slice(0, historyIndex + 1)
            newHistory.push(newGrid)
            // Limit history to 50 states
            if (newHistory.length > 50) {
              newHistory.shift()
              setHistoryIndex((prev) => prev)
            } else {
              setHistoryIndex((prev) => prev + 1)
            }
            return newHistory
          })
        }

        return newGrid
      })

      // Update usage count only in brush mode
      if (toolMode === "brush") {
        setUsageCount((prev) => ({
          ...prev,
          [selectedBrush]: (prev[selectedBrush] || 0) + 1,
        }))

        // Update recent brushes
        setRecentBrushes((prev) => {
          const filtered = prev.filter((b) => b !== selectedBrush)
          return [selectedBrush, ...filtered].slice(0, 5)
        })
      }
    },
    [selectedBrush, selectedColorToken, brushSize, canvasSize, historyIndex, toolMode],
  )

  const drawShape = useCallback(
    (startRow: number, startCol: number, endRow: number, endCol: number, shape: "rectangle" | "circle") => {
      setGrid((prev) => {
        const newGrid = prev.map((r) => [...r])

        if (shape === "rectangle") {
          // Draw rectangle outline
          const minRow = Math.min(startRow, endRow)
          const maxRow = Math.max(startRow, endRow)
          const minCol = Math.min(startCol, endCol)
          const maxCol = Math.max(startCol, endCol)

          for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
              // Only draw on the border
              if (row === minRow || row === maxRow || col === minCol || col === maxCol) {
                if (row < canvasSize.height && col < canvasSize.width) {
                  newGrid[row][col] = {
                    char: selectedBrush,
                    colorToken: selectedColorToken,
                  }
                }
              }
            }
          }
        } else if (shape === "circle") {
          // Draw circle outline using midpoint circle algorithm
          const centerRow = (startRow + endRow) / 2
          const centerCol = (startCol + endCol) / 2
          const radiusRow = Math.abs(endRow - startRow) / 2
          const radiusCol = Math.abs(endCol - startCol) / 2

          // Draw ellipse by checking distance
          for (let row = 0; row < canvasSize.height; row++) {
            for (let col = 0; col < canvasSize.width; col++) {
              const normalizedRow = (row - centerRow) / (radiusRow || 1)
              const normalizedCol = (col - centerCol) / (radiusCol || 1)
              const distance = normalizedRow * normalizedRow + normalizedCol * normalizedCol

              // Check if point is on the circle perimeter (with some tolerance)
              if (distance >= 0.8 && distance <= 1.2) {
                newGrid[row][col] = {
                  char: selectedBrush,
                  colorToken: selectedColorToken,
                }
              }
            }
          }
        }

        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, historyIndex + 1)
          newHistory.push(newGrid)
          if (newHistory.length > 50) {
            newHistory.shift()
            setHistoryIndex((prev) => prev)
          } else {
            setHistoryIndex((prev) => prev + 1)
          }
          return newHistory
        })

        return newGrid
      })

      // Update usage count
      setUsageCount((prev) => ({
        ...prev,
        [selectedBrush]: (prev[selectedBrush] || 0) + 1,
      }))

      setRecentBrushes((prev) => {
        const filtered = prev.filter((b) => b !== selectedBrush)
        return [selectedBrush, ...filtered].slice(0, 5)
      })
    },
    [selectedBrush, selectedColorToken, canvasSize, historyIndex],
  )

  const handleBrushSelect = useCallback((char: string) => {
    setSelectedBrush(char)
    setToolMode("brush")
  }, [])

  const handleColorTokenChange = useCallback((token: ColorToken) => {
    setSelectedColorToken(token)
  }, [])

  const handleToolModeChange = useCallback((mode: ToolMode) => {
    setToolMode(mode)
  }, [])

  const handleCanvasSizeChange = useCallback((width: number, height: number) => {
    setCanvasSize({ width, height })
    const newGrid = Array(height)
      .fill(null)
      .map(() =>
        Array(width)
          .fill(null)
          .map(() => ({ char: "", colorToken: "foreground" as ColorToken })),
      )
    setGrid(newGrid)
    setHistory([newGrid])
    setHistoryIndex(0)
  }, [])

  const handleClear = useCallback(() => {
    const newGrid = Array(canvasSize.height)
      .fill(null)
      .map(() =>
        Array(canvasSize.width)
          .fill(null)
          .map(() => ({ char: "", colorToken: "foreground" as ColorToken })),
      )
    setGrid(newGrid)
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newGrid)
      return newHistory
    })
    setHistoryIndex((prev) => prev + 1)
    setShowClearDialog(false)
  }, [canvasSize, historyIndex])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3.0))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoom(1.0)
  }, [])

  const handleStrokeStart = useCallback(() => {
    strokeStartGrid.current = grid.map((r) => [...r])
    isStrokeActive.current = true
  }, [grid])

  const handleStrokeEnd = useCallback(() => {
    if (isStrokeActive.current && strokeStartGrid.current) {
      // Add the final state to history
      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, historyIndex + 1)
        newHistory.push(grid)
        if (newHistory.length > 50) {
          newHistory.shift()
          setHistoryIndex((prev) => prev)
        } else {
          setHistoryIndex((prev) => prev + 1)
        }
        return newHistory
      })
    }
    strokeStartGrid.current = null
    isStrokeActive.current = false
  }, [grid, historyIndex])

  const moveCanvas = useCallback(
    (offsetX: number, offsetY: number) => {
      setGrid((prev) => {
        const newGrid = Array(canvasSize.height)
          .fill(null)
          .map(() =>
            Array(canvasSize.width)
              .fill(null)
              .map(() => ({ char: "", colorToken: "foreground" as ColorToken })),
          )

        // Copy cells to new positions, discarding those that fall outside bounds
        for (let row = 0; row < canvasSize.height; row++) {
          for (let col = 0; col < canvasSize.width; col++) {
            const cell = prev[row][col]
            if (cell.char) {
              const newRow = row + offsetY
              const newCol = col + offsetX

              // Only copy if new position is within bounds
              if (newRow >= 0 && newRow < canvasSize.height && newCol >= 0 && newCol < canvasSize.width) {
                newGrid[newRow][newCol] = cell
              }
            }
          }
        }

        // Add to history
        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, historyIndex + 1)
          newHistory.push(newGrid)
          if (newHistory.length > 50) {
            newHistory.shift()
            setHistoryIndex((prev) => prev)
          } else {
            setHistoryIndex((prev) => prev + 1)
          }
          return newHistory
        })

        return newGrid
      })
    },
    [canvasSize, historyIndex],
  )

  const handleFindReplace = useCallback(
    (findChar: string, replaceChar: string) => {
      setGrid((prev) => {
        const newGrid = prev.map((row) =>
          row.map((cell) => {
            if (cell.char === findChar) {
              return { ...cell, char: replaceChar }
            }
            return cell
          }),
        )

        // Add to history
        setHistory((prevHistory) => {
          const newHistory = prevHistory.slice(0, historyIndex + 1)
          newHistory.push(newGrid)
          if (newHistory.length > 50) {
            newHistory.shift()
            setHistoryIndex((prev) => prev)
          } else {
            setHistoryIndex((prev) => prev + 1)
          }
          return newHistory
        })

        return newGrid
      })
    },
    [historyIndex],
  )

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20 pb-28">
      <Header
        grid={grid}
        canvasSize={canvasSize}
        onCanvasSizeChange={handleCanvasSizeChange}
        onClear={() => setShowClearDialog(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onFindReplace={handleFindReplace}
      />

      <main className="flex-1 flex items-center justify-center p-8">
        <Canvas
          grid={grid}
          canvasSize={canvasSize}
          onCellClick={updateGrid}
          brushSize={brushSize}
          toolMode={toolMode}
          selectedBrush={selectedBrush}
          selectedColorToken={selectedColorToken}
          onDrawShape={drawShape}
          zoom={zoom}
          onStrokeStart={handleStrokeStart}
          onStrokeEnd={handleStrokeEnd}
          onMoveCanvas={moveCanvas}
        />
      </main>

      <Toolbar
        selectedBrush={selectedBrush}
        selectedColorToken={selectedColorToken}
        brushSize={brushSize}
        recentBrushes={recentBrushes}
        usageCount={usageCount}
        toolMode={toolMode}
        onBrushSelect={handleBrushSelect}
        onColorTokenChange={handleColorTokenChange}
        onBrushSizeChange={setBrushSize}
        onToolModeChange={handleToolModeChange}
      />

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all your artwork from the canvas. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
