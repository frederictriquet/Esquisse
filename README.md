# Drawing App - Project Documentation

A lightweight drawing application with infinite zoom/pan and dual-window presentation mode.

## 📚 Documentation Index

This project includes comprehensive documentation to guide development from start to finish. Read the documents in this order:

### 1. [PROJECT_SPEC.md](PROJECT_SPEC.md)
**Start here** - Defines what we're building

- Core requirements and features
- Target platforms (web + desktop)
- User experience goals
- Success criteria
- What's in scope and out of scope

### 2. [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)
**Your build guide** - How to build it progressively

- 10 development phases from setup to deployment
- Detailed task breakdown per phase
- Time estimates (5 working days total)
- Success criteria for each phase
- Definition of done checklist

### 3. [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
**System design** - How it works internally

- Technology stack (SvelteKit + Canvas + Tauri)
- Architecture patterns and data flow
- Core systems (drawing, transform, rendering)
- Performance considerations
- Browser compatibility

### 4. [COMPONENT_SPECIFICATIONS.md](COMPONENT_SPECIFICATIONS.md)
**Component details** - What each part does

- All Svelte components with props/events
- Component hierarchy and relationships
- Implementation examples
- Testing guidelines
- Future components

### 5. [FILE_STRUCTURE.md](FILE_STRUCTURE.md)
**Code organization** - Where everything goes

- Complete project file tree
- File creation order by phase
- Naming conventions
- Import patterns
- Configuration files

### 6. [DATA_MODELS.md](DATA_MODELS.md)
**Type system** - Data structures and types

- TypeScript interfaces (Point, Stroke, Transform)
- State models (Drawing, Transform, Settings)
- File format specification
- Type guards and validation
- Constants and defaults

---

## 🚀 Quick Start

### For Developers Ready to Code:

1. **Read** [PROJECT_SPEC.md](PROJECT_SPEC.md) (5 min) - Understand the goal
2. **Skim** [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) (10 min) - See the phases
3. **Reference** other docs as needed during development

### For Planning/Architecture Review:

1. Read all documents in order
2. Estimated reading time: 60-90 minutes
3. Provides complete understanding of the system

---

## 📋 Development Phases Overview

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| 0 | Project Setup | 1h | ✅ Complete |
| 1 | Basic Drawing | 4h | ✅ Complete |
| 2 | Transform System | 5h | ✅ Complete |
| 3 | Enhanced Drawing | 3h | ✅ Complete (with Phase 2) |
| 4 | Controls & UI | 4h | ✅ Complete |
| 5 | State Management | 3h | ✅ Complete |
| 6 | Multi-Window Sync | 5h | ✅ Complete |
| 7 | File Persistence | 4h | 🔄 Next Phase |
| 8 | Polish | 4h | ⏳ Pending |
| 9 | Desktop | 3h | ⏳ Pending |
| 10 | Testing & Docs | 3h | ⏳ Pending |

**Progress: 25/39 hours completed (~64%)**

---

## 🛠️ Tech Stack Summary

### Core Technologies
- **Framework**: SvelteKit
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas API
- **Build Tool**: Vite
- **Desktop**: Tauri (optional, Phase 9)

### Current Features (Phases 0-6)
- ✅ **Infinite canvas** with zoom/pan
- ✅ **Mouse-centered zooming** (mouse wheel)
- ✅ **Right-click panning**
- ✅ **Drawing with mouse** at any zoom level
- ✅ **World coordinate storage** for natural zoom behavior
- ✅ **Color picker** for stroke color
- ✅ **Width slider** (1-20px)
- ✅ **Visual preview** of current settings
- ✅ **Clear canvas** button
- ✅ **Reset view** button
- ✅ **Centralized state management** (Svelte stores)
- ✅ **Multi-window presentation mode** (BroadcastChannel)
- ✅ **Real-time synchronization** across windows

### Planned Features (Phases 7-10)
- ⏳ Save/load drawings (JSON)
- ⏳ Performance optimizations
- ⏳ Desktop packaging (Tauri)
- ⏳ Lightweight (3-10MB desktop app)

---

## 📦 Project Structure Preview

```
drawing-app/
├── docs/                    # This documentation
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte UI components
│   │   ├── stores/          # State management
│   │   ├── engine/          # Drawing logic
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript definitions
│   └── routes/
│       ├── +page.svelte     # User window
│       └── present/         # Presentation window
├── src-tauri/               # Desktop packaging (Phase 9)
└── tests/                   # Test files (Phase 10)
```

---

## 🎯 Key Design Decisions

### Why SvelteKit?
- Leverages your existing Svelte knowledge
- No runtime overhead (compiles to vanilla JS)
- Built-in state management (stores)
- Works for both web and desktop

### Why Canvas API?
- Perfect for freehand drawing
- Hardware-accelerated rendering
- Built-in transformation support
- No heavy library dependencies

### Why Tauri?
- Tiny desktop apps (3-5MB vs Electron's 150MB)
- Uses system webview (not bundled Chromium)
- Rust backend for performance
- Same codebase for web and desktop

### Why BroadcastChannel?
- Native browser API for inter-window communication
- Fast synchronization (<100ms latency)
- No server or WebSocket needed
- Works offline

---

## 🔑 Critical Implementation Notes

### Coordinate Systems
- **Screen coordinates**: Canvas pixels (top-left origin)
- **World coordinates**: Infinite drawing space
- All strokes stored in world coordinates
- Conversion happens at render time

### Transform Math
- Zoom centers on mouse cursor position
- Pan offset in screen pixels
- Scale factor (1.0 = 100%)
- Formula: `screen = world * scale + offset`

### State Synchronization
- User window is source of truth
- Presentation window receives updates
- BroadcastChannel for real-time sync
- Updates sent on every state change

### File Format
- JSON for human readability
- Versioned for future compatibility
- Includes metadata (created, modified)
- Only stores strokes (world coordinates)

---

## 📖 How to Use This Documentation

### During Phase 0 (Setup):
- Follow [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) Phase 0
- Reference [FILE_STRUCTURE.md](FILE_STRUCTURE.md) for initial setup

### During Phase 1-3 (Core Drawing):
- Use [COMPONENT_SPECIFICATIONS.md](COMPONENT_SPECIFICATIONS.md) for Canvas component
- Reference [DATA_MODELS.md](DATA_MODELS.md) for types
- Check [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) for algorithms

### During Phase 4-5 (UI & State):
- Follow [COMPONENT_SPECIFICATIONS.md](COMPONENT_SPECIFICATIONS.md) for Toolbar
- Use [DATA_MODELS.md](DATA_MODELS.md) for store types
- Reference [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) for store patterns

### During Phase 6 (Multi-Window):
- Check [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) for sync architecture
- Use [COMPONENT_SPECIFICATIONS.md](COMPONENT_SPECIFICATIONS.md) for PresentationView
- Reference [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) for implementation order

### During Phase 7 (Files):
- Use [DATA_MODELS.md](DATA_MODELS.md) for file format
- Reference [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) for serialization

### During Phase 8-10 (Polish & Deploy):
- Follow [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) optimization tasks
- Reference [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) for performance tips

---

## 🧪 Testing Strategy

### Phase-by-Phase Testing
- Manual testing after each phase
- Verify previous features still work
- Test edge cases (extreme zoom, many strokes)
- Cross-browser testing (Chrome, Firefox, Safari)

### Automated Testing (Phase 10)
- Unit tests for coordinate conversions
- Unit tests for store logic
- Integration tests for drawing flow
- Integration tests for multi-window sync

---

## 🚧 Development Workflow

```bash
# Phase 0: Initialize
npm create svelte@latest drawing-app
cd drawing-app
npm install

# Daily development
npm run dev          # Start dev server
npm run check        # Type check

# Phase 9: Desktop
npm install @tauri-apps/cli @tauri-apps/api
npm run tauri dev    # Dev with desktop

# Deployment
npm run build        # Web build
npm run tauri build  # Desktop build
```

---

## 📝 Document Maintenance

### When to Update Docs:

**During Development**:
- Update if implementation differs significantly
- Add notes about challenges or solutions
- Document workarounds or deviations

**After Phase Completion**:
- Mark completed features
- Add lessons learned
- Update time estimates if needed

**Before Final Release**:
- Verify all specs match implementation
- Update file structure if changed
- Add actual performance metrics

---

## 🤝 Contributing

### For New Developers:
1. Read [PROJECT_SPEC.md](PROJECT_SPEC.md)
2. Review [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
3. Check current phase in [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)
4. Read relevant component specs
5. Start coding!

### Code Standards:
- TypeScript strict mode
- Svelte component conventions
- Documented complex logic
- Type safety everywhere

---

## 📌 Important Reminders

### Development Principles:
- ✅ Build incrementally (one phase at a time)
- ✅ Test after each phase
- ✅ Keep it simple (avoid over-engineering)
- ✅ Prioritize working software over perfect code

### Common Pitfalls to Avoid:
- ❌ Mixing screen and world coordinates
- ❌ Mutating store state directly
- ❌ Forgetting to clean up event listeners
- ❌ Skipping phases or combining too many at once

### Success Indicators:
- ✅ User can draw smoothly without lag
- ✅ Zoom/pan feels natural
- ✅ Presentation window stays synchronized
- ✅ Drawings save and load correctly
- ✅ App loads quickly

---

## 📧 Questions?

If documentation is unclear or missing information:
1. Note the specific section
2. Document your question
3. Update docs after finding answer

Good documentation evolves with the project!

---

## 🎉 Ready to Build?

1. Start with Phase 0 in [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)
2. Keep this README open for quick reference
3. Dive into detailed docs as needed
4. Build amazing things!

---

## ✅ Completed Phases

Detailed completion documentation available:
- [PHASE_0_COMPLETE.md](PHASE_0_COMPLETE.md) - Project setup
- [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md) - Basic drawing
- [PHASE_2_COMPLETE.md](PHASE_2_COMPLETE.md) - Transform system (zoom & pan)
- [PHASE_3_COMPLETE.md](PHASE_3_COMPLETE.md) - Enhanced drawing (completed with Phase 2)
- [PHASE_4_COMPLETE.md](PHASE_4_COMPLETE.md) - Drawing controls & UI (toolbar)
- [PHASE_5_COMPLETE.md](PHASE_5_COMPLETE.md) - State management & stores
- [PHASE_6_COMPLETE.md](PHASE_6_COMPLETE.md) - Multi-window synchronization

---

**Last Updated**: 2025-11-06
**Status**: Phases 0-6 Complete (64% done)
**Next Step**: Phase 7 - File Persistence (Save/Load)
