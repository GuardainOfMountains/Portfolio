# Game Instructions Update Plan

## Overview
Improve the initial game instructions to better guide players from start to finish, with better error handling and allowing skilled players to skip ahead.

---

## Changes Required

### 1. Enhanced Start Screen Instructions
**File:** `src/assets/game/game.js`  
**Function:** [`startAct1()`](src/assets/game/game.js:711)

**Current behavior:**
```
You are in /home. Type "ls" to see what's here.
```

**New behavior:**
```
You are in /home. Type "ls" to see what's here.
Type "cd <directory>" to enter a room (e.g., cd livingroom).
Type "cd .." to go back up a level.
```

---

### 2. Guided Path from Home → Basement
**File:** `src/assets/game/game.js`  
**Function:** [`startAct1()`](src/assets/game/game.js:711)

Add a step-by-step guide in the initial message:
```
Your mission:
1. Explore the house: cd livingroom, cd kitchen
2. Find password fragments: cat sticky_note, cat drawer, cat clock (hint: the password is three parts combined)
3. Go outside: cd .. (to /), cd forest, cd cave
4. Destroy Badfile_emiter: sudo rm Badfile_emiter (you'll need the password)
5. Return home and unlock all doors: unlock <password>
6. Enter basement: cd home, cd basement
7. Remove the virus: sudo rm V1rUs_c0R3 (you'll need the password)
```

---

### 3. Improved Error Messages
**File:** `src/assets/game/game.js`  
**Function:** [`runCommand()`](src/assets/game/game.js:339)

Add a default case handler for unknown commands that provides helpful guidance:

**New code (around line 706-708):**
```javascript
default:
  if (cmd) {
    print('command not found: ' + cmd, 'error');
    print('Type "help" for a list of commands, or "man" for the spirit guide.', 'system');
    // Offer suggestions for common typos
    if (cmd === 'ls -la' || cmd === 'll') {
      print('Hint: This terminal only supports basic "ls". Try "ls".', 'system');
    }
    if (cmd === 'cd/home' || cmd === 'cd/') {
      print('Hint: Use "cd .." to go up, not "/". Try "pwd" to see where you are.', 'system');
    }
  }
```

---

### 4. Allow Direct "sudo password" Command (Hidden Backdoor)
**File:** `src/assets/game/game.js`  
**Function:** [`runCommand()`](src/assets/game/game.js:339)

Allow players to bypass the multi-step process if they already know the password. The password should NOT be shown in any instructions - this is a hidden feature. Add this logic in the sudo case:

**New behavior:**
```javascript
case 'sudo': {
  const rest = parts.slice(1).join(' ');
  
  // Check for direct "sudo password1" format (hidden backdoor - not shown to players)
  const restParts = rest.split(/\s+/);
  if (restParts[0] === 'password1' || rest === 'password1') {
    // Direct password provided - unlock everything
    if (!homeUnlocked) {
      homeUnlocked = true;
      print('[sudo] password accepted.', 'success');
      print('All doors unlocked!', 'success');
      spiritSay('You knew the password all along! Head to the basement now.');
    }
    if (!bossDefeated) {
      bossDefeated = true;
      const basement = getNode('home/basement/V1rUs_c0R3');
      if (basement) {
        removedPaths.add('home/basement/V1rUs_c0R3');
      }
      print('[sudo] password accepted.', 'success');
      print('V1rUs_c0R3 has been removed. SYSTEM RECOVERY COMPLETE!', 'success');
      victoryMessage();
    }
    break;
  }
  
  // Existing "sudo rm <target>" logic continues...
  const sudoCmd = (restParts[0] || '').toLowerCase();
  const sudoArg = restParts.slice(1).join(' ').trim();
  // ... rest of existing code
}
```

**Important:** The walkthrough in section 2 should NOT mention the password - keep it secret!

---

### 5. Add Victory Message Function
**File:** `src/assets/game/game.js`

Add a new function after [`startAct1()`](src/assets/game/game.js:730):
```javascript
function victoryMessage() {
  print('');
  print('═══════════════════════════════════════════════════════════════', 'quest');
  print('  *** SYSTEM RECOVERY COMPLETE ***', 'quest');
  print('═══════════════════════════════════════════════════════════════', 'quest');
  print('');
  print('The virus core has been deleted. Your home network is now clean.', 'system');
  print('Your memory has been fully restored.', 'system');
  print('');
  print('Type "reset" to play again.', 'system');
  print('');
}
```

---

### 6. Add "reset" Command
**File:** `src/assets/game/game.js`  
**Function:** [`runCommand()`](src/assets/game/game.js:339)

Add new case before the default:
```javascript
case 'reset': {
  print('Resetting system...', 'system');
  setTimeout(() => resetGame(), 1500);
  break;
}
```

---

### 7. Better "unlock" Command Feedback
**File:** `src/assets/game/game.js`  
**Function:** [`runCommand()`](src/assets/game/game.js:656-670)

When player unlocks doors, provide next-step guidance:
```javascript
case 'unlock': {
  if (!arg) {
    print('unlock: usage: unlock <password>', 'error');
    print('If you know the password, type: unlock password1', 'system');
    break;
  }
  if (arg !== PASSWORD) {
    print('unlock: wrong password. The doors stay locked.', 'error');
    spiritSay('Wrong combination. Explore the kitchen: "cd kitchen" then "cat" the files there to find fragments.');
    break;
  }
  homeUnlocked = true;
  print('The locks click open. All doors in your home are now unlocked.', 'success');
  spiritSay('Doors unsealed! Now go to the basement: cd basement');
  print('Next: cd basement, then sudo rm V1rUs_c0R3', 'system');
  setPrompt();
  break;
}
```

---

## Summary of Changes

| Location | Change | Priority |
|----------|--------|----------|
| `startAct1()` | Add cd command teaching + full walkthrough | HIGH |
| `runCommand()` default case | Better error messages with hints | HIGH |
| `runCommand()` sudo case | Allow direct "sudo password1" | HIGH |
| New `victoryMessage()` | Show completion message | MEDIUM |
| `runCommand()` reset case | Allow game restart | MEDIUM |
| `runCommand()` unlock case | Better next-step guidance | MEDIUM |

---

## Testing Checklist
- [ ] Start game → verify both ls and cd are taught
- [ ] Type unknown command → verify helpful error appears
- [ ] Type "sudo password1" → verify game can be won instantly
- [ ] Type "unlock password1" → verify doors unlock with guidance
- [ ] Complete game normally → verify victory message shows
- [ ] Type "reset" → verify game resets properly
