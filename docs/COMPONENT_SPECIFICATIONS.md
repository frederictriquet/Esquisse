# Component Specifications

## Overview

This document details all components in the drawing application, their responsibilities, props, events, and implementation notes.

---

## Component Hierarchy

```
App (Layout)
├── User Window (/)
│   ├── Canvas
│   └── Toolbar
│       ├── ColorPicker
│       ├── WidthSlider
│       ├── ClearButton
│       ├── SaveButton
│       ├── LoadButton
│       └── PresentButton
└── Presentation Window (/present)
    └── PresentationView
        └── Canvas (shared)
```

---

## Core Components

### 1. Canvas.svelte

**Purpose**: Main drawing surface with zoom/pan/draw capabilities

**Phase**: 1, 2, 3

**Props**:
```typescript
interface Props {
  showCursor?: boolean  // Show custom cursor (default: true)
  interactive?: boolean // Enable interactions (default: true)
  class?: string       // Additional CSS classes
}
```

**State** (from stores):
```typescript
$drawingStore    // Strokes to render
$transformStore  // Current zoom/pan
$settingsStore   // Current tool settings
```

**Events**:
- Pointer down/move/up for drawing
- Wheel for zooming
- Context menu (right-click) for panning

**Key Responsibilities**:
- Render canvas element
- Handle all mouse/pointer interactions
- Convert screen coords to world coords
- Trigger drawing actions
- Apply and render transforms
- Maintain canvas size (resize handling)

**Implementation Notes**:
```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { drawingStore, transformStore, settingsStore } from '$lib/stores'

  export let showCursor = true
  export let interactive = true

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let isDrawing = false
  let isPanning = false
  let currentStroke: Point[] = []

  onMount(() => {
    ctx = canvas.getContext('2d')!
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  })

  // Reactive rendering
  $: render(ctx, $drawingStore, $transformStore)
</script>

<canvas
  bind:this={canvas}
  on:pointerdown={handlePointerDown}
  on:pointermove={handlePointerMove}
  on:pointerup={handlePointerUp}
  on:wheel={handleWheel}
  on:contextmenu|preventDefault
  class:cursor-crosshair={showCursor && interactive}
/>
```

**Testing**:
- Drawing creates strokes
- Zoom centers on mouse
- Pan moves canvas
- Coordinates convert correctly

---

### 2. Toolbar.svelte

**Purpose**: Drawing tool controls and actions

**Phase**: 4

**Props**:
```typescript
interface Props {
  position?: 'top' | 'left' | 'right' // Toolbar position
  class?: string
}
```

**State** (from stores):
```typescript
$settingsStore  // Current tool settings
```

**Events**:
- None (uses store actions)

**Key Responsibilities**:
- Display current tool settings
- Provide controls for changing settings
- Trigger actions (clear, save, load, present)
- Visual feedback for current state

**Implementation Notes**:
```svelte
<script lang="ts">
  import { settingsStore, drawingStore } from '$lib/stores'
  import ColorPicker from './ColorPicker.svelte'
  import WidthSlider from './WidthSlider.svelte'
  import { openPresentationWindow, saveDrawing, loadDrawing } from '$lib/utils'

  export let position = 'top'

  function handleClear() {
    if (confirm('Clear canvas?')) {
      drawingStore.clear()
    }
  }
</script>

<div class="toolbar toolbar-{position}">
  <ColorPicker />
  <WidthSlider />
  <button on:click={handleClear}>Clear</button>
  <button on:click={saveDrawing}>Save</button>
  <button on:click={loadDrawing}>Load</button>
  <button on:click={openPresentationWindow}>Present</button>
</div>
```

**Testing**:
- Controls update settings store
- Actions trigger correctly
- Visual state reflects settings

---

### 3. ColorPicker.svelte

**Purpose**: Select stroke color

**Phase**: 4

**Props**:
```typescript
interface Props {
  label?: string
}
```

**State**:
```typescript
$settingsStore.color
```

**Events**:
- Updates settings store on change

**Implementation Notes**:
```svelte
<script lang="ts">
  import { settingsStore } from '$lib/stores'

  export let label = 'Color'

  const presetColors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'
  ]
</script>

<div class="color-picker">
  <label>{label}</label>
  <input
    type="color"
    bind:value={$settingsStore.color}
  />
  <div class="presets">
    {#each presetColors as color}
      <button
        class="preset"
        style="background-color: {color}"
        on:click={() => settingsStore.setColor(color)}
      />
    {/each}
  </div>
</div>
```

---

### 4. WidthSlider.svelte

**Purpose**: Select stroke width

**Phase**: 4

**Props**:
```typescript
interface Props {
  label?: string
  min?: number   // Default: 1
  max?: number   // Default: 20
}
```

**State**:
```typescript
$settingsStore.width
```

**Implementation Notes**:
```svelte
<script lang="ts">
  import { settingsStore } from '$lib/stores'

  export let label = 'Width'
  export let min = 1
  export let max = 20
</script>

<div class="width-slider">
  <label>{label}: {$settingsStore.width}px</label>
  <input
    type="range"
    min={min}
    max={max}
    bind:value={$settingsStore.width}
  />
  <div class="preview">
    <div
      class="preview-stroke"
      style="height: {$settingsStore.width}px; background: {$settingsStore.color}"
    />
  </div>
</div>
```

---

### 5. PresentationView.svelte

**Purpose**: Simplified canvas view for presentation window

**Phase**: 6

**Props**:
```typescript
interface Props {
  // No props - reads from synced stores
}
```

**State**:
```typescript
$drawingStore    // Synced via BroadcastChannel
$transformStore  // Synced via BroadcastChannel
```

**Key Responsibilities**:
- Display canvas only (no controls)
- Receive and apply state updates
- Maintain sync with user window
- Full-screen friendly layout

**Implementation Notes**:
```svelte
<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte'
  import { drawingStore, transformStore } from '$lib/stores'

  // State is automatically synced via BroadcastChannel in stores
</script>

<div class="presentation-view">
  <Canvas showCursor={false} />
</div>

<style>
  .presentation-view {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: white;
  }
</style>
```

**Testing**:
- Updates reflect user window changes
- No lag > 100ms
- No UI controls visible

---

## Utility Components

### 6. HelpModal.svelte

**Purpose**: Display keyboard shortcuts and instructions

**Phase**: 8 (optional)

**Props**:
```typescript
interface Props {
  open: boolean
  onClose: () => void
}
```

**Implementation Notes**:
```svelte
<script lang="ts">
  export let open = false
  export let onClose: () => void

  const shortcuts = [
    { key: 'Left Click + Drag', action: 'Draw' },
    { key: 'Right Click + Drag', action: 'Pan' },
    { key: 'Mouse Wheel', action: 'Zoom' },
    { key: 'Ctrl+S', action: 'Save' },
    { key: 'Ctrl+O', action: 'Load' }
  ]
</script>

{#if open}
  <div class="modal-overlay" on:click={onClose}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>Help</h2>
      <table>
        {#each shortcuts as { key, action }}
          <tr>
            <td><kbd>{key}</kbd></td>
            <td>{action}</td>
          </tr>
        {/each}
      </table>
      <button on:click={onClose}>Close</button>
    </div>
  </div>
{/if}
```

---

## Page Components (Routes)

### 7. +page.svelte (User Window)

**Path**: `/`

**Purpose**: Main application view with canvas and controls

**Phase**: 1+

**Layout**:
```svelte
<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte'
  import Toolbar from '$lib/components/Toolbar.svelte'
  import HelpModal from '$lib/components/HelpModal.svelte'

  let showHelp = false
</script>

<div class="app-container">
  <Toolbar />
  <main class="canvas-container">
    <Canvas />
  </main>
  <HelpModal bind:open={showHelp} />
</div>

<style>
  .app-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .canvas-container {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
</style>
```

---

### 8. +page.svelte (Presentation Window)

**Path**: `/present`

**Purpose**: Presentation-only view

**Phase**: 6

**Layout**:
```svelte
<script lang="ts">
  import PresentationView from '$lib/components/PresentationView.svelte'
</script>

<PresentationView />

<svelte:head>
  <title>Drawing Presentation</title>
</svelte:head>
```

---

## Component Guidelines

### State Management
- **Use stores**: Never pass drawing/transform state as props
- **Local state**: Only for component-specific UI state
- **Reactive**: Use `$store` syntax for automatic updates

### Event Handling
- **Pointer events**: Prefer over mouse events
- **Prevent defaults**: For context menu, wheel events
- **Stop propagation**: When needed to prevent bubbling

### Styling
- **Scoped styles**: Use Svelte's scoped CSS
- **Responsive**: Handle window resizing
- **Themeable**: Use CSS variables for colors

### Performance
- **Avoid unnecessary rerenders**: Use reactive statements wisely
- **Debounce**: High-frequency events (resize, scroll)
- **RequestAnimationFrame**: For canvas rendering

### Accessibility
- **Keyboard support**: Shortcuts for common actions
- **ARIA labels**: For icon-only buttons
- **Focus management**: Logical tab order
- **Screen reader**: Announce important actions

### Testing
- **Unit tests**: For isolated logic
- **Component tests**: For user interactions
- **Integration tests**: For multi-component flows
- **Visual tests**: For rendering correctness

---

## Component Checklist

Before marking a component complete:

- [ ] TypeScript types defined
- [ ] Props documented with comments
- [ ] Events documented
- [ ] Responsive to window resize
- [ ] Works with store updates
- [ ] No console errors/warnings
- [ ] Styled appropriately
- [ ] Accessible (keyboard, ARIA)
- [ ] Tested (unit or manual)
- [ ] Committed to version control

---

## Future Components

### Phase 10+ (Not Immediate)

**LayerPanel.svelte**:
- Manage drawing layers
- Layer visibility toggle
- Layer reordering

**ShapeToolbar.svelte**:
- Rectangle, circle, line tools
- Shape-specific settings

**TextTool.svelte**:
- Text input on canvas
- Font selection
- Text properties

**ExportDialog.svelte**:
- Export format selection
- Export settings
- Preview

**UndoRedoControls.svelte**:
- Undo/redo buttons
- History panel
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
