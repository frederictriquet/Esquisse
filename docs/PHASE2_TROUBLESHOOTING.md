# Phase 2 Troubleshooting Guide

## Issue: Zooming Not Working

### Problem Description

After initial implementation of Phase 2, the zoom functionality was not working when scrolling the mouse wheel. The page loaded without errors, but scrolling had no visible effect on the canvas.

### Root Causes

There were **three critical issues** that prevented zooming from working:

#### 1. Files Not Actually Created (Critical)

**Problem**: The AI agent reported creating the transform store and coordinate utilities, but the files were never actually written to disk.

**Symptom**: Import errors or undefined references, though TypeScript might not catch this immediately.

**Evidence**:
```bash
$ ls -la src/lib/stores/
total 8
drwxrwxr-x 2 ftriquet ftriquet 4096 nov. 6 16:51 .
drwxrwxr-x 7 ftriquet ftriquet 4096 nov. 6 16:51 ..
# Empty! No transform.ts file
```

**Solution**: Manually created the missing files:
- `src/lib/stores/transform.ts`
- `src/lib/utils/coordinates.ts`

**Lesson**: Always verify file creation with `ls` or `find` commands after the agent reports creating files.

---

#### 2. Svelte Reactivity Not Tracking Transform Changes (Critical)

**Problem**: The reactive statement wasn't properly tracking changes to the transform store properties.

**Original Code** (BROKEN):
```typescript
// Subscribe to transform changes to trigger re-render
$: if (ctx && $transform) {
    renderCanvas();
}
```

**Why It Failed**:
- Svelte's reactivity system tracks which properties are accessed
- Simply checking `$transform` as a whole object doesn't create proper reactive dependencies
- When `transform.x`, `transform.y`, or `transform.scale` changed, Svelte didn't know to re-run the statement
- The reactive statement never fired after the initial render

**Fixed Code**:
```typescript
// Subscribe to transform changes to trigger re-render
// Need to reference specific properties to make reactivity work
$: if (ctx) {
    // Access transform properties to make reactive
    void $transform.x;
    void $transform.y;
    void $transform.scale;
    renderCanvas();
}
```

**Why It Works**:
- Explicitly accessing each property (`$transform.x`, `$transform.y`, `$transform.scale`) tells Svelte to track them
- The `void` operator prevents the values from being used (we just need them accessed for reactivity)
- Now when any of these properties change, Svelte knows to re-run the entire block
- `renderCanvas()` gets called every time the transform updates

**Alternative Solutions**:
```typescript
// Option 1: Destructure (also works)
$: if (ctx) {
    const { x, y, scale } = $transform;
    renderCanvas();
}

// Option 2: Use in expression (also works)
$: if (ctx && ($transform.x !== undefined || true)) {
    renderCanvas();
}

// Option 3: Call directly with params (most explicit)
$: if (ctx) {
    renderCanvas($transform.x, $transform.y, $transform.scale);
}
```

**Documentation Reference**: [Svelte Reactivity Gotchas](https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive)

---

#### 3. WheelEvent Type Casting Issue (Minor)

**Problem**: Using awkward type casting for WheelEvent to reuse PointerEvent function.

**Original Code** (AWKWARD):
```typescript
function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const screenPoint = getPointerPosition(event as unknown as PointerEvent);
    // ...
}
```

**Issue**:
- Type casting `as unknown as PointerEvent` is unsafe
- WheelEvent and PointerEvent have different properties
- Could cause runtime errors if PointerEvent-specific properties were accessed
- Makes code harder to understand

**Fixed Code**:
```typescript
/**
 * Get mouse position from any mouse-like event
 */
function getMousePosition(event: MouseEvent | WheelEvent): Point {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const screenPoint = getMousePosition(event);
    transform.zoom(-event.deltaY, screenPoint.x, screenPoint.y);
}
```

**Why It Works**:
- Created a dedicated helper function that accepts both MouseEvent and WheelEvent
- Both types have `clientX` and `clientY` properties
- No type casting needed - proper type union
- More maintainable and type-safe

---

## Debugging Process

### Step 1: Verify Files Exist
```bash
ls -la src/lib/stores/
ls -la src/lib/utils/
```

**Result**: Files were missing → Created them manually

### Step 2: Check TypeScript Compilation
```bash
npm run check
```

**Result**: ✅ 0 errors after creating files

### Step 3: Add Debug Logging
```typescript
function handleWheel(event: WheelEvent) {
    console.log('Wheel event:', {
        deltaY: event.deltaY,
        screenPoint,
        currentScale: $transform.scale
    });

    transform.zoom(-event.deltaY, screenPoint.x, screenPoint.y);

    console.log('After zoom:', $transform);
}
```

**Expected**: Should see console logs when scrolling
**Actual**: Logs appeared, transform updated, but no visual change
**Conclusion**: Rendering wasn't triggered by transform changes

### Step 4: Investigate Reactive Statement
```typescript
// Added explicit property access
$: if (ctx) {
    void $transform.x;
    void $transform.y;
    void $transform.scale;
    renderCanvas();
}
```

**Result**: ✅ Zooming started working!

### Step 5: Remove Debug Logging
```typescript
// Cleaned up console.log statements
function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const screenPoint = getMousePosition(event);
    transform.zoom(-event.deltaY, screenPoint.x, screenPoint.y);
}
```

---

## Common Svelte Reactivity Pitfalls

### Problem: Object/Array Not Tracked

**Broken**:
```typescript
$: if ($store) {  // Doesn't track properties!
    doSomething();
}
```

**Fixed**:
```typescript
$: if ($store.property) {  // Tracks specific property
    doSomething();
}
```

### Problem: Derived Value Not Recalculated

**Broken**:
```typescript
const derived = $store.x + $store.y;  // Calculated once
$: if (derived > 10) { /* ... */ }    // Never updates!
```

**Fixed**:
```typescript
$: derived = $store.x + $store.y;  // Recalculated on change
$: if (derived > 10) { /* ... */ }
```

### Problem: Side Effects in Wrong Place

**Broken**:
```typescript
function updateStore() {
    store.set(newValue);
    renderCanvas();  // Might run before store updates propagate!
}
```

**Fixed**:
```typescript
function updateStore() {
    store.set(newValue);
}

$: if ($store) {
    renderCanvas();  // Runs after store updates
}
```

---

## Testing Checklist for Transform System

After implementing zoom/pan, verify:

- [ ] **Files exist**: Check `src/lib/stores/transform.ts` and `src/lib/utils/coordinates.ts`
- [ ] **TypeScript compiles**: Run `npm run check`
- [ ] **Wheel event fires**: Add temporary console.log in `handleWheel()`
- [ ] **Transform updates**: Log `$transform` after zoom/pan
- [ ] **Render triggers**: Add log in `renderCanvas()` to see if called
- [ ] **Visual change**: Actually see zoom/pan effect on screen
- [ ] **Drawing works**: Can draw at different zoom levels
- [ ] **Pan works**: Right-click drag moves canvas
- [ ] **No errors**: Check browser console for errors

---

## Key Takeaways

1. **Always verify file creation**: Agents can report success without actually writing files
2. **Svelte reactivity requires property access**: Can't just check object existence
3. **Use proper TypeScript types**: Avoid `as unknown as` casting when possible
4. **Add debug logging strategically**: Helps identify where the data flow breaks
5. **Test incrementally**: Verify each step (files → compilation → events → updates → rendering)

---

## Prevention for Future Phases

### Code Review Checklist

When implementing new features:

1. **Verify all files created**: Run `find src -name "*.ts" -o -name "*.svelte" | sort`
2. **Check reactive statements**: Ensure proper property access in `$:` blocks
3. **Test immediately**: Don't stack multiple changes without testing
4. **Add temporary logging**: Remove after feature works
5. **Verify TypeScript**: Run `npm run check` frequently

### Reactive Statement Best Practices

```typescript
// ✅ Good - Explicit property access
$: if (ctx) {
    void $transform.x;
    void $transform.y;
    void $transform.scale;
    renderCanvas();
}

// ✅ Good - Destructuring
$: if (ctx) {
    const { x, y, scale } = $transform;
    renderCanvas();
}

// ✅ Good - Use in expression
$: if (ctx && $transform.scale > 0) {
    renderCanvas();
}

// ❌ Bad - Object check only
$: if (ctx && $transform) {
    renderCanvas();
}

// ❌ Bad - No property access
$: if (ctx && Object.keys($transform).length) {
    renderCanvas();
}
```

---

## Related Issues

### Issue: Pan Not Smooth
**Symptom**: Panning feels jumpy
**Cause**: Not updating `lastPanPoint` after each move
**Solution**: Update `lastPanPoint = screenPoint` in `handlePointerMove`

### Issue: Drawing Offset When Zoomed
**Symptom**: Drawing appears away from cursor at high zoom
**Cause**: Storing screen coordinates instead of world coordinates
**Solution**: Use `screenToWorld()` before storing points

### Issue: Strokes Disappear After Zoom
**Symptom**: Existing strokes vanish when zooming
**Cause**: Not applying transform matrix in `renderCanvas()`
**Solution**: Use `ctx.setTransform()` before drawing

---

## Performance Considerations

### Current Implementation
- Transform updates trigger full canvas re-render
- Acceptable for small/medium drawings (< 1000 strokes)
- Reactivity overhead is minimal

### Future Optimizations (if needed)
- Debounce zoom updates: `transform.zoom(delta, x, y)` → debounced version
- Viewport culling: Only render visible strokes
- Canvas layering: Separate layer for static content
- RequestAnimationFrame: Batch multiple updates

---

## Stroke Width Behavior Evolution

### Issue: Understanding User Requirements for Stroke Thickness

After the transform system was working, there was confusion about how stroke width should behave with zoom.

#### Iteration 1: Constant Visual Thickness (Not What User Wanted)
**Initial Implementation**: All strokes maintained constant 2px visual thickness regardless of zoom.
```typescript
ctx.lineWidth = stroke.width / $transform.scale;
```

**Problem**: User wanted strokes to zoom with the canvas, not maintain constant thickness.

#### Iteration 2: Clarifying Requirements
**User Request**: "I want to draw strokes that appear 2px on the screen, regardless of zoom level. But when I zoom, everything that was previously on screen must zoom too."

**Key Insight**:
- New strokes being drawn should appear 2px thick
- After drawing, strokes should zoom naturally with the canvas
- Drawing at different zoom levels creates strokes with different "real" thicknesses
- This mimics drawing on paper at different detail levels

#### Final Implementation: Natural Zoom Behavior

**Solution**: Store stroke width in world coordinates, let canvas transform handle scaling.

**When Creating Stroke** (in `handlePointerDown`):
```typescript
currentStroke = {
    id: crypto.randomUUID(),
    color: DEFAULT_COLOR,
    width: DEFAULT_WIDTH / $transform.scale,  // Convert to world coords
    points: [worldPoint],
    timestamp: Date.now()
};
```

**When Drawing Stroke** (in `drawStroke`):
```typescript
ctx.lineWidth = stroke.width;  // Use directly, canvas transform handles scaling
```

**Result**:
- At 100% zoom (scale=1): Store width=2, canvas renders at 2px
- At 200% zoom (scale=2): Store width=1, canvas renders at 1×2=2px (appears 2px while drawing)
- When zoom back to 100%: Stroke with width=1 renders at 1px (thinner than strokes drawn at 100%)

### Behavior Example

1. **Draw at 100% zoom**: Line appears 2px → stores width=2
2. **Zoom in to 200%**: Line now appears 4px (2 × scale of 2)
3. **Draw new line at 200%**: New line appears 2px → stores width=1
4. **Zoom back to 100%**:
   - First line: 2px (width=2 × scale=1)
   - Second line: 1px (width=1 × scale=1)

This creates natural "detail levels" where zooming in allows drawing finer details that become thin when zoomed out.

---

## Conclusion

The zoom functionality issue was caused by a combination of:
1. Missing implementation files
2. Improper Svelte reactivity tracking
3. Suboptimal TypeScript type handling
4. **NEW**: Clarifying stroke width behavior - strokes zoom naturally, not constant thickness

All issues have been resolved, and the transform system now works correctly. The key learnings are:
- Svelte's reactivity requires explicit property access to create proper reactive dependencies
- Stroke width in world coordinates creates natural zoom behavior where drawing at different scales produces different final thicknesses

**Status**: ✅ Resolved
**Zoom**: ✅ Working
**Pan**: ✅ Working
**Drawing**: ✅ Working at all zoom levels
**Stroke Width**: ✅ Natural zoom behavior with world-coordinate storage
