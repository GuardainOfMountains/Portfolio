# Terminus Game Update - Comparison & Integration Plan

## File Comparison Summary

| Aspect | Original | Updated |
|--------|----------|---------|
| **game.js** | 631 lines | 835 lines (+204 lines) |
| **game.css** | 196 lines | 437 lines (+241 lines) |
| **HTML entry** | learning.html (31 lines) | index.html (57 lines) |

---

## Key Changes

### 1. New Commands Added

| Command | Description |
|---------|-------------|
| `mkdir <dir>` | Create new directory |
| `touch <file>` | Create empty file |
| `rmdir <dir>` | Remove empty directory |

### 2. Enhanced `echo` Command

- Now supports redirection: `echo "text" > file` (overwrite) and `echo "text" >> file` (append)
- Auto-creates files if they don't exist
- File validation (only letters, numbers, `.`, `-`, `_` allowed)

### 3. Filesystem Changes

| Original | Updated | Notes |
|----------|---------|-------|
| `virus_boss` (basement) | `V1rUs_c0R3` | Renamed enemy + case-sensitive |
| `enemy_teleporter` (cave) | `Badfile_emiter` | Renamed + case-sensitive |
| Static `fs` object | Mutable `fs` with `INITIAL_FS` backup | Allows file/dir creation |

### 4. New Features

- **System Integrity Check**: Critical paths protected; game auto-resets if corrupted
- **Reset Game**: Complete game state restoration
- **Case-Sensitive Hints**:提示 when user types wrong case for special targets
- **Root Directory Navigation**: Can now navigate to `/` (filesystem root)

### 5. Visual/UI Changes

- **Completely redesigned theme**: Cyberpunk/watery terminal aesthetic
- **New fonts**: Orbitron (display) + JetBrains Mono
- **Color palette**: Cyan/magenta/neon instead of green/amber
- **Animated background**: Water ripple + scanline effects
- **p10k-style prompt**: Segmented user@path display
- **Bonzi tree forest**: CSS art background with trees
- **Command reference panel**: Always-visible help in corner
- **Glitch animation**: On corrupted files
- **Caret cursor**: Blinking cyan/magenta pulse

---

## Integration Steps Required

### Step 1: Replace Game Files
- [ ] Copy `game update/game.js` → `src/assets/game/game.js`
- [ ] Copy `game update/style.css` → `src/assets/game/game.css`

### Step 2: Update HTML Entry Point
- [ ] Replace `learning.html` with content from `game update/index.html`
- OR update `learning.html` to include:
  - New command reference panel
  - Bonzi tree background divs
  - Updated header styling

### Step 3: Verify Integration
- [ ] Test game loads in browser
- [ ] Verify new commands work (`mkdir`, `touch`, `rmdir`)
- [ ] Test file creation with `echo >` and `echo >>`
- [ ] Check cyberpunk theme renders correctly

---

## Notes for User

1. The updated game is **standalone** (works by opening `index.html` directly)
2. For portfolio integration, files need to be copied to `src/assets/game/`
3. The new HTML (`index.html`) has different structure than `learning.html` - needs adaptation
4. Some naming changes in game objects (boss name, teleporter) - intentional for variety
