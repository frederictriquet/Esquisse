# Drawing App - Project Specification

## Project Overview

A lightweight drawing application with infinite zoom/pan capabilities and dual-window presentation mode.

## Target Platforms

- **Web Application**: Browser-based, accessible via URL
- **Desktop Application**: Native app for Windows, macOS, Linux (via Tauri)

## Core Requirements

### 1. Drawing Features
- Draw freehand with mouse left-click
- Simple sketch-style drawings
- Smooth line rendering
- Basic stroke properties (color, width)

### 2. Navigation & Viewport
- **Zoom**: Mouse wheel controls zoom level
- **Zoom Center**: Zoom centered on current mouse position
- **Zoom Range**: Near-infinite zoom in/out capability
- **Pan**: Right mouse button + drag for scrolling
- **Scroll**: Both horizontal and vertical panning

### 3. Multi-Window Mode
- **User Window**:
  - Full canvas view
  - Visible controls and toolbar
  - All interaction capabilities

- **Presentation Window**:
  - Canvas-only view (no UI controls)
  - Synchronized zoom level with user window
  - Synchronized pan position with user window
  - Synchronized drawing content
  - Designed for big screen display

### 4. Persistence
- Save drawings to file
- Load drawings from file
- File format: JSON (simple, debuggable)

## User Experience Goals

- **Lightweight**: Fast startup, minimal resource usage
- **Responsive**: Smooth interaction at 60fps
- **Intuitive**: Common interaction patterns (mouse wheel, drag, etc.)
- **Reliable**: State synchronization between windows never drifts

## Technical Constraints

- Must work in modern browsers (Chrome, Firefox, Safari, Edge)
- Desktop version should be small (<10MB)
- No network dependency for core functionality
- Support both web and desktop with minimal code duplication

## Success Criteria

- User can draw and navigate smoothly without lag
- Zoom/pan feels natural and precise
- Presentation window stays perfectly synchronized
- Drawings can be saved and restored without data loss
- Application loads in under 2 seconds

## Out of Scope (V1)

- Multi-user collaboration
- Advanced drawing tools (shapes, text, layers)
- Undo/redo functionality
- Image import/export (PNG, SVG)
- Touch screen support
- Mobile app
- Cloud storage/sync
