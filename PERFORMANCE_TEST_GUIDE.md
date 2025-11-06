# Performance Testing Guide

## How to Test Performance with 1000+ Strokes

### Quick Start

1. **Open the application** in your browser
2. **Press the `T` key** to start the performance test
3. **Interact with the canvas** for 10-15 seconds:
   - Zoom in/out with mouse wheel
   - Pan around by right-click dragging
   - Move to different areas of the canvas
4. **Press `T` again** to stop the test and see results

### What the Test Does

When you press `T`:
1. Generates 1000 random strokes across a 10000x10000 pixel canvas
2. Strokes have varying colors, widths, and lengths (10-50 points each)
3. Starts FPS monitoring
4. Logs instructions to the console

### Understanding the Results

The test will show you:
- **Total Strokes**: Number of strokes generated (1000)
- **Test Duration**: How long you ran the test (in seconds)
- **Average FPS**: Average frames per second during the test
- **Min FPS**: Lowest FPS recorded
- **Max FPS**: Highest FPS recorded
- **Avg Culled Strokes**: Average number of offscreen strokes not rendered
- **Avg Rendered**: Average number of strokes actually drawn

### Performance Benchmarks

- **60 FPS**: Excellent - Smooth, no lag
- **50-59 FPS**: Very Good - Barely noticeable drops
- **30-49 FPS**: Good - Acceptable performance
- **Below 30 FPS**: Needs Improvement - Noticeable lag

### What to Test

1. **Zoomed Out View**
   - All strokes visible
   - Tests maximum rendering load
   - Culling: ~0%

2. **Zoomed In View**
   - Most strokes offscreen
   - Tests viewport culling effectiveness
   - Culling: 90-95%

3. **Panned to Empty Area**
   - Few or no strokes visible
   - Tests best-case culling
   - Culling: ~95%+

### Expected Results

With viewport culling optimization:

| Scenario | Visible Strokes | Expected FPS | Culled % |
|----------|----------------|--------------|----------|
| Zoomed out | ~1000 | 30-40 | 0-10% |
| Zoomed in | ~50-100 | 55-60 | 90-95% |
| Panned away | ~0-50 | 60 | 95%+ |

### Console Output

The test logs detailed information to the browser console:

```
🧪 Performance test started with 1000 strokes
📊 Pan and zoom around the canvas for 10-15 seconds, then press T again to see results

═══════════════════════════════════════
📊 PERFORMANCE TEST RESULTS
═══════════════════════════════════════
Total Strokes: 1000
Test Duration: 12s
Average FPS: 58
Min FPS: 45
Max FPS: 60
Avg Culled Strokes: 850
Avg Rendered: 150
═══════════════════════════════════════
```

### Alert Dialog

Results are also shown in an alert dialog for quick viewing:

```
Performance Test Results:

Strokes: 1000
Duration: 12s
Average FPS: 58
Min FPS: 45
Max FPS: 60
Avg Culled: 850 (85%)

✅ Performance: Excellent
```

### Tips for Accurate Testing

1. **Close Other Tabs**: Reduce browser load
2. **Disable DevTools**: Can impact FPS measurements
3. **Test Multiple Times**: Results may vary
4. **Try Different Patterns**: Zoom in various areas
5. **Test Presentation Mode**: Open `/present` window and verify sync

### Customizing Stroke Count

To test with different numbers of strokes, modify the line in `+page.svelte`:

```typescript
canvasComponent.startPerformanceTest(1000); // Change 1000 to any number
```

Recommended test sizes:
- **100 strokes**: Baseline test
- **500 strokes**: Medium load
- **1000 strokes**: Target performance
- **2000 strokes**: Stress test
- **5000 strokes**: Extreme stress test

### Interpreting Culling Statistics

High culling percentage = Good optimization:
- **90%+ culled**: Excellent - viewport culling working perfectly
- **50-90% culled**: Good - reasonable optimization
- **<50% culled**: Low - most strokes visible (zoomed out)

### Troubleshooting

**Low FPS even when zoomed in:**
- Check browser hardware acceleration
- Close resource-heavy applications
- Try a different browser
- Check if anti-aliasing is causing issues

**FPS doesn't change with zoom:**
- Viewport culling may not be working
- Check console for errors
- Verify strokes are being generated across large area

**Test won't start:**
- Check browser console for errors
- Ensure TypeScript compiled successfully
- Try refreshing the page

### Comparing with/without Optimization

To test without viewport culling (for comparison):
1. Comment out the culling check in `Canvas.svelte`:
   ```typescript
   // if (isStrokeVisible(stroke)) {
       drawStroke(stroke);
   // }
   ```
2. Run the test
3. Compare FPS with optimization enabled

### Real-World Usage

The 1000-stroke test simulates:
- 15-20 minutes of continuous drawing
- A detailed technical diagram
- Multiple pages of notes
- A complex sketch with many elements

Most real-world usage will be well below 1000 strokes, so if the test performs well, actual usage will be excellent.

---

## Quick Command Reference

- **T** - Start/stop performance test
- **Console** - View detailed statistics
- **Alert** - See summary results
- **Zoom/Pan** - Test different viewport scenarios

## Developer Notes

### Code Locations

- Performance test utility: `src/lib/utils/performanceTest.ts`
- Canvas integration: `src/lib/components/Canvas.svelte`
- Keyboard shortcut: `src/lib/components/KeyboardShortcuts.svelte`
- Main handler: `src/routes/+page.svelte`

### Key Functions

- `generateTestStrokes(count)` - Generate random strokes
- `PerformanceTest.start()` - Begin FPS monitoring
- `PerformanceTest.recordFrame()` - Track frame rendering
- `PerformanceTest.stop()` - Get results

### FPS Measurement

- Tracks 60 most recent frames
- Calculates FPS from timestamp differences
- Records samples every 10 frames
- Computes min/max/average from samples
