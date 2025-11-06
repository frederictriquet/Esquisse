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

## Phase 11: CI/CD & Deployment Automation
**Goal**: Automated builds and deployment pipeline
**Duration**: 3-4 hours
**Dependencies**: Phase 9, 10

### Features
- [ ] GitHub Actions workflows for CI/CD
- [ ] Docker image build and publish
- [ ] Multi-platform Tauri builds (Linux, Windows, macOS)
- [ ] Automated testing in CI
- [ ] Release automation

### GitHub Actions Workflows

#### 1. Web App Docker Build & Publish
**File**: `.github/workflows/docker.yml`

Triggers:
- Push to `main` branch
- Manual workflow dispatch
- Release tags

Steps:
1. Build optimized production bundle
2. Create minimal Docker image (Nginx + static files)
3. Push to GitHub Container Registry (ghcr.io)
4. Tag with version and `latest`

Image size target: ~15-20MB (Alpine-based Nginx)

#### 2. Tauri Desktop Builds
**File**: `.github/workflows/tauri.yml`

Triggers:
- Release tags (`v*`)
- Manual workflow dispatch

Platforms:
- **Linux**: AppImage, .deb, .rpm
- **Windows**: .exe, .msi
- **macOS**: .dmg, .app (Intel + Apple Silicon)

Build matrix:
```yaml
strategy:
  matrix:
    platform:
      - ubuntu-latest   # Linux builds
      - windows-latest  # Windows builds
      - macos-latest    # macOS builds
```

Artifacts:
- Binaries attached to GitHub Release
- Checksums for verification
- Auto-generated release notes

#### 3. Continuous Integration
**File**: `.github/workflows/ci.yml`

Triggers:
- Pull requests
- Push to any branch

Checks:
- TypeScript compilation (`npm run check`)
- Build verification (`npm run build`)
- Unit tests (`npm run test`)
- Linting (`npm run lint`)
- Format check (`npm run format:check`)

#### 4. Release Automation
**File**: `.github/workflows/release.yml`

Triggers:
- Manual workflow with version input
- Creates git tag
- Triggers docker and tauri workflows
- Generates changelog from commits

### Docker Configuration

#### Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Features
- Multi-stage build (minimal final image)
- Static file serving via Nginx
- Gzip compression enabled
- Cache headers configured
- Health check endpoint

### Tauri Build Configuration

#### Cross-Platform Support

**Linux**:
- Ubuntu 20.04+ (AppImage)
- Debian/Ubuntu (.deb)
- Fedora/RHEL (.rpm)
- Dependencies: webkit2gtk, OpenSSL

**Windows**:
- Windows 10+ (64-bit)
- MSI installer with auto-update
- EXE portable version
- Code signing (optional)

**macOS**:
- macOS 10.15+
- Universal binary (Intel + ARM)
- DMG installer
- App notarization (requires Apple Developer account)

#### Build Optimizations
- Strip debug symbols
- Optimize binary size
- Enable LTO (Link Time Optimization)
- Compress resources
- Target size: 8-12MB per platform

### Deployment Strategies

#### Docker Deployment Options

1. **GitHub Container Registry**
   ```bash
   docker pull ghcr.io/USERNAME/esquisse:latest
   docker run -p 8080:80 ghcr.io/USERNAME/esquisse:latest
   ```

2. **Docker Hub** (alternative)
   ```bash
   docker pull username/esquisse:latest
   docker run -p 8080:80 username/esquisse:latest
   ```

3. **Self-hosted**
   - Docker Compose configuration
   - Kubernetes manifests
   - Reverse proxy (Traefik/Nginx)

#### Desktop Distribution

1. **GitHub Releases**
   - Primary distribution method
   - Automatic updates via Tauri
   - Versioned releases

2. **Package Managers** (future)
   - Homebrew (macOS)
   - Chocolatey (Windows)
   - Snap/Flatpak (Linux)

### Technical Requirements

#### Repository Secrets
- `GITHUB_TOKEN`: Automatically provided
- `DOCKER_USERNAME`: Docker Hub username (optional)
- `DOCKER_PASSWORD`: Docker Hub token (optional)
- `APPLE_CERTIFICATE`: macOS signing cert (optional)
- `APPLE_CERTIFICATE_PASSWORD`: Cert password (optional)

#### Build Dependencies
- Node.js 20+
- Rust toolchain (for Tauri)
- Platform-specific SDKs
- Docker engine (for image builds)

### Success Criteria
- Docker image builds successfully
- Image published to registry automatically
- Tauri builds for all platforms
- Binaries attached to releases
- CI catches issues before merge
- One-command deployment

### Deliverables

#### Workflow Files
1. `.github/workflows/docker.yml` - Docker build & publish
2. `.github/workflows/tauri.yml` - Desktop app builds
3. `.github/workflows/ci.yml` - Continuous integration
4. `.github/workflows/release.yml` - Release automation

#### Configuration Files
5. `Dockerfile` - Docker image definition
6. `nginx.conf` - Nginx configuration
7. `docker-compose.yml` - Local Docker development
8. `.dockerignore` - Docker build exclusions

#### Documentation
9. `DEPLOYMENT.md` - Deployment guide
10. `CONTRIBUTING.md` - CI/CD workflow docs

### Workflow Examples

#### Docker Workflow (Simplified)
```yaml
name: Docker Build & Publish

on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  docker:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

#### Tauri Workflow (Simplified)
```yaml
name: Tauri Build

on:
  push:
    tags: ['v*']
  workflow_dispatch:

jobs:
  build:
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest, macos-latest]

    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies (Linux)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev \
            libappindicator3-dev librsvg2-dev patchelf

      - name: Install dependencies
        run: npm ci

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: v__VERSION__
          releaseName: 'Esquisse v__VERSION__'
          releaseBody: 'See CHANGELOG.md for details'
          releaseDraft: true
          prerelease: false
```

### Performance Targets

- **CI Pipeline**: < 5 minutes for checks
- **Docker Build**: < 3 minutes
- **Tauri Build**: < 10 minutes per platform
- **Total Release Time**: < 30 minutes (all platforms)

### Monitoring & Notifications

- Build status badges in README
- Slack/Discord notifications (optional)
- Email on build failures
- Release announcements

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
| Phase 11: CI/CD & Deployment | 4h | 43h |

**Total**: ~43 hours (~5.5 working days)

---

## Priority Levels

### Must Have (MVP)
- Phases 0-7: Core functionality
- Minimum viable product with all key features
- Web-based drawing application fully functional

### Should Have
- Phase 8: Polish & Optimization
- Phase 10: Testing & Documentation
- Important for production readiness and maintainability

### Nice to Have
- Phase 9: Desktop Packaging
- Phase 11: CI/CD & Deployment Automation
- Can start with web-only version
- Desktop and automation enhance distribution

### Future Enhancements
- Additional drawing tools (shapes, text, layers)
- Collaboration features (real-time multi-user)
- Cloud storage integration
- Advanced export options (PDF, SVG animations)
- Plugin system for extensibility

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

### Risk: Cross-platform build failures
**Mitigation**: Use proven GitHub Actions; test locally with Tauri CLI before CI

### Risk: Docker image bloat
**Mitigation**: Multi-stage builds; Alpine base images; monitor image size in CI

### Risk: macOS code signing complexity
**Mitigation**: Make signing optional; document setup; provide unsigned builds initially

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
