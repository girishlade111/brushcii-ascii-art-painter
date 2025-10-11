"use client"

import { useState, useRef } from "react"
import type { Cell, ToolMode, ColorToken } from "@/app/page"
import type { BrushSize } from "@/app/page"

interface CanvasProps {
  grid: Cell[][]
  canvasSize: { width: number; height: number }
  onCellClick: (row: number, col: number, shouldAddToHistory?: boolean) => void
  brushSize: BrushSize
  toolMode: ToolMode
  selectedBrush: string
  selectedColorToken: ColorToken
  onDrawShape: (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    shape: "rectangle" | "circle",
  ) => void
  zoom: number
  onStrokeStart: () => void
  onStrokeEnd: () => void
  onMoveCanvas: (offsetX: number, offsetY: number) => void
}

export function Canvas({
  grid,
  canvasSize,
  onCellClick,
  brushSize,
  toolMode,
  selectedBrush,
  selectedColorToken,
  onDrawShape,
  zoom,
  onStrokeStart,
  onStrokeEnd,
  onMoveCanvas,
}: CanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const lastDrawnCell = useRef<{ row: number; col: number } | null>(null)
  const [shapeStart, setShapeStart] = useState<{ row: number; col: number } | null>(null)
  const [shapePreview, setShapePreview] = useState<{ row: number; col: number }[]>([])
  const [moveStart, setMoveStart] = useState<{ row: number; col: number } | null>(null)
  const [moveOffset, setMoveOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const calculateShapePreview = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    shape: "rectangle" | "circle",
  ) => {
    const cells: { row: number; col: number }[] = []

    if (shape === "rectangle") {
      const minRow = Math.min(startRow, endRow)
      const maxRow = Math.max(startRow, endRow)
      const minCol = Math.min(startCol, endCol)
      const maxCol = Math.max(startCol, endCol)

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          if (row === minRow || row === maxRow || col === minCol || col === maxCol) {
            if (row < canvasSize.height && col < canvasSize.width) {
              cells.push({ row, col })
            }
          }
        }
      }
    } else if (shape === "circle") {
      const centerRow = (startRow + endRow) / 2
      const centerCol = (startCol + endCol) / 2
      const radiusRow = Math.abs(endRow - startRow) / 2
      const radiusCol = Math.abs(endCol - startCol) / 2

      for (let row = 0; row < canvasSize.height; row++) {
        for (let col = 0; col < canvasSize.width; col++) {
          const normalizedRow = (row - centerRow) / (radiusRow || 1)
          const normalizedCol = (col - centerCol) / (radiusCol || 1)
          const distance = normalizedRow * normalizedRow + normalizedCol * normalizedCol

          if (distance >= 0.8 && distance <= 1.2) {
            cells.push({ row, col })
          }
        }
      }
    }

    return cells
  }

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true)

    if (toolMode === "move") {
      setMoveStart({ row, col })
      setMoveOffset({ x: 0, y: 0 })
    } else if (toolMode === "rectangle" || toolMode === "circle") {
      setShapeStart({ row, col })
      setShapePreview([])
    } else {
      onStrokeStart()
      onCellClick(row, col, false)
      lastDrawnCell.current = { row, col }
    }
  }

  const handleMouseEnter = (row: number, col: number) => {
    setHoveredCell({ row, col })

    if (isDrawing && moveStart && toolMode === "move") {
      const offsetX = col - moveStart.col
      const offsetY = row - moveStart.row
      setMoveOffset({ x: offsetX, y: offsetY })
    } else if (isDrawing && shapeStart && (toolMode === "rectangle" || toolMode === "circle")) {
      const preview = calculateShapePreview(shapeStart.row, shapeStart.col, row, col, toolMode)
      setShapePreview(preview)
    } else if (isDrawing && (lastDrawnCell.current?.row !== row || lastDrawnCell.current?.col !== col)) {
      onCellClick(row, col, false)
      lastDrawnCell.current = { row, col }
    }
  }

  const handleMouseUp = (row: number, col: number) => {
    if (isDrawing && moveStart && toolMode === "move") {
      const offsetX = col - moveStart.col
      const offsetY = row - moveStart.row
      if (offsetX !== 0 || offsetY !== 0) {
        onMoveCanvas(offsetX, offsetY)
      }
      setMoveStart(null)
      setMoveOffset({ x: 0, y: 0 })
    } else if (isDrawing && shapeStart && (toolMode === "rectangle" || toolMode === "circle")) {
      onDrawShape(shapeStart.row, shapeStart.col, row, col, toolMode)
      setShapeStart(null)
      setShapePreview([])
    } else if (isDrawing) {
      onStrokeEnd()
    }

    setIsDrawing(false)
    lastDrawnCell.current = null
  }

  const isInBrushArea = (row: number, col: number) => {
    if (!hoveredCell || toolMode === "rectangle" || toolMode === "circle" || toolMode === "move") return false
    return (
      row >= hoveredCell.row &&
      row < hoveredCell.row + brushSize &&
      col >= hoveredCell.col &&
      col < hoveredCell.col + brushSize
    )
  }

  const isInShapePreview = (row: number, col: number) => {
    return shapePreview.some((cell) => cell.row === row && cell.col === col)
  }

  const getCellWithMoveOffset = (row: number, col: number) => {
    if (toolMode === "move" && moveStart && (moveOffset.x !== 0 || moveOffset.y !== 0)) {
      const sourceRow = row - moveOffset.y
      const sourceCol = col - moveOffset.x
      if (sourceRow >= 0 && sourceRow < canvasSize.height && sourceCol >= 0 && sourceCol < canvasSize.width) {
        return grid[sourceRow][sourceCol]
      }
      return { char: "", colorToken: "foreground" as ColorToken }
    }
    return grid[row][col]
  }

  const baseFontSize = Math.max(16, Math.min(28, 512 / Math.max(canvasSize.width, canvasSize.height))) * zoom
  const charWidth = baseFontSize * 0.6
  const charHeight = baseFontSize

  const getColorClass = (token: ColorToken) => {
    return token === "foreground" ? "text-foreground" : "text-muted-foreground"
  }

  return (
    <div
      className="inline-block select-none"
      onMouseLeave={() => {
        setHoveredCell(null)
        if (isDrawing && !shapeStart && !moveStart) {
          onStrokeEnd()
        }
        setIsDrawing(false)
        setShapeStart(null)
        setShapePreview([])
        setMoveStart(null)
        setMoveOffset({ x: 0, y: 0 })
      }}
      onMouseUp={(e) => {
        const target = e.target as HTMLElement
        if (target.dataset.row && target.dataset.col) {
          handleMouseUp(Number.parseInt(target.dataset.row), Number.parseInt(target.dataset.col))
        }
      }}
    >
      <div
        className="bg-card border-2 border-border rounded-lg shadow-lg overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${canvasSize.width}, ${charWidth}px)`,
          gridTemplateRows: `repeat(${canvasSize.height}, ${charHeight}px)`,
          cursor: toolMode === "move" ? "move" : "crosshair",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((_, colIndex) => {
            const showShapePreview = isInShapePreview(rowIndex, colIndex)
            const showBrushPreview = isInBrushArea(rowIndex, colIndex)
            const cell = getCellWithMoveOffset(rowIndex, colIndex)

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-row={rowIndex}
                data-col={colIndex}
                className={`border border-border/30 flex items-center justify-center font-mono ${
                  showShapePreview ? getColorClass(selectedColorToken) : getColorClass(cell.colorToken)
                }`}
                style={{
                  backgroundColor: showShapePreview || showBrushPreview ? "rgba(99, 102, 241, 0.1)" : "transparent",
                  fontSize: `${baseFontSize}px`,
                  lineHeight: 1,
                  letterSpacing: 0,
                  transition: "background-color 0s",
                }}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {showShapePreview ? selectedBrush : cell.char}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
