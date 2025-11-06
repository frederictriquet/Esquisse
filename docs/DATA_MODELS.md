# Data Models & Types Specification

## Overview

This document defines all data structures, types, and interfaces used throughout the drawing application. These types ensure type safety and clear contracts between components.

---

## Core Data Models

### Point

**Purpose**: Represents a 2D coordinate in world space

**Definition**:
```typescript
interface Point {
  x: number  // X coordinate in world space
  y: number  // Y coordinate in world space
}
```

**Usage**:
- Stroke point coordinates
- Mouse position (after conversion)
- Viewport calculations

**Example**:
```typescript
const point: Point = { x: 100.5, y: 200.7 }
```

**Validation**:
- Both x and y must be finite numbers
- Can be positive, negative, or zero
- Represents infinite canvas space

---

### Stroke

**Purpose**: Represents a single drawing stroke (line)

**Definition**:
```typescript
interface Stroke {
  id: string           // Unique identifier (UUID)
  color: string        // Hex color (e.g., "#FF0000")
  width: number        // Stroke width in world units
  points: Point[]      // Array of points in world space
  timestamp: number    // Creation time (Date.now())
}
```

**Usage**:
- Stored in drawing store
- Rendered on canvas
- Serialized to file

**Example**:
```typescript
const stroke: Stroke = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  color: '#000000',
  width: 2,
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 15 }
  ],
  timestamp: 1699276800000
}
```

**Validation Rules**:
- `id`: Must be unique across all strokes
- `color`: Valid CSS hex color (#RRGGBB)
- `width`: Positive number > 0
- `points`: At least 1 point (ideally 2+)
- `timestamp`: Valid Unix timestamp

**Invariants**:
- Points are in world coordinates (never screen coordinates)
- Width is constant regardless of zoom level
- Color is always 6-digit hex

---

### Transform

**Purpose**: Represents viewport transform (zoom and pan)

**Definition**:
```typescript
interface Transform {
  x: number      // Pan offset X in screen pixels
  y: number      // Pan offset Y in screen pixels
  scale: number  // Zoom scale factor (1.0 = 100%)
}
```

**Usage**:
- Stored in transform store
- Applied to canvas context
- Used in coordinate conversions

**Example**:
```typescript
const transform: Transform = {
  x: 100,      // Pan right 100px
  y: -50,      // Pan up 50px
  scale: 2.0   // Zoomed in 2x
}
```

**Constraints**:
- `x`: Any finite number
- `y`: Any finite number
- `scale`: Must be > 0 (typically 0.01 to 100)

**Special Values**:
- `scale = 1.0`: No zoom (1:1)
- `scale < 1.0`: Zoomed out
- `scale > 1.0`: Zoomed in
- `x = 0, y = 0`: Origin at top-left

---

### DrawingSettings

**Purpose**: Current tool settings for drawing

**Definition**:
```typescript
interface DrawingSettings {
  color: string  // Current stroke color
  width: number  // Current stroke width
}
```

**Usage**:
- Stored in settings store
- Applied to new strokes
- Displayed in toolbar

**Example**:
```typescript
const settings: DrawingSettings = {
  color: '#FF0000',
  width: 5
}
```

**Validation**:
- `color`: Valid hex color
- `width`: Positive number (typically 1-20)

---

## State Models

### DrawingState

**Purpose**: Complete drawing application state

**Definition**:
```typescript
interface DrawingState {
  strokes: Stroke[]  // All strokes in the drawing
}
```

**Usage**:
- Stored in drawing store
- Synchronized across windows
- Serialized to file

**Example**:
```typescript
const state: DrawingState = {
  strokes: [
    { id: '...', color: '#000', width: 2, points: [...], timestamp: 123 },
    { id: '...', color: '#F00', width: 4, points: [...], timestamp: 456 }
  ]
}
```

**Operations**:
- Add stroke
- Clear all strokes
- Remove stroke (future)
- Replace all strokes (on load)

---

### TransformState

**Purpose**: Current viewport transform state (alias of Transform)

```typescript
type TransformState = Transform
```

---

### SettingsState

**Purpose**: Current application settings (alias of DrawingSettings)

```typescript
type SettingsState = DrawingSettings
```

---

## File Format Models

### DrawingFile

**Purpose**: Serialized drawing data for save/load

**Definition**:
```typescript
interface DrawingFile {
  version: string              // File format version (e.g., "1.0")
  metadata: DrawingMetadata    // File metadata
  strokes: Stroke[]            // Drawing strokes
}
```

**Example**:
```json
{
  "version": "1.0",
  "metadata": {
    "created": "2025-11-06T12:00:00Z",
    "modified": "2025-11-06T12:30:00Z",
    "appVersion": "0.1.0"
  },
  "strokes": [ /* ... */ ]
}
```

**Validation**:
- `version`: Semantic version string
- `metadata`: Valid metadata object
- `strokes`: Array of valid strokes

---

### DrawingMetadata

**Purpose**: Metadata about a drawing file

**Definition**:
```typescript
interface DrawingMetadata {
  created: string      // ISO 8601 timestamp
  modified: string     // ISO 8601 timestamp
  appVersion?: string  // App version that created file
  author?: string      // Optional author name
  title?: string       // Optional drawing title
}
```

**Example**:
```typescript
const metadata: DrawingMetadata = {
  created: '2025-11-06T12:00:00.000Z',
  modified: '2025-11-06T12:30:00.000Z',
  appVersion: '0.1.0'
}
```

---

## Utility Types

### ViewportBounds

**Purpose**: Defines visible area in world coordinates

**Definition**:
```typescript
interface ViewportBounds {
  minX: number  // Left edge in world coordinates
  minY: number  // Top edge in world coordinates
  maxX: number  // Right edge in world coordinates
  maxY: number  // Bottom edge in world coordinates
}
```

**Usage**:
- Viewport culling (Phase 8)
- Visibility testing
- Bounds calculation

**Calculation**:
```typescript
function getViewportBounds(
  canvasWidth: number,
  canvasHeight: number,
  transform: Transform
): ViewportBounds {
  return {
    minX: -transform.x / transform.scale,
    minY: -transform.y / transform.scale,
    maxX: (canvasWidth - transform.x) / transform.scale,
    maxY: (canvasHeight - transform.y) / transform.scale
  }
}
```

---

### BoundingBox

**Purpose**: Axis-aligned bounding box for strokes

**Definition**:
```typescript
interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}
```

**Usage**:
- Stroke visibility testing
- Collision detection (future)
- Selection bounds (future)

**Calculation**:
```typescript
function getStrokeBoundingBox(stroke: Stroke): BoundingBox {
  const xs = stroke.points.map(p => p.x)
  const ys = stroke.points.map(p => p.y)
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  }
}
```

---

## Event Types

### PointerState

**Purpose**: Tracks pointer/mouse interaction state

**Definition**:
```typescript
interface PointerState {
  isDrawing: boolean        // Currently drawing
  isPanning: boolean        // Currently panning
  lastPosition: Point | null  // Last pointer position (screen)
  currentStroke: Point[]    // Points in current stroke (world)
}
```

**Usage**:
- Component local state
- Tracks drawing/panning mode
- Builds current stroke

---

### KeyboardShortcut

**Purpose**: Defines keyboard shortcut configuration

**Definition**:
```typescript
interface KeyboardShortcut {
  key: string           // Key code or character
  ctrl?: boolean        // Requires Ctrl/Cmd
  shift?: boolean       // Requires Shift
  alt?: boolean         // Requires Alt
  action: () => void    // Action to perform
  description: string   // User-facing description
}
```

**Example**:
```typescript
const shortcuts: KeyboardShortcut[] = [
  {
    key: 's',
    ctrl: true,
    action: () => saveDrawing(),
    description: 'Save drawing'
  },
  {
    key: 'z',
    ctrl: true,
    action: () => undo(),
    description: 'Undo last stroke'
  }
]
```

---

## Store Action Types

### DrawingStoreActions

**Purpose**: Actions available on drawing store

**Definition**:
```typescript
interface DrawingStoreActions {
  addStroke: (stroke: Stroke) => void
  removeStroke: (id: string) => void
  clear: () => void
  setStrokes: (strokes: Stroke[]) => void
}
```

---

### TransformStoreActions

**Purpose**: Actions available on transform store

**Definition**:
```typescript
interface TransformStoreActions {
  zoom: (delta: number, mouseX: number, mouseY: number) => void
  pan: (deltaX: number, deltaY: number) => void
  setTransform: (transform: Transform) => void
  reset: () => void
}
```

---

### SettingsStoreActions

**Purpose**: Actions available on settings store

**Definition**:
```typescript
interface SettingsStoreActions {
  setColor: (color: string) => void
  setWidth: (width: number) => void
  setSettings: (settings: DrawingSettings) => void
}
```

---

## Type Guards

### Type checking utilities

**Definition**:
```typescript
function isPoint(value: unknown): value is Point {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    isFinite(value.x) &&
    isFinite(value.y)
  )
}

function isStroke(value: unknown): value is Stroke {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'color' in value &&
    'width' in value &&
    'points' in value &&
    'timestamp' in value &&
    typeof value.id === 'string' &&
    typeof value.color === 'string' &&
    typeof value.width === 'number' &&
    Array.isArray(value.points) &&
    value.points.every(isPoint) &&
    typeof value.timestamp === 'number'
  )
}

function isTransform(value: unknown): value is Transform {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    'scale' in value &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    typeof value.scale === 'number' &&
    isFinite(value.x) &&
    isFinite(value.y) &&
    isFinite(value.scale) &&
    value.scale > 0
  )
}

function isDrawingFile(value: unknown): value is DrawingFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'metadata' in value &&
    'strokes' in value &&
    typeof value.version === 'string' &&
    Array.isArray(value.strokes) &&
    value.strokes.every(isStroke)
  )
}
```

---

## Constants & Enums

### Default Values

**Definition**:
```typescript
export const DEFAULT_TRANSFORM: Transform = {
  x: 0,
  y: 0,
  scale: 1.0
}

export const DEFAULT_SETTINGS: DrawingSettings = {
  color: '#000000',
  width: 2
}

export const DEFAULT_DRAWING_STATE: DrawingState = {
  strokes: []
}
```

---

### Constraints

**Definition**:
```typescript
export const ZOOM_MIN = 0.01   // Minimum zoom (1%)
export const ZOOM_MAX = 100    // Maximum zoom (10000%)
export const WIDTH_MIN = 1     // Minimum stroke width
export const WIDTH_MAX = 20    // Maximum stroke width

export const FILE_VERSION = '1.0'  // Current file format version
```

---

### Preset Colors

**Definition**:
```typescript
export const PRESET_COLORS = [
  '#000000',  // Black
  '#FFFFFF',  // White
  '#FF0000',  // Red
  '#00FF00',  // Green
  '#0000FF',  // Blue
  '#FFFF00',  // Yellow
  '#FF00FF',  // Magenta
  '#00FFFF',  // Cyan
  '#FF8800',  // Orange
  '#8800FF',  // Purple
] as const

export type PresetColor = typeof PRESET_COLORS[number]
```

---

## Type Exports

### Main export file (src/lib/types/index.d.ts)

```typescript
// Core models
export type { Point, Stroke, Transform }
export type { DrawingSettings, DrawingState, TransformState, SettingsState }

// File format
export type { DrawingFile, DrawingMetadata }

// Utilities
export type { ViewportBounds, BoundingBox }
export type { PointerState, KeyboardShortcut }

// Store actions
export type { DrawingStoreActions, TransformStoreActions, SettingsStoreActions }

// Type guards
export { isPoint, isStroke, isTransform, isDrawingFile }

// Constants
export {
  DEFAULT_TRANSFORM,
  DEFAULT_SETTINGS,
  DEFAULT_DRAWING_STATE,
  ZOOM_MIN,
  ZOOM_MAX,
  WIDTH_MIN,
  WIDTH_MAX,
  FILE_VERSION,
  PRESET_COLORS
}
export type { PresetColor }
```

---

## Migration & Versioning

### File Format Versioning

When file format changes:
1. Increment version number
2. Create migration function
3. Support reading old versions

**Example Migration**:
```typescript
function migrateDrawingFile(file: any): DrawingFile {
  switch (file.version) {
    case '1.0':
      return file as DrawingFile

    case '0.9': // Old version
      return {
        version: '1.0',
        metadata: {
          created: file.created || new Date().toISOString(),
          modified: new Date().toISOString()
        },
        strokes: file.data // Old format stored in 'data'
      }

    default:
      throw new Error(`Unsupported file version: ${file.version}`)
  }
}
```

---

## Type Usage Examples

### Creating a new stroke
```typescript
import { v4 as uuid } from 'uuid' // or custom ID generator

function createStroke(
  points: Point[],
  settings: DrawingSettings
): Stroke {
  return {
    id: uuid(),
    color: settings.color,
    width: settings.width,
    points: [...points], // Clone array
    timestamp: Date.now()
  }
}
```

### Coordinate conversion
```typescript
function screenToWorld(
  screenX: number,
  screenY: number,
  transform: Transform
): Point {
  return {
    x: (screenX - transform.x) / transform.scale,
    y: (screenY - transform.y) / transform.scale
  }
}

function worldToScreen(
  worldPoint: Point,
  transform: Transform
): Point {
  return {
    x: worldPoint.x * transform.scale + transform.x,
    y: worldPoint.y * transform.scale + transform.y
  }
}
```

### Serialization
```typescript
function serializeDrawing(state: DrawingState): string {
  const file: DrawingFile = {
    version: FILE_VERSION,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      appVersion: '0.1.0'
    },
    strokes: state.strokes
  }
  return JSON.stringify(file, null, 2)
}

function deserializeDrawing(json: string): DrawingState {
  const parsed = JSON.parse(json)

  if (!isDrawingFile(parsed)) {
    throw new Error('Invalid drawing file format')
  }

  return {
    strokes: parsed.strokes
  }
}
```

---

## Best Practices

### Type Safety
- Always use types, never `any`
- Use type guards for runtime validation
- Validate external data (files, user input)

### Immutability
- Never mutate points/strokes directly
- Clone arrays before modifying
- Use spread operator for updates

### Performance
- Keep types simple and flat
- Avoid deeply nested structures
- Use arrays for ordered data

### Validation
- Validate at boundaries (file load, user input)
- Use type guards consistently
- Provide helpful error messages

### Documentation
- Document complex types with JSDoc
- Include usage examples
- Note important constraints

---

## Testing Types

### Unit Tests
```typescript
import { describe, it, expect } from 'vitest'
import { isPoint, isStroke, isTransform } from '$lib/types'

describe('Type Guards', () => {
  it('validates points correctly', () => {
    expect(isPoint({ x: 0, y: 0 })).toBe(true)
    expect(isPoint({ x: 0 })).toBe(false)
    expect(isPoint(null)).toBe(false)
  })

  it('validates strokes correctly', () => {
    const validStroke = {
      id: 'test',
      color: '#000',
      width: 2,
      points: [{ x: 0, y: 0 }],
      timestamp: Date.now()
    }
    expect(isStroke(validStroke)).toBe(true)
  })
})
```

---

## Future Type Extensions

### Layers (Phase 11+)
```typescript
interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  strokes: string[]  // Stroke IDs
}
```

### Shapes (Phase 11+)
```typescript
type ShapeType = 'line' | 'rect' | 'circle' | 'text'

interface Shape {
  id: string
  type: ShapeType
  color: string
  width: number
  // Shape-specific properties
}
```

### Selection (Phase 11+)
```typescript
interface Selection {
  strokeIds: string[]
  bounds: BoundingBox
}
```
