# Keyboard Shortcuts Configuration

All keyboard shortcuts are centralized in [`src/lib/config/shortcuts.ts`](../src/lib/config/shortcuts.ts) for easy customization.

## Quick Reference

### File Operations
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save drawing |
| `Cmd/Ctrl + O` | Load drawing |

### History
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Y` | Redo |
| `Cmd/Ctrl + Shift + Z` | Redo (Photoshop style) |

### Canvas Operations
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + C` | Clear all strokes |

### Navigation
| Shortcut | Action |
|----------|--------|
| `Space` (hold) | Pan mode - drag to move view |
| `R` | Reset view (zoom & pan) |
| `Cmd/Ctrl + +` | Zoom in |
| `Cmd/Ctrl + -` | Zoom out |
| `Cmd/Ctrl + 0` | Reset zoom to 100% |

### UI
| Shortcut | Action |
|----------|--------|
| `H` or `?` | Show help dialog |
| `T` | Toggle performance test |

## Customization

To change keyboard shortcuts, edit [`src/lib/config/shortcuts.ts`](../src/lib/config/shortcuts.ts):

### Example 1: Change Undo from Cmd+Z to Cmd+U

```typescript
undo: {
    key: 'u',  // Changed from 'z' to 'u'
    ctrl: true,
    description: 'Undo last action'
}
```

### Example 2: Change Pan Mode from Space to Alt

```typescript
panMode: {
    key: 'Alt',  // Changed from 'Space' to 'Alt'
    description: 'Pan mode (hold + drag to pan)'
}
```

### Example 3: Add Modifier to Reset View

```typescript
resetView: {
    key: 'r',
    ctrl: true,  // Add this line to require Ctrl/Cmd
    description: 'Reset view (zoom & pan)'
}
```

### Example 4: Add Alternative Shortcuts

You can define multiple shortcuts for the same action:

```typescript
redo: [
    {
        key: 'y',
        ctrl: true,
        description: 'Redo last undone action'
    },
    {
        key: 'z',
        ctrl: true,
        shift: true,
        description: 'Redo last undone action (Photoshop style)'
    },
    // Add a third alternative:
    {
        key: 'r',
        ctrl: true,
        description: 'Redo (alternative)'
    }
]
```

## Shortcut Configuration Interface

```typescript
export interface ShortcutConfig {
    key: string;        // The key to press (e.g., 'z', 'Space', 'F1')
    ctrl?: boolean;     // Require Ctrl (Windows/Linux) or Cmd (macOS)
    shift?: boolean;    // Require Shift key
    alt?: boolean;      // Require Alt/Option key
    description: string; // Human-readable description
}
```

## Special Keys

For special keys, use their proper names:
- `'Space'` - Space bar
- `'F1'`, `'F2'`, etc. - Function keys
- `'Escape'` - Escape key
- `'Enter'` - Enter/Return key
- `'+'`, `'-'`, `'='` - Symbols
- `'['`, `']'` - Brackets

## Utility Functions

The shortcuts config provides helper functions:

### `matchesShortcut(event, shortcut, isMac)`
Check if a keyboard event matches a shortcut configuration.

```typescript
if (matchesShortcut(event, SHORTCUTS.undo, isMac)) {
    // Handle undo
}
```

### `isPanModeKey(event)`
Check if the pan mode key is pressed.

```typescript
if (isPanModeKey(event)) {
    // Activate pan mode
}
```

### `formatShortcut(shortcut, isMac)`
Format a shortcut for display.

```typescript
formatShortcut(SHORTCUTS.undo, true)  // Returns "⌘+Z" on Mac
formatShortcut(SHORTCUTS.undo, false) // Returns "Ctrl+Z" on Windows/Linux
```

### `getAllShortcuts()`
Get all shortcuts as a flat list for documentation.

```typescript
const allShortcuts = getAllShortcuts();
// Returns: [{ name: 'save', shortcuts: [...] }, ...]
```

## Platform Differences

- **macOS**: Uses `⌘ (Command/Cmd)` key for `ctrl: true`
- **Windows/Linux**: Uses `Ctrl` key for `ctrl: true`

The code automatically detects the platform and uses the appropriate modifier key.

## After Making Changes

1. Edit [`src/lib/config/shortcuts.ts`](../src/lib/config/shortcuts.ts)
2. Rebuild the app: `npm run build`
3. Test your changes: `npm run dev`

No need to modify any other files - the shortcuts config is used throughout the application.

## Tips for Tablet Users

### XP-Pen Button Mapping

If you want to use your XP-Pen buttons for app shortcuts, the easiest approach is:

1. **Don't configure tablet buttons** to send keyboard shortcuts
2. **Use UI buttons** in the toolbar instead (click with stylus):
   - ↺ Undo
   - ↻ Redo
   - 🔍+ Zoom In
   - 🔍− Zoom Out
   - 🎯 Reset View

This works reliably in both web and Tauri versions!

### Recommended Workflow

- **Left hand**: Keyboard for Space (pan), Cmd+Z/Y (optional)
- **Right hand**: Stylus on tablet for drawing
- **Alternative**: Click toolbar buttons with stylus (no keyboard needed)

## Browser Conflicts

Some shortcuts may conflict with browser shortcuts (e.g., `Cmd+Y` opens history in Firefox). In these cases:

- **Web version**: Use alternative shortcuts or UI buttons
- **Tauri version**: No browser conflicts, all shortcuts work

## Contributing

When adding new features that need keyboard shortcuts:

1. Add the shortcut to `SHORTCUTS` in [`shortcuts.ts`](../src/lib/config/shortcuts.ts)
2. Use `matchesShortcut()` to check for the shortcut
3. Update this documentation
4. Update the Help modal if appropriate

## See Also

- [Main README](../README.md)
- [Pressure Sensitivity Guide](./PRESSURE_SENSITIVITY.md)
- [Advanced Features](./ADVANCED_FEATURES.md)
