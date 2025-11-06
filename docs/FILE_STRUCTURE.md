# File Structure & Scaffold Plan

## Complete Project Structure

```
drawing-app/
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── svelte.config.js
├── README.md
│
├── docs/                           # Documentation (this folder)
│   ├── PROJECT_SPEC.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── COMPONENT_SPECIFICATIONS.md
│   ├── DATA_MODELS.md
│   └── FILE_STRUCTURE.md (this file)
│
├── src/
│   ├── app.html                    # HTML template
│   ├── app.css                     # Global styles
│   │
│   ├── lib/
│   │   ├── components/             # Svelte components
│   │   │   ├── Canvas.svelte       # Phase 1: Main drawing canvas
│   │   │   ├── Toolbar.svelte      # Phase 4: Control toolbar
│   │   │   ├── ColorPicker.svelte  # Phase 4: Color selection
│   │   │   ├── WidthSlider.svelte  # Phase 4: Width selection
│   │   │   ├── PresentationView.svelte  # Phase 6: Presentation display
│   │   │   └── HelpModal.svelte    # Phase 8: Help overlay
│   │   │
│   │   ├── stores/                 # State management
│   │   │   ├── drawing.ts          # Phase 5: Drawing state store
│   │   │   ├── transform.ts        # Phase 2: Transform state store
│   │   │   └── settings.ts         # Phase 4: Tool settings store
│   │   │
│   │   ├── engine/                 # Core drawing logic
│   │   │   ├── DrawingEngine.ts    # Phase 1: Drawing mechanics
│   │   │   ├── ZoomPan.ts          # Phase 2: Transform logic
│   │   │   ├── CoordinateUtils.ts  # Phase 3: Coordinate conversion
│   │   │   ├── Renderer.ts         # Phase 1: Canvas rendering
│   │   │   └── FileIO.ts           # Phase 7: Save/load logic
│   │   │
│   │   ├── utils/                  # Helper functions
│   │   │   ├── window.ts           # Phase 6: Window management
│   │   │   ├── keyboard.ts         # Phase 8: Keyboard shortcuts
│   │   │   └── debug.ts            # Development utilities
│   │   │
│   │   └── types/                  # TypeScript definitions
│   │       ├── drawing.d.ts        # Drawing-related types
│   │       ├── transform.d.ts      # Transform types
│   │       ├── settings.d.ts       # Settings types
│   │       └── index.d.ts          # Type exports
│   │
│   └── routes/
│       ├── +layout.svelte          # Root layout
│       ├── +page.svelte            # User window (main)
│       └── present/
│           └── +page.svelte        # Presentation window
│
├── static/                         # Static assets
│   ├── favicon.png
│   └── assets/
│       └── icons/
│
├── src-tauri/                      # Phase 9: Tauri desktop config
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── icons/
│   └── src/
│       └── main.rs
│
└── tests/                          # Phase 10: Test files
    ├── unit/
    │   ├── coordinate-utils.test.ts
    │   ├── drawing-store.test.ts
    │   └── file-io.test.ts
    └── integration/
        ├── drawing-flow.test.ts
        └── multi-window-sync.test.ts
```

---

## File Creation Order by Phase

### Phase 0: Project Setup

**Order**:
1. Initialize SvelteKit project (via CLI)
2. Configure TypeScript
3. Create base folder structure
4. Install dependencies

**Files**:
```
✓ package.json (generated)
✓ tsconfig.json (generated)
✓ svelte.config.js (generated)
✓ vite.config.ts (generated)
+ src/app.html (modify)
+ src/app.css (create)
+ src/lib/ (create folder structure)
+ src/routes/+page.svelte (modify)
```

---

### Phase 1: Basic Canvas Drawing

**Order**:
1. Create type definitions
2. Create Canvas component
3. Create basic drawing engine
4. Create renderer
5. Wire up main page

**New Files**:
```
+ src/lib/types/drawing.d.ts
+ src/lib/types/index.d.ts
+ src/lib/components/Canvas.svelte
+ src/lib/engine/DrawingEngine.ts
+ src/lib/engine/Renderer.ts
```

**Modified Files**:
```
~ src/routes/+page.svelte
~ src/app.css
```

---

### Phase 2: Transform System

**Order**:
1. Create transform types
2. Create transform store
3. Create zoom/pan logic
4. Add event handlers to Canvas
5. Update renderer with transforms

**New Files**:
```
+ src/lib/types/transform.d.ts
+ src/lib/stores/transform.ts
+ src/lib/engine/ZoomPan.ts
```

**Modified Files**:
```
~ src/lib/components/Canvas.svelte
~ src/lib/engine/Renderer.ts
```

---

### Phase 3: Enhanced Drawing

**Order**:
1. Create coordinate utilities
2. Integrate with drawing engine
3. Update Canvas component
4. Test coordinate conversions

**New Files**:
```
+ src/lib/engine/CoordinateUtils.ts
```

**Modified Files**:
```
~ src/lib/components/Canvas.svelte
~ src/lib/engine/DrawingEngine.ts
```

---

### Phase 4: Controls & UI

**Order**:
1. Create settings types and store
2. Create Toolbar component
3. Create ColorPicker component
4. Create WidthSlider component
5. Wire up to main page

**New Files**:
```
+ src/lib/types/settings.d.ts
+ src/lib/stores/settings.ts
+ src/lib/components/Toolbar.svelte
+ src/lib/components/ColorPicker.svelte
+ src/lib/components/WidthSlider.svelte
```

**Modified Files**:
```
~ src/routes/+page.svelte
~ src/app.css
```

---

### Phase 5: State Management

**Order**:
1. Create drawing store
2. Refactor existing stores
3. Update all components to use stores
4. Remove prop drilling

**New Files**:
```
+ src/lib/stores/drawing.ts
```

**Modified Files**:
```
~ src/lib/stores/transform.ts
~ src/lib/stores/settings.ts
~ src/lib/components/Canvas.svelte
~ src/lib/components/Toolbar.svelte
~ All other components
```

---

### Phase 6: Multi-Window Sync

**Order**:
1. Enhance stores with BroadcastChannel
2. Create window utilities
3. Create PresentationView component
4. Create presentation route
5. Add presentation button

**New Files**:
```
+ src/lib/utils/window.ts
+ src/lib/components/PresentationView.svelte
+ src/routes/present/+page.svelte
```

**Modified Files**:
```
~ src/lib/stores/drawing.ts
~ src/lib/stores/transform.ts
~ src/lib/stores/settings.ts
~ src/lib/components/Toolbar.svelte
```

---

### Phase 7: File Persistence

**Order**:
1. Define file format
2. Create FileIO module
3. Add save/load functions
4. Add UI buttons
5. Handle file errors

**New Files**:
```
+ src/lib/engine/FileIO.ts
```

**Modified Files**:
```
~ src/lib/components/Toolbar.svelte
```

---

### Phase 8: Polish & Optimization

**Order**:
1. Add viewport culling
2. Implement line smoothing
3. Create help modal
4. Add keyboard shortcuts
5. Optimize rendering

**New Files**:
```
+ src/lib/components/HelpModal.svelte
+ src/lib/utils/keyboard.ts
+ src/lib/utils/debug.ts
```

**Modified Files**:
```
~ src/lib/engine/Renderer.ts
~ src/lib/components/Canvas.svelte
~ src/routes/+page.svelte
```

---

### Phase 9: Desktop Packaging

**Order**:
1. Initialize Tauri
2. Configure Tauri settings
3. Add native file dialogs
4. Create desktop icons
5. Configure builds

**New Files**:
```
+ src-tauri/
  + Cargo.toml
  + tauri.conf.json
  + build.rs
  + src/main.rs
  + icons/*
```

**Modified Files**:
```
~ src/lib/engine/FileIO.ts (add Tauri support)
~ package.json (add Tauri scripts)
```

---

### Phase 10: Testing & Docs

**Order**:
1. Set up Vitest
2. Write unit tests
3. Write integration tests
4. Create documentation
5. Polish README

**New Files**:
```
+ tests/unit/coordinate-utils.test.ts
+ tests/unit/drawing-store.test.ts
+ tests/unit/file-io.test.ts
+ tests/integration/drawing-flow.test.ts
+ tests/integration/multi-window-sync.test.ts
+ README.md (enhance)
```

---

## Detailed File Descriptions

### Core Type Definitions

#### src/lib/types/drawing.d.ts
```typescript
export interface Point {
  x: number
  y: number
}

export interface Stroke {
  id: string
  color: string
  width: number
  points: Point[]
  timestamp: number
}

export interface DrawingState {
  strokes: Stroke[]
}
```

#### src/lib/types/transform.d.ts
```typescript
export interface Transform {
  x: number      // Pan X offset
  y: number      // Pan Y offset
  scale: number  // Zoom scale
}

export interface ViewportBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}
```

#### src/lib/types/settings.d.ts
```typescript
export interface DrawingSettings {
  color: string
  width: number
}

export interface AppSettings extends DrawingSettings {
  showGrid?: boolean
  snapToGrid?: boolean
  gridSize?: number
}
```

---

### Configuration Files

#### package.json (Initial)
```json
{
  "name": "drawing-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-check --tsconfig ./tsconfig.json --watch"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "svelte": "^4.0.0",
    "svelte-check": "^3.0.0",
    "tslib": "^2.6.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

#### tsconfig.json
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

#### svelte.config.js
```javascript
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    })
  }
}
```

#### .gitignore
```
.DS_Store
node_modules
/build
/.svelte-kit
/package
.env
.env.*
!.env.example
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

# Tauri
/src-tauri/target
```

---

## File Size Estimates

| File | Lines | Size | Complexity |
|------|-------|------|------------|
| Canvas.svelte | 200-300 | ~8KB | High |
| Toolbar.svelte | 50-100 | ~3KB | Low |
| ColorPicker.svelte | 40-60 | ~2KB | Low |
| WidthSlider.svelte | 40-60 | ~2KB | Low |
| PresentationView.svelte | 30-50 | ~2KB | Low |
| DrawingEngine.ts | 100-150 | ~5KB | Medium |
| ZoomPan.ts | 80-120 | ~4KB | High |
| CoordinateUtils.ts | 60-80 | ~3KB | Medium |
| Renderer.ts | 100-150 | ~5KB | Medium |
| FileIO.ts | 80-120 | ~4KB | Medium |
| drawing.ts (store) | 100-150 | ~5KB | Medium |
| transform.ts (store) | 100-150 | ~5KB | High |
| settings.ts (store) | 40-60 | ~2KB | Low |

**Total Estimated Code**: ~3000-4000 lines, ~50-60KB

---

## Development Guidelines per File

### Component Files (.svelte)
- Keep under 300 lines if possible
- Extract complex logic to separate modules
- Use stores for all shared state
- Add comments for complex interactions
- Include TypeScript types for props

### Store Files (.ts)
- Export typed store interfaces
- Include BroadcastChannel sync
- Add action methods (don't expose update directly)
- Document side effects
- Handle cleanup

### Engine Files (.ts)
- Pure functions where possible
- Clear input/output types
- Performance-critical sections noted
- Unit test candidates
- Avoid side effects

### Type Files (.d.ts)
- Comprehensive type coverage
- JSDoc comments for complex types
- Export all types
- Group related types
- Version interfaces if needed

---

## Import Patterns

### Standard Import Order
```typescript
// 1. Svelte/Kit imports
import { onMount } from 'svelte'
import { browser } from '$app/environment'

// 2. Third-party imports
import someLibrary from 'some-library'

// 3. Local components
import Canvas from '$lib/components/Canvas.svelte'

// 4. Local stores
import { drawingStore } from '$lib/stores'

// 5. Local utilities
import { screenToWorld } from '$lib/engine/CoordinateUtils'

// 6. Local types
import type { Point, Stroke } from '$lib/types'
```

### Alias Configuration
- `$lib/*` → `src/lib/*` (SvelteKit default)
- `$types/*` → `src/lib/types/*` (optional)
- `$stores/*` → `src/lib/stores/*` (optional)

---

## File Naming Conventions

### Components
- `PascalCase.svelte` (e.g., `Canvas.svelte`)
- Descriptive, noun-based names
- One component per file

### Modules
- `camelCase.ts` (e.g., `drawingEngine.ts`)
- Verb or noun based on purpose
- Group related functions

### Types
- `camelCase.d.ts` (e.g., `drawing.d.ts`)
- Singular noun for primary type
- Group related type definitions

### Stores
- `camelCase.ts` (e.g., `drawing.ts`)
- Noun representing the state
- Export as `stateNameStore`

---

## Maintenance Notes

### Adding New Features
1. Update types first
2. Create/modify store if needed
3. Implement logic in engine
4. Create/update component
5. Update documentation

### Refactoring Checklist
- [ ] TypeScript types updated
- [ ] Store interfaces unchanged (or migrated)
- [ ] Tests updated
- [ ] Documentation updated
- [ ] No console errors
- [ ] Previous features still work

---

## Build Output

### Web Build (`npm run build`)
```
build/
├── _app/
│   ├── immutable/
│   │   ├── chunks/
│   │   ├── assets/
│   │   └── nodes/
│   └── version.json
├── index.html
├── present.html
└── favicon.png
```

### Desktop Build (`npm run tauri build`)
```
src-tauri/target/release/
├── bundle/
│   ├── dmg/ (macOS)
│   ├── deb/ (Linux)
│   ├── appimage/ (Linux)
│   └── msi/ (Windows)
└── drawing-app[.exe]
```

**Size Expectations**:
- Web bundle: ~100-200KB (gzipped)
- Desktop app: 3-10MB per platform
