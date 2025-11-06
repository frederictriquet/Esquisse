# Development Roadmap - Phased Approach

## Overview

This document outlines the progressive development phases for the drawing app. Each phase builds upon the previous one and results in a working, testable increment.

---

## Phase 0: Project Setup (Foundation)
**Goal**: Create working development environment
**Duration**: 1 hour
**Dependencies**: None

### Tasks
- [ ] Initialize SvelteKit project with TypeScript
- [ ] Configure Vite build settings
- [ ] Set up basic project structure (folders)
- [ ] Install essential dependencies
- [ ] Create initial routes (main page)
- [ ] Verify dev server runs

### Success Criteria
- `npm run dev` starts application
- Browser displays blank page with no errors
- Hot reload works

### Deliverables
- Working SvelteKit project
- `package.json` with dependencies
- Basic folder structure

---

## Phase 1: Basic Canvas Drawing
**Goal**: User can draw with mouse on canvas
**Duration**: 3-4 hours
**Dependencies**: Phase 0

### Features
- [ ] Canvas component renders on page
- [ ] Canvas fills viewport
- [ ] Left mouse button click and drag draws lines
- [ ] Lines are visible and smooth
- [ ] Release mouse stops drawing

### Technical Requirements
- HTML5 Canvas element
- Pointer event handlers (pointerdown, pointermove, pointerup)
- Basic stroke storage (array of points)
- Canvas rendering loop
- Simple line drawing (stroke path)

### Success Criteria
- User can draw continuous lines with mouse
- Drawing feels responsive (no lag)
- Lines render smoothly
- Multiple strokes can be drawn

### Deliverables
- `Canvas.svelte` component
- Basic drawing engine
- Stroke data structure
- Simple render function

---

## Phase 2: Transform System (Zoom & Pan)
**Goal**: User can zoom and pan the canvas
**Duration**: 4-5 hours
**Dependencies**: Phase 1

### Features
- [ ] Mouse wheel zooms in/out
- [ ] Zoom is centered on mouse cursor position
- [ ] Right-click + drag pans the canvas
- [ ] Drawing remains visible during transforms
- [ ] Zoom/pan feels smooth and natural

### Technical Requirements
- Transform matrix (x, y, scale)
- Mouse position to world coordinates conversion
- Canvas context transformation (`setTransform`)
- Wheel event handler with delta calculation
- Right-click drag event handlers
- Transform state management (Svelte store)

### Success Criteria
- Zoom in/out with mouse wheel works smoothly
- Zoom centers on mouse cursor position correctly
- Pan with right-click drag moves canvas
- Existing drawings transform correctly
- Can zoom from 0.01x to 100x (near-infinite)
- Drawing while zoomed/panned works correctly

### Deliverables
- `transformStore` with zoom/pan logic
- Transform coordinate conversion functions
- Mouse wheel zoom handler
- Right-click pan handler
- Updated render function with transforms

---

## Phase 3: Enhanced Drawing During Transforms
**Goal**: Drawing works correctly at any zoom/pan level
**Duration**: 2-3 hours
**Dependencies**: Phase 2

### Features
- [ ] Can draw while zoomed in/out
- [ ] Lines drawn at any zoom level render correctly
- [ ] Coordinate conversion is accurate
- [ ] No drift or offset issues

### Technical Requirements
- Screen-to-world coordinate conversion
- World-to-screen coordinate conversion
- Stroke points stored in world coordinates
- Rendering applies transform correctly

### Success Criteria
- Drawing at 0.1x scale works correctly
- Drawing at 10x scale works correctly
- Lines appear where mouse cursor is positioned
- Zooming after drawing doesn't distort lines

### Deliverables
- Coordinate conversion utilities
- Updated drawing logic with coordinate transforms
- Test cases for various zoom levels

---

## Phase 4: Drawing Controls & UI
**Goal**: User has basic controls for drawing
**Duration**: 3-4 hours
**Dependencies**: Phase 3

### Features
- [ ] Clear canvas button
- [ ] Color picker for stroke color
- [ ] Stroke width slider
- [ ] Visual feedback for current tool settings
- [ ] Basic toolbar layout

### Technical Requirements
- `Toolbar.svelte` component
- Drawing settings store (color, width)
- UI controls (button, input, slider)
- Apply settings to new strokes
- Reactive updates to stroke properties

### Success Criteria
- User can change stroke color
- User can change stroke width
- User can clear the canvas
- Current settings are visible
- New strokes use current settings

### Deliverables
- `Toolbar.svelte` component
- `drawingSettings` store
- Color and width controls
- Clear canvas functionality

---

## Phase 5: State Management & Stores
**Goal**: Centralized state management for drawing data
**Duration**: 2-3 hours
**Dependencies**: Phase 4

### Features
- [ ] All drawing state in Svelte stores
- [ ] All transform state in Svelte stores
- [ ] Reactive updates throughout app
- [ ] Clean separation of concerns

### Technical Requirements
- `drawingStore` for strokes
- `transformStore` for zoom/pan
- `settingsStore` for tool settings
- Store subscriptions in components
- Type definitions for all stores

### Success Criteria
- State changes trigger UI updates
- No prop drilling through components
- Store updates are efficient
- State is predictable and debuggable

### Deliverables
- `stores/drawing.ts`
- `stores/transform.ts`
- `stores/settings.ts`
- TypeScript interfaces for state
- Updated components using stores

---

## Phase 6: Multi-Window Synchronization
**Goal**: Presentation window syncs with user window
**Duration**: 4-5 hours
**Dependencies**: Phase 5

### Features
- [ ] Button to open presentation window
- [ ] Presentation window displays canvas only
- [ ] Drawing syncs in real-time
- [ ] Zoom/pan syncs in real-time
- [ ] Both windows stay synchronized

### Technical Requirements
- `/present` route for presentation view
- `BroadcastChannel` API for inter-window communication
- Send state updates on every change
- Receive and apply state updates
- Handle window closing gracefully

### Success Criteria
- Opening presentation window shows same drawing
- Drawing in user window appears in presentation
- Zoom/pan in user window reflects in presentation
- Less than 100ms sync delay
- Closing presentation window doesn't crash user window

### Deliverables
- `routes/present/+page.svelte`
- `PresentationView.svelte` component
- Enhanced stores with broadcast sync
- Window management utilities
- Sync debugging tools (optional)

---

## Phase 7: File Persistence (Save/Load)
**Goal**: User can save and load drawings
**Duration**: 3-4 hours
**Dependencies**: Phase 6

### Features
- [ ] Save drawing to JSON file
- [ ] Load drawing from JSON file
- [ ] File download in browser
- [ ] File upload in browser
- [ ] Preserve all drawing data

### Technical Requirements
- JSON serialization of strokes
- Browser file download API
- Browser file upload API
- File format versioning
- Data validation on load

### Success Criteria
- Save creates downloadable JSON file
- Load restores drawing exactly
- File format is human-readable
- Invalid files show error message
- No data loss on save/load cycle

### Deliverables
- `FileIO.ts` module
- Save/load functions
- File format specification
- UI buttons for save/load
- Error handling

---

## Phase 8: Polish & Optimization
**Goal**: Smooth, production-ready experience
**Duration**: 3-4 hours
**Dependencies**: Phase 7

### Features
- [ ] Optimize rendering performance
- [ ] Add viewport culling (only render visible strokes)
- [ ] Smooth line rendering (interpolation)
- [ ] Better visual feedback
- [ ] Keyboard shortcuts
- [ ] Help/instructions overlay

### Technical Requirements
- Viewport bounds calculation
- Stroke visibility testing
- RequestAnimationFrame optimization
- Line smoothing algorithm
- Keyboard event handlers
- Instruction modal component

### Success Criteria
- 60fps rendering at all zoom levels
- Handles 1000+ strokes without lag
- Lines look smooth, not jagged
- Keyboard shortcuts work
- User can find help/instructions

### Deliverables
- Performance optimizations
- Viewport culling logic
- Line smoothing implementation
- Keyboard shortcut handlers
- Help modal component

---

## Phase 9: Desktop Packaging (Tauri)
**Goal**: Native desktop application
**Duration**: 2-3 hours
**Dependencies**: Phase 8

### Features
- [ ] Desktop app runs natively
- [ ] Native file dialogs for save/load
- [ ] Application icon and metadata
- [ ] Build scripts for all platforms
- [ ] Small binary size (<10MB)

### Technical Requirements
- Tauri configuration
- Native file dialog integration
- App icon and metadata
- Build configuration for platforms
- Conditional code for desktop vs web

### Success Criteria
- Desktop app launches from executable
- Native save/load dialogs work
- App size under 10MB
- Can build for Windows, macOS, Linux
- Web version still works

### Deliverables
- `src-tauri/` configuration
- Native file dialog integration
- Build scripts
- App icons
- Platform-specific builds

---

## Phase 10: Testing & Documentation
**Goal**: Stable, documented application
**Duration**: 2-3 hours
**Dependencies**: Phase 9

### Features
- [ ] Basic automated tests
- [ ] User documentation
- [ ] Developer documentation
- [ ] Known issues documented
- [ ] Future enhancements listed

### Technical Requirements
- Vitest configuration
- Unit tests for core logic
- Integration tests for key flows
- README with usage instructions
- Architecture documentation

### Success Criteria
- Core functions have tests
- Tests pass consistently
- Documentation is clear and accurate
- New developers can understand codebase
- Users can learn how to use app

### Deliverables
- Test suite
- `README.md`
- `ARCHITECTURE.md`
- `USER_GUIDE.md`
- `CONTRIBUTING.md` (optional)

---

## Total Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Project Setup | 1h | 1h |
| Phase 1: Basic Drawing | 4h | 5h |
| Phase 2: Transform System | 5h | 10h |
| Phase 3: Enhanced Drawing | 3h | 13h |
| Phase 4: Controls & UI | 4h | 17h |
| Phase 5: State Management | 3h | 20h |
| Phase 6: Multi-Window Sync | 5h | 25h |
| Phase 7: File Persistence | 4h | 29h |
| Phase 8: Polish & Optimization | 4h | 33h |
| Phase 9: Desktop Packaging | 3h | 36h |
| Phase 10: Testing & Docs | 3h | 39h |

**Total**: ~39 hours (~5 working days)

---

## Priority Levels

### Must Have (MVP)
- Phases 0-7: Core functionality
- Minimum viable product with all key features

### Should Have
- Phase 8: Polish & Optimization
- Important for good user experience

### Nice to Have
- Phase 9: Desktop Packaging
- Can be web-only initially

### Future Enhancements
- Phase 10+: Additional features
- Undo/redo, layers, shapes, etc.

---

## Risk Mitigation

### Risk: Multi-window sync complexity
**Mitigation**: Phase 6 is self-contained; can test thoroughly before moving on

### Risk: Performance at high zoom levels
**Mitigation**: Phase 8 specifically addresses optimization; can profile and fix

### Risk: Tauri integration issues
**Mitigation**: Phase 9 is last; web version works without it

### Risk: Coordinate math errors
**Mitigation**: Phase 3 dedicated to this; test extensively at various scales

---

## Testing Strategy Per Phase

Each phase should include:
1. Manual testing of new features
2. Verification that previous features still work
3. Edge case testing (extreme zoom, many strokes, etc.)
4. Cross-browser testing (where applicable)

---

## Definition of Done (Per Phase)

A phase is complete when:
- [ ] All features work as specified
- [ ] No console errors or warnings
- [ ] Code is commented and readable
- [ ] Previous phases still work
- [ ] Committed to version control
- [ ] Can demo to stakeholder

---

## Notes

- Each phase builds incrementally
- Can pause after any phase with working app
- Phases 1-7 deliver complete MVP
- Phases 8-10 add polish and packaging
- Flexibility to adjust based on learning
