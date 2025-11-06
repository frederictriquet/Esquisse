# Technical Architecture

## Technology Stack

### Frontend
- **Framework**: SvelteKit
- **Language**: TypeScript
- **Build Tool**: Vite (bundled with SvelteKit)
- **Rendering**: HTML5 Canvas API

### Desktop (Phase 9)
- **Packaging**: Tauri
- **Backend Runtime**: Rust (minimal, for file I/O)

### State Management
- **Primary**: Svelte Stores (built-in)
- **Inter-Window**: BroadcastChannel API

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript compiler
- **Testing**: Vitest (Phase 10)
- **Version Control**: Git

---

## Architecture Patterns

### Component Architecture
```
┌─────────────────────────────────────┐
│          App.svelte                 │
│  (Root Layout / Shell)              │
└─────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────────┐      ┌──────▼──────┐
│ User View  │      │ Presentation│
│ (Main)     │      │ View        │
│            │      │ (Minimal)   │
└────────────┘      └─────────────┘
    │                      │
    ├──────────┬───────────┼───────────┐
    │          │           │           │
┌───▼───┐  ┌──▼──┐    ┌───▼────┐  ┌───▼───┐
│Canvas │  │Tool │    │Canvas  │  │       │
│       │  │bar  │    │(sync'd)│  │       │
└───────┘  └─────┘    └────────┘  └───────┘
```

### Data Flow Architecture
```
User Interaction
      ↓
Event Handlers (Component)
      ↓
Store Actions
      ↓
Store State Update
      ↓
BroadcastChannel → Other Windows
      ↓
Reactive Subscriptions ($store)
      ↓
Component Re-render
      ↓
Canvas Render
```

### Coordinate System Architecture
```
Screen Space (pixels)
      ↓
  [Transform]
      ↓
World Space (infinite canvas)
      ↓
  [Storage]
      ↓
Stroke Points (world coordinates)
```

---

## Core Systems

### 1. Drawing System

**Responsibilities**:
- Capture mouse/pointer input
- Convert screen coordinates to world coordinates
- Generate stroke data
- Store strokes in drawing store

**Components**:
- `Canvas.svelte`: Main canvas component
- `DrawingEngine.ts`: Core drawing logic
- Pointer event handlers

**Data Flow**:
1. User clicks/drags mouse
2. Pointer events fired
3. Screen coordinates captured
4. Transformed to world coordinates
5. Points added to current stroke
6. Stroke added to store
7. Render triggered

---

### 2. Transform System

**Responsibilities**:
- Manage viewport position (x, y)
- Manage zoom scale
- Convert between coordinate spaces
- Apply transformations to canvas

**Components**:
- `transformStore.ts`: Transform state and logic
- `CoordinateUtils.ts`: Conversion functions
- Zoom/pan event handlers

**Key Algorithms**:

**Zoom (mouse-centered)**:
```typescript
// Convert mouse position to world coordinates
worldX = (mouseX - transform.x) / transform.scale
worldY = (mouseY - transform.y) / transform.scale

// Apply zoom
newScale = oldScale * (1 + zoomDelta)

// Reposition to keep world point under mouse
newX = mouseX - worldX * newScale
newY = mouseY - worldY * newScale
```

**Pan**:
```typescript
// Simple translation
newX = transform.x + deltaX
newY = transform.y + deltaY
```

---

### 3. Rendering System

**Responsibilities**:
- Clear and redraw canvas
- Apply transformations
- Render all visible strokes
- Optimize performance

**Components**:
- Render loop in `Canvas.svelte`
- Stroke rendering functions
- Viewport culling (Phase 8)

**Render Algorithm**:
```typescript
function render(ctx, strokes, transform) {
  // 1. Clear canvas
  ctx.clearRect(0, 0, width, height)

  // 2. Apply transform
  ctx.setTransform(
    transform.scale, 0, 0,
    transform.scale,
    transform.x, transform.y
  )

  // 3. Render each stroke
  for (const stroke of strokes) {
    ctx.strokeStyle = stroke.color
    // Width is in world coordinates, canvas transform handles scaling
    ctx.lineWidth = stroke.width
    ctx.beginPath()
    for (const point of stroke.points) {
      ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()
  }
}
```

**Stroke Width Behavior**:
- When creating a stroke, width is stored in world coordinates: `width = DEFAULT_WIDTH / transform.scale`
- New strokes always appear 2px thick when drawn
- Stored width zooms naturally with the canvas transform
- Strokes drawn at different zoom levels will have different apparent thicknesses
- Example: Draw at 100% zoom (stores width=2), zoom to 200% (appears 4px), draw new stroke (stores width=1, appears 2px)

---

### 4. State Management System

**Responsibilities**:
- Centralize application state
- Provide reactive updates
- Synchronize between windows
- Persist state

**Stores**:

**drawingStore**:
```typescript
{
  strokes: Stroke[]  // All drawing strokes
}
```

**transformStore**:
```typescript
{
  x: number     // Pan X
  y: number     // Pan Y
  scale: number // Zoom level
}
```

**settingsStore**:
```typescript
{
  color: string    // Current stroke color
  width: number    // Current stroke width
}
```

**Store Pattern**:
```typescript
function createStore() {
  const { subscribe, set, update } = writable(initialState)

  const channel = new BroadcastChannel('store-name')

  channel.onmessage = (e) => {
    set(e.data) // Sync from other windows
  }

  return {
    subscribe,
    customAction: (args) => {
      update(state => {
        const newState = /* update logic */
        channel.postMessage(newState) // Sync to other windows
        return newState
      })
    }
  }
}
```

---

### 5. Multi-Window Synchronization System

**Responsibilities**:
- Broadcast state changes
- Receive state changes
- Maintain consistency
- Handle window lifecycle

**Implementation**:
- Use `BroadcastChannel` API
- One channel per store
- Send on every state change
- Receive and apply updates

**Channels**:
- `drawing-sync`: Stroke data
- `transform-sync`: Zoom/pan state
- `settings-sync`: Tool settings (optional)

**Lifecycle**:
```typescript
// Window opens
const channel = new BroadcastChannel('drawing-sync')

// Send updates
channel.postMessage(newState)

// Receive updates
channel.onmessage = (e) => applyUpdate(e.data)

// Window closes
channel.close()
```

---

### 6. File I/O System

**Responsibilities**:
- Serialize drawing data
- Deserialize drawing data
- Trigger browser downloads
- Handle file uploads

**File Format** (JSON):
```json
{
  "version": "1.0",
  "metadata": {
    "created": "2025-11-06T12:00:00Z",
    "modified": "2025-11-06T12:30:00Z"
  },
  "strokes": [
    {
      "id": "uuid",
      "color": "#000000",
      "width": 2,
      "points": [
        { "x": 100, "y": 200 },
        { "x": 101, "y": 201 }
      ]
    }
  ]
}
```

**Operations**:
- **Save**: `strokes → JSON → Blob → Download`
- **Load**: `File → Text → JSON → Validate → Set Store`

---

## Performance Considerations

### Rendering Performance
- Use `requestAnimationFrame` for smooth rendering
- Implement viewport culling (Phase 8)
- Only render visible strokes
- Batch canvas operations
- Avoid unnecessary redraws

### Memory Management
- Store only necessary data
- No memory leaks from event listeners
- Clean up BroadcastChannels on unmount
- Limit stroke history (optional)

### State Update Optimization
- Debounce/throttle high-frequency updates
- Use efficient data structures
- Minimize store updates
- Batch related changes

---

## Error Handling Strategy

### User-Facing Errors
- File load failures → Show error message
- Invalid file format → Explain issue
- Browser compatibility → Warn user

### Developer Errors
- TypeScript for type safety
- Console warnings for issues
- Graceful degradation
- Fallbacks for missing features

---

## Browser Compatibility

### Target Browsers
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

### Required APIs
- ✅ Canvas API (universal support)
- ✅ Pointer Events (universal support)
- ⚠️ BroadcastChannel (polyfill for Safari < 15.4)
- ✅ File API (universal support)

### Fallbacks
- BroadcastChannel → `localStorage` + polling
- Pointer Events → Mouse Events (if needed)

---

## Security Considerations

### Web Version
- No sensitive data stored
- Client-side only (no backend)
- Safe file handling (JSON only)
- No XSS vectors (Svelte auto-escapes)

### Desktop Version (Tauri)
- Sandboxed by default
- File system access limited
- No arbitrary code execution

---

## Deployment Strategy

### Web Version
- **Build**: `npm run build` → static files
- **Deploy**: Any static host (Vercel, Netlify, GitHub Pages)
- **URL**: `https://drawing-app.example.com`

### Desktop Version
- **Build**: `npm run tauri build`
- **Artifacts**: Platform-specific installers
  - Windows: `.exe`, `.msi`
  - macOS: `.dmg`, `.app`
  - Linux: `.AppImage`, `.deb`
- **Distribution**: Direct download or app stores

---

## Testing Strategy

### Unit Tests
- Coordinate conversion functions
- Store logic
- File serialization/deserialization

### Integration Tests
- Drawing flow (click → stroke → render)
- Zoom/pan behavior
- Multi-window sync
- Save/load cycle

### Manual Testing
- Cross-browser testing
- Performance testing
- User experience testing
- Edge cases (extreme zoom, many strokes)

---

## Scalability Considerations

### Current Scope (Simple Sketches)
- Handles 1000-5000 strokes easily
- No optimization needed initially

### Future (Complex Drawings)
- Viewport culling required
- Spatial indexing (quadtree)
- Stroke simplification
- Level-of-detail rendering
- Incremental saving

---

## Extension Points

### Future Features
- **Undo/Redo**: Command pattern with history stack
- **Layers**: Group strokes by layer ID
- **Shapes**: Different stroke types (line, rect, circle)
- **Text**: Text rendering on canvas
- **Image Import**: Load and display images
- **Export**: PNG/SVG export
- **Collaboration**: WebSocket + CRDT

### Plugin Architecture (Future)
- Tool plugins
- Export format plugins
- Effect plugins

---

## Dependencies

### Production
```json
{
  "@sveltejs/kit": "^2.x",
  "svelte": "^4.x"
}
```

### Development
```json
{
  "typescript": "^5.x",
  "vite": "^5.x",
  "vitest": "^1.x"
}
```

### Optional (Phase 9)
```json
{
  "@tauri-apps/cli": "^1.x",
  "@tauri-apps/api": "^1.x"
}
```

---

## File Organization Principles

### By Feature
- Group related files together
- Co-locate components, logic, types
- Clear module boundaries

### By Layer
- Components (UI)
- Stores (State)
- Engine (Logic)
- Utils (Helpers)
- Types (Interfaces)

### Naming Conventions
- Components: `PascalCase.svelte`
- Stores: `camelCase.ts`
- Types: `PascalCase.d.ts`
- Utils: `camelCase.ts`
- Constants: `UPPER_CASE.ts`

---

## Development Workflow

### Local Development
```bash
npm run dev          # Start dev server
npm run check        # Type check
npm run build        # Production build
npm run preview      # Preview build
```

### Desktop Development (Phase 9)
```bash
npm run tauri dev    # Dev mode with Tauri
npm run tauri build  # Build desktop app
```

---

## Monitoring & Debugging

### Development Tools
- Browser DevTools for web debugging
- Svelte DevTools for component inspection
- Redux DevTools for store debugging (optional)
- Performance profiling tools

### Production Monitoring
- Console logging (development only)
- Error boundary for crashes
- Performance metrics (FPS, render time)

---

## Documentation Standards

### Code Comments
- Explain "why", not "what"
- Document complex algorithms
- Note performance considerations
- Mark TODOs clearly

### Type Documentation
- JSDoc for public APIs
- Type definitions for all interfaces
- Example usage in comments

### Architecture Decisions
- Document major decisions
- Explain trade-offs
- Reference this document
