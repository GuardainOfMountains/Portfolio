# Plan: Add Location-Specific Command Hints to Act 1

## Overview
Add contextual hints to every location in Act 1 that remind players how to use `cd`, `ls`, `rm`, and `cat` commands.

## Current State
- **Static Panel**: Already exists in [`learning.html:33-48`](learning.html:33) - shows all 4 commands
- **Location Hints**: Only exists for specific locations (bedroom echoes, basement boss)

## Implementation Plan

### Step 1: Update Static Command Reference Panel (Optional Enhancement)
**File:** [`learning.html:33-48`](learning.html:33)

The panel already shows all 4 commands but could be enhanced:
- Add `rm` command explanation
- Make the panel more prominent for Act 1

Current panel shows:
- ls — list files
- cd <dir> — enter Dir  
- cd .. — go back
- cat <file> — read file
- rm <file> — remove

### Step 2: Add Location-Specific Hints in game.js
**File:** [`src/assets/game/game.js`](src/assets/game/game.js)

Modify the `cd` command handler (around line 365-401) to show command hints after entering any directory:

```javascript
// After displaying directory description, show command hints
const d = getDirDesc(cwd);
if (d) print(d, 'system');

// NEW: Show contextual command hints based on location
printCommandHints(cwd);
```

Create a new function `printCommandHints(path)` that displays:
- At ALL locations: "ls — list files | cd <dir> — navigate | cat <file> — read | rm <file> — delete"
- At locations with files: Remind about cat to read
- At locations with corrupted files: Remind about rm to delete

### Step 3: Locations That Need Hints
All Act 1 locations:
- `/` (root) - "Use ls to see home/forest, cd to enter"
- `/home` - "Use ls to see rooms, cd <room> to enter"
- `/home/livingroom` - Has note file + badfile
- `/home/kitchen` - Has 3 password fragments + badfile
- `/home/bedroom` - Has journal (keep existing echo hint)
- `/home/bathroom` - Has mirror + badfile
- `/home/diningroom` - Has note + badfile
- `/home/attic` - Has old_disk
- `/home/basement` - Has boss (keep existing sudo rm hint)
- `/forest` - "Use ls to see hillside/cave, cd to enter"
- `/forest/hillside` - Has badfile
- `/forest/cave` - Has badfile + Badfile_emiter

## Files to Modify

| File | Change |
|------|--------|
| `src/assets/game/game.js` | Add `printCommandHints()` function and call it in cd handler |
| `learning.html` (optional) | Enhance static command panel for Act 1 |

## Implementation Notes

1. The hints should be brief and not intrusive
2. Use the existing 'system' CSS class for hint text
3. Existing location-specific hints (bedroom journal, basement boss) should still work
4. The hints should help new players understand what commands to try at each location
