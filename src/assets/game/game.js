/**
 * Terminus — ACT 1: The Forgotten Password | ACT 2: System Hardening
 * Terminal learning game.
 * Act 1: ls, cd, pwd, cat, rm, mkdir, touch, rmdir, echo, man, sudo, unlock, help, clear
 * Act 2: sudo apt update/upgrade/clean/autoremove, sudo apt install antivirus, antivirus, tar -xzf
 */

(function () {
  'use strict';

  // ----- Game state -----
  const LOCKED_ROOMS = ['bedroom', 'bathroom', 'diningroom', 'attic', 'basement'];
  const PASSWORD = 'password1';
  const FRAGMENTS = ['pass', 'word', '1'];

  let gameMode = 'name';       // 'name' | 'play'
  let userName = '';
  let cwd = 'home';
  let fragmentsFound = new Set();
  let homeUnlocked = false;
  let bossDefeated = false;
  const removedPaths = new Set();
  const journalEntries = [];  // lines appended via echo >> journal
  let bedroomEchoTaught = false;

  // ----- Act 2: System Maintenance State -----
  let aptUpdated = false;
  let aptUpgraded = false;
  let aptCleaned = false;
  let aptAutoremoved = false;
  let antivirusInstalled = false;
  let firewallDownloaded = false;
  let badfilesRemoved = 0;

  // ----- Virtual filesystem: Home (7 rooms) + Forest (hillside, cave) -----
  let fs = {
    '': {
      type: 'dir',
      children: {
        home: {
          type: 'dir',
          desc: 'Your home. The walls feel familiar but something is wrong. Corrupted files lurk here.',
          children: {
            livingroom: {
              type: 'dir',
              desc: 'The living room. The space is rendered in muted grays with faint scan lines. A coffee table sits in the center, a note resting on its surface.',
              children: {
                note: {
                  type: 'file',
                  content: 'A note in your handwriting:\n\n"If you\'re reading this, they got you. Memory wipe. To escape the house protocol: go UP one level. cd .. and list what\'s there. You\'ll see home. You\'ll see forest. One is a prison. One is a war zone. Neither is safe anymore."'
                },
                nested: {
                  type: 'dir',
                  desc: 'A nested directory.',
                  children: {
                    badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
                  }
                },
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            kitchen: {
              type: 'dir',
              desc: 'The kitchen. The refrigerator emits a low, irregular hum. On the counter, a corrupted file flickers unnaturally. This is where you hid the password fragments.',
              children: {
                sticky_note: {
                  type: 'file',
                  content: 'A yellow sticky note, the word barely visible through static: "pass"\n\n<<FRAGMENT ACQUIRED: pass>>',
                  fragment: 'pass'
                },
                drawer: {
                  type: 'file',
                  content: 'Inside the drawer, carved into the wood: "word"\n\n<<FRAGMENT ACQUIRED: word>>',
                  fragment: 'word'
                },
                clock: {
                  type: 'file',
                  content: 'The digital clock blinks: 1:11 1:11 1:11. The first digit burns brighter.\n"1"\n\n<<FRAGMENT ACQUIRED: 1>>',
                  fragment: '1'
                },
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            bedroom: {
              type: 'dir',
              desc: 'Your bedroom. The bed is unmade, the sheets shifting between textures. Signs of corruption are here, like a system sweep left metadata traces behind.',
              children: {
                journal: {
                  type: 'file',
                  writable: true,
                  content: 'From your journal:\n\n"Memory degradation: 47%. I\'m forgetting faster. The virus learns. If I forget the sudo password, it\'s over. The password is three fragments combined. Something simple. Something I\'d use every day. Find them. Unlock the doors. Get to the basement."'
                },
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            bathroom: {
              type: 'dir',
              desc: 'The bathroom. The mirror is cracked, each shard reflecting a slightly different version of you. A corrupted file—a badfile—twists in the corner.',
              children: {
                mirror: {
                  type: 'file',
                  contentRef: 'mirror'
                },
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            diningroom: {
              type: 'dir',
              desc: 'The dining room. Chairs are pushed back as if from an interrupted meal. One place is set. Dust hangs motionless in the air. The quiet feels heavy.',
              children: {
                note: {
                  type: 'file',
                  content: 'A note on the table:\n\n"The basement holds the infection core. You need SUPERUSER ACCESS. Find the fragments. Use "unlock" with the password, then descend."'
                },
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            attic: {
              type: 'dir',
              desc: 'The attic. Storage for forgotten data. Cardboard boxes have missing textures. Cobwebs look like severed network connections.',
              children: {
                old_disk: {
                  type: 'file',
                  content: 'An old 3.5" floppy disk. The label reads:\n\n*"BACKUP PASSWORD - BREAK GLASS IN CASE OF APOCALYPSE password1"*\n\n<<MEMORY RESTORED: FULL SUDO PASSWORD IS password1>>'
                },
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            basement: {
              type: 'dir',
              desc: 'The basement. The infection core V1rUs_c0R3 is here. Root access required to remove it.',
              children: {
                V1rUs_c0R3: {
                  type: 'boss',
                  content: 'V1RUS CORE DETECTED\n\nA corrupted data mass blocks the basement. It\'s been here the whole time.\n\nRoot access required to delete.\n\n>> sudo rm V1rUs_c0R3'
                },
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            }
          }
        },
        forest: {
          type: 'dir',
          desc: 'The forest beyond your home. The trees are rendered with corrupted geometry. The virus spread here, infecting the filesystem.',
          children: {
            hillside: {
              type: 'dir',
              desc: 'A steep hillside. The terrain glitches, polygons flickering. A badfile clings to the rocks, pulsing faintly.',
              children: {
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            cave: {
              type: 'dir',
              desc: 'A dark cave. The walls show raw, hexadecimal code. Inside is Badfile_emiter—a corrupted folder. It can only be destroyed with root access.',
              children: {
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' },
                Badfile_emiter: { type: 'corrupted_folder', name: 'Badfile_emiter' }
              }
            }
          }
        },
        // Act 2: System directories
        var: {
          type: 'dir',
          desc: 'System variables and cache.',
          children: {
            cache: {
              type: 'dir',
              desc: 'Cache directory.',
              children: {
                apt: {
                  type: 'dir',
                  desc: 'APT package cache.',
                  children: {
                    archives: { type: 'dir', desc: 'Downloaded packages.', children: {} },
                    badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
                  }
                },
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            log: {
              type: 'dir',
              desc: 'System log files.',
              children: {
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            }
          }
        },
        tmp: {
          type: 'dir',
          desc: 'Temporary files.',
          children: {
            downloads: { 
              type: 'dir', 
              desc: 'Downloaded files.', 
              children: {
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
          }
        },
        etc: {
          type: 'dir',
          desc: 'System configuration.',
          children: {
            firewall: { 
              type: 'dir', 
              desc: 'Firewall configuration.', 
              children: {
                old_firewall: { 
                  type: 'file', 
                  content: 'FIREWALL_RULES=open\nDEFAULT_POLICY=allow\nLOG_LEVEL=quiet\n# This is the old weak firewall config - replace with the new one!',
                  writable: true 
                }
              } 
            },
            config: {
              type: 'dir',
              desc: 'Configuration files.',
              children: {
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            },
            badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
          }
        },
        usr: {
          type: 'dir',
          desc: 'User programs and data.',
          children: {
            share: {
              type: 'dir',
              desc: 'Shared data.',
              children: {
                badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
              }
            }
          }
        },
        srv: {
          type: 'dir',
          desc: 'Service data.',
          children: {
            badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
          }
        },
        'lost+found': {
          type: 'dir',
          desc: 'Lost and found recovered files.',
          children: {
            badfile: { type: 'file', content: 'MALWARE_SIGNATURE=detected\nTHREAT_LEVEL=high\nSTATUS=quarantined' }
          }
        }
      }
    }
  };

  // Store a pristine copy for system restore
  const INITIAL_FS = JSON.parse(JSON.stringify(fs));

  // Critical paths – game cannot continue if any are missing
  const CRITICAL_PATHS = [
    'home',
    'home/basement',
    'home/kitchen',
    'home/livingroom',
    'home/bedroom',
    'home/bathroom',
    'home/diningroom',
    'home/attic'
  ];

  function getNode(path) {
    const parts = path ? path.replace(/\/+$/, '').split('/').filter(Boolean) : [];
    let node = fs[''];
    for (const p of parts) {
      if (!node || node.type !== 'dir' || !node.children || !(p in node.children))
        return null;
      node = node.children[p];
    }
    return node;
  }

  function resolvePath(currentPath, target) {
    if (!target) return currentPath;
    const parts = currentPath ? currentPath.split('/').filter(Boolean) : [];
    const tokens = target.split('/').filter(Boolean);
    for (const t of tokens) {
      if (t === '..') {
        if (parts.length) parts.pop();
      } else if (t !== '.') {
        parts.push(t);
      }
    }
    return parts.join('/');
  }

  function isLocked(path) {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] !== 'home' || parts.length !== 2) return false;
    return LOCKED_ROOMS.includes(parts[1]);
  }

  function pathRemoved(path) {
    return removedPaths.has(path);
  }

  function listDir(path) {
    const node = getNode(path);
    if (!node || node.type !== 'dir') return null;
    let names = Object.keys(node.children || {});
    names = names.filter(n => {
      const full = path ? path + '/' + n : n;
      if (pathRemoved(full)) return false;
      const child = node.children[n];
      if (child.type === 'boss' && bossDefeated) return false;
      return true;
    });
    return names;
  }

  function getDirDesc(path) {
    const node = getNode(path);
    return (node && node.type === 'dir' && node.desc) ? node.desc : null;
  }

  function nodeAt(path) {
    return getNode(path);
  }

  // ----- DOM -----
  const output = document.getElementById('output');
  const inputEl = document.getElementById('input');
  const promptEl = document.getElementById('prompt');

  const history = [];
  let historyIndex = -1;

  // ----- Performance Optimization: Terminal Lines History -----
  // Store all terminal output in an array for virtual scrolling
  const terminalLines = [];
  const MAX_VISIBLE_LINES = 100; // Only render last 100 lines to DOM
  let renderPending = false; // Batch render flag to prevent multiple RAF calls

  // Schedule a batched render using requestAnimationFrame
  function scheduleRender() {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      renderBatch();
      renderPending = false;
    });
  }

  // Render only the visible portion of terminal history
  function renderBatch() {
    // Only render the last MAX_VISIBLE_LINES
    const startIndex = Math.max(0, terminalLines.length - MAX_VISIBLE_LINES);
    const visibleLines = terminalLines.slice(startIndex);
    
    // Clear and rebuild only visible portion
    output.innerHTML = '';
    
    visibleLines.forEach(line => {
      if (line.isHtml) {
        // For ls output with colored spans
        const div = document.createElement('div');
        div.className = 'line';
        div.innerHTML = line.html;
        output.appendChild(div);
      } else {
        const div = document.createElement('div');
        div.className = 'line' + (line.className ? ' ' + line.className : '');
        div.textContent = line.text;
        output.appendChild(div);
      }
    });
    
    // Single scroll to bottom after batch
    output.scrollTop = output.scrollHeight;
  }

  function print(text, className = '') {
    // Add to history array instead of directly to DOM
    terminalLines.push({ text, className, isHtml: false });
    scheduleRender();
  }

  function printLsLine(names, path) {
    // Build HTML for colored ls output
    const node = getNode(path);
    const children = node && node.children || {};
    let html = '';
    names.forEach((name, i) => {
      if (i > 0) html += '  ';
      const child = children[name];
      let className = 'ls-file';
      if (child.type === 'dir') className = 'ls-dir';
      else if (child.type === 'corrupted' || child.type === 'corrupted_folder' || child.type === 'boss') className = 'ls-bad';
      html += '<span class="' + className + '">' + name + '</span>';
    });
    
    // Store HTML content in terminalLines array
    terminalLines.push({ text: '', html: html, isHtml: true, className: '' });
    scheduleRender();
  }

  function printLines(text, className = '') {
    text.split('\n').forEach(l => print(l, className));
  }

  let promptText = '❯ '; // plain-text version for command echo

  function setPrompt() {
    let loc = cwd;
    if (cwd === 'home') loc = '~';
    else if (!cwd) loc = '/';
    else loc = '~/' + cwd.replace(/^home\//, '');
    promptText = (userName || 'user') + ' ' + loc + ' ❯ ';
    // p10k-style prompt with HTML segments
    promptEl.innerHTML =
      '<span class="p10k-user">' + (userName || 'user') + '</span>' +
      '<span class="p10k-sep">▶</span>' +
      '<span class="p10k-path">' + loc + '</span>' +
      '<span class="p10k-sep">▶</span>' +
      '<span class="p10k-arrow">❯</span>';
  }

  function spiritSay(msg) {
    print('', 'system');
    print('[ Spirit guide ] ' + msg, 'quest');
    print('', 'system');
  }

  // Show command hints at every location (Act 1)
  function showCommandHints() {
    print('', 'system');
    print('💡 Commands: ls (list) | cd <dir> (enter) | cat <file> (read) | rm <file> (delete)', 'system');
  }

  // Add a node (file or dir) under the current working directory
  function addNodeAtCwd(name, node) {
    const parent = getNode(cwd);
    if (!parent || parent.type !== 'dir') return false;
    if (parent.children[name]) return false;   // already exists
    parent.children[name] = node;
    return true;
  }

  // Remove an empty directory (used by rmdir)
  function removeEmptyDir(path) {
    const node = getNode(path);
    if (!node || node.type !== 'dir') return false;
    if (Object.keys(node.children || {}).length > 0) return false; // not empty
    const parentPath = path.split('/').slice(0, -1).join('/');
    const parent = getNode(parentPath);
    if (!parent || parent.type !== 'dir') return false;
    const dirName = path.split('/').pop();
    delete parent.children[dirName];
    return true;
  }

  // After any fs change, verify critical paths still exist
  function checkSystemIntegrity() {
    for (const p of CRITICAL_PATHS) {
      if (!getNode(p)) {
        print('\n!!! CRITICAL SYSTEM INTEGRITY FAILURE !!!', 'error');
        print('The filesystem is corrupted: /' + p + ' has been deleted.', 'error');
        print('A major system error occurred. Rebooting...\n', 'error');
        setTimeout(() => resetGame(), 4000);
        return false;
      }
    }
    return true;
  }

  // Reset everything to initial state
  function resetGame() {
    // Reset state variables
    gameMode = 'name';
    userName = '';
    cwd = 'home';
    fragmentsFound.clear();
    homeUnlocked = false;
    bossDefeated = false;
    removedPaths.clear();
    journalEntries.length = 0;
    bedroomEchoTaught = false;

    // Restore filesystem
    fs = JSON.parse(JSON.stringify(INITIAL_FS));

    // Clear terminal history array and DOM
    terminalLines.length = 0;
    output.innerHTML = '';
    promptName();
  }

  function runCommand(line) {
    const trimmed = line.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const cmd = (parts[0] || '').toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    print(promptText + trimmed, 'system');

    switch (cmd) {
      case 'ls': {
        const names = listDir(cwd);
        if (names === null) {
          print('ls: cannot access: No such file or directory.', 'error');
          break;
        }
        const desc = getDirDesc(cwd);
        if (desc) print(desc, 'system');
        if (names.length)
          printLsLine(names, cwd);
        else
          print('(empty)', 'text-dim');
        break;
      }

      case 'cd': {
        const newPath = resolvePath(cwd, arg || '');
        const node = getNode(newPath);
        if (!node) {
          print('cd: no such file or directory: ' + (arg || '..'), 'error');
          break;
        }
        if (node.type !== 'dir') {
          print('cd: not a directory: ' + arg, 'error');
          break;
        }
        if (isLocked(newPath) && !homeUnlocked) {
          print('cd: ' + arg + ': Permission denied. The door is locked.', 'error');
          spiritSay('Find password fragments in the kitchen/living room. Then destroy Badfile_emiter in the forest cave: "sudo rm Badfile_emiter". That will unseal your home.');
          break;
        }
        cwd = newPath;
        setPrompt();
        const d = getDirDesc(cwd);
        if (d) print(d, 'system');
        showCommandHints();
        if (newPath === '') {
          print('You are at the root of the filesystem.', 'system');
          print('Use "ls" to see what\'s here, then "cd <directory>" to enter one (e.g. cd home).', 'system');
          print('Use "cd .." to go up a level (you\'re already at the top).', 'system');
        }
        if (newPath === 'home/bedroom' && !bedroomEchoTaught) {
          bedroomEchoTaught = true;
          spiritSay('The journal is here. Use \'cat journal\' to read. Use \'echo "your text" >> journal\' to write.');
        }
        if (newPath === 'home/basement' && !bossDefeated) {
          const boss = getNode('home/basement/V1rUs_c0R3');
          if (boss && boss.type === 'boss') {
            spiritSay('V1rUs_c0R3 is here. Use "sudo rm V1rUs_c0R3" to remove it.');
            printLines(boss.content, 'quest');
          }
        }
        break;
      }

      case 'pwd': {
        print('/' + cwd, 'success');
        break;
      }

      case 'cat': {
        if (!arg) {
          print(cmd + ': missing file operand', 'error');
          break;
        }
        const pathParts = cwd.split('/').filter(Boolean);
        pathParts.push(arg);
        const filePath = pathParts.join('/');
        const fileNode = getNode(filePath);
        if (!fileNode) {
          print(cmd + ': ' + arg + ': No such file or directory', 'error');
          break;
        }
        if (fileNode.type === 'corrupted' || fileNode.type === 'corrupted_folder') {
          print(cmd + ': ' + arg + ': Permission denied. It is corrupted. Use "rm" to destroy it' + (fileNode.type === 'corrupted_folder' && arg === 'Badfile_emiter' ? ' (sudo required).' : '.'), 'error');
          break;
        }
        if (fileNode.type === 'boss') {
          printLines(fileNode.content, 'quest');
          break;
        }
        if (fileNode.type === 'file') {
          let content = fileNode.content;
          if (fileNode.contentRef === 'mirror')
            content = 'You look into the broken mirror. Many versions of you stare back. Only one shows your true ' + (userName || 'user') + ' reflection. The others are cached copies.';
          else if (filePath === 'home/bedroom/journal')
            content = (content || '') + (journalEntries.length ? '\n\n--- Your entries ---\n' + journalEntries.join('\n') : '');
          if (content) {
            printLines(content, 'less-content');
            if (fileNode.fragment) {
              const prevSize = fragmentsFound.size;
              fragmentsFound.add(fileNode.fragment);
              if (fragmentsFound.size > prevSize) {
                spiritSay('Fragment recovered. Your memory is reconstructing.');
                if (fragmentsFound.size >= 3)
                  spiritSay('Three fragments acquired. The password is whole. Type \'unlock password1\' when ready.');
              }
            }
          }
          if (filePath === 'home/bedroom/journal' && !bedroomEchoTaught) {
            bedroomEchoTaught = true;
            spiritSay('The journal is here. Use \'cat journal\' to read. Use \'echo "your text" >> journal\' to write.');
          }
        }
        break;
      }

      case 'rm': {
        if (!arg) {
          print('rm: missing operand', 'error');
          break;
        }
        const pathParts = cwd.split('/').filter(Boolean);
        pathParts.push(arg);
        const filePath = pathParts.join('/');
        const fileNode = getNode(filePath);
        if (!fileNode) {
          // Check for case-sensitivity errors on special targets
          if (arg.toLowerCase() === 'badfile_emiter') {
            print('rm: \'' + arg + '\': No such file or directory', 'error');
            print('  (hint: the correct name is Badfile_emiter - case matters!)', 'system');
          } else if (arg.toLowerCase() === 'v1rus_c0r3') {
            print('rm: \'' + arg + '\': No such file or directory', 'error');
            print('  (hint: the correct name is V1rUs_c0R3 - case matters!)', 'system');
          } else {
            print('rm: cannot remove \'' + arg + '\': No such file or directory', 'error');
          }
          break;
        }
        if (fileNode.type === 'corrupted_folder' && arg === 'Badfile_emiter') {
          print('rm: cannot remove \'Badfile_emiter\': Permission denied. Only "sudo rm Badfile_emiter" can destroy it.', 'error');
          spiritSay('You must know the sudo password. Combine the three fragments you found.');
          break;
        }
        if (fileNode.type === 'boss') {
          print('rm: cannot remove \'V1rUs_c0R3\': Permission denied. Use "sudo rm V1rUs_c0R3" and enter the password.', 'error');
          break;
        }
        if (fileNode.type === 'corrupted' || fileNode.type === 'corrupted_folder') {
          removedPaths.add(filePath);
          print('Corruption destroyed. "' + arg + '" removed.', 'success');
          if (arg === 'Badfile_emiter')
            spiritSay('Badfile_emiter destroyed. The virus can\'t spread. Your home is unsealed.');
          checkSystemIntegrity();
        } else if (fileNode.type === 'dir') {
          print('rm: cannot remove \'' + arg + '\': Is a directory', 'error');
        } else {
          print('Removed.', 'success');
        }
        break;
      }

      case 'mkdir': {
        if (!arg) {
          print('mkdir: missing operand', 'error');
          break;
        }
        const dirname = arg.trim();
        if (!/^[a-zA-Z0-9_.-]+$/.test(dirname)) {
          print('mkdir: invalid directory name. Use letters, numbers, _ . -', 'error');
          break;
        }
        if (addNodeAtCwd(dirname, { type: 'dir', desc: 'A directory you created.', children: {} })) {
          print('mkdir: created directory \'' + dirname + '\'', 'success');
        } else {
          print('mkdir: cannot create directory \'' + dirname + '\': File exists', 'error');
        }
        break;
      }

      case 'touch': {
        if (!arg) {
          print('touch: missing file operand', 'error');
          break;
        }
        const filename = arg.trim();
        if (!/^[a-zA-Z0-9_.-]+(\.[a-zA-Z0-9]+)?$/.test(filename)) {
          print('touch: invalid filename. Use letters, numbers, _ . -', 'error');
          break;
        }
        if (addNodeAtCwd(filename, { type: 'file', content: '', writable: true })) {
          print('touch: created empty file \'' + filename + '\'', 'success');
        } else {
          print('touch: cannot create file \'' + filename + '\': File exists', 'error');
        }
        break;
      }

      case 'rmdir': {
        if (!arg) {
          print('rmdir: missing operand', 'error');
          break;
        }
        const targetPath = resolvePath(cwd, arg);
        const node = getNode(targetPath);
        if (!node) {
          print('rmdir: failed to remove \'' + arg + '\': No such file or directory', 'error');
          break;
        }
        if (node.type !== 'dir') {
          print('rmdir: failed to remove \'' + arg + '\': Not a directory', 'error');
          break;
        }
        // Prevent deletion of critical system directories
        if (CRITICAL_PATHS.includes(targetPath) || targetPath === 'home' || targetPath.startsWith('home/')) {
          print('rmdir: cannot remove \'' + arg + '\': System directory', 'error');
          break;
        }
        // Cannot remove current directory or its ancestor
        if (targetPath === cwd || targetPath === resolvePath(cwd, '..')) {
          print('rmdir: cannot remove current or parent directory', 'error');
          break;
        }
        if (removeEmptyDir(targetPath)) {
          print('rmdir: removed directory \'' + arg + '\'', 'success');
          checkSystemIntegrity();
        } else {
          print('rmdir: failed to remove \'' + arg + '\': Directory not empty', 'error');
        }
        break;
      }

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
        
        const sudoCmd = (restParts[0] || '').toLowerCase();
        const sudoArg = restParts.slice(1).join(' ').trim();
        
        // ----- Handle apt commands -----
        if (sudoCmd === 'apt') {
          const aptSubCmd = (restParts[1] || '').toLowerCase();
          const aptArg = restParts.slice(2).join(' ').trim();
          
          // apt update
          if (aptSubCmd === 'update') {
            print('Reading package lists... Done', 'system');
            print('Building dependency tree... Done', 'system');
            print('All packages up to date.', 'success');
            aptUpdated = true;
            spiritSay('Package lists refreshed. Run "sudo apt upgrade" to install updates.');
            break;
          }
          
          // apt upgrade
          if (aptSubCmd === 'upgrade') {
            if (!aptUpdated) {
              print('E: apt upgrade requires apt update first. Run "sudo apt update".', 'error');
              break;
            }
            print('Reading package lists... Done', 'system');
            print('Building dependency tree... Done', 'system');
            print('Calculating upgrade... Done', 'system');
            print('The following packages will be upgraded:', 'system');
            print('  libc6 (2.31-0ubuntu9.3) -> 2.31-0ubuntu9.4', 'system');
            print('  systemd (245.4-4ubuntu3) -> 245.4-4ubuntu3.1', 'system');
            print('  openssl (1.1.1f-1ubuntu2) -> 1.1.1f-1ubuntu2.1', 'system');
            print('  system-lib (2.1.0) -> 2.2.0', 'system');
            print('', 'system');
            print('Do you want to continue? [Y/n]', 'system');
            // Store pending apt upgrade
            inputEl.dataset.aptUpgradePending = '1';
            inputEl.placeholder = '(type Y or n)';
            inputEl.focus();
            break;
          }
          
          // apt clean
          if (aptSubCmd === 'clean') {
            if (!aptUpgraded) {
              print('E: apt clean requires apt upgrade first. Run "sudo apt upgrade".', 'error');
              break;
            }
            // Clear the apt archives
            const archives = getNode('var/cache/apt/archives');
            if (archives && archives.children) {
              Object.keys(archives.children).forEach(key => {
                delete archives.children[key];
              });
            }
            print('Reading package lists... Done', 'system');
            print('Deleting cached package files... Done', 'system');
            print('Freed 45.2 MB of disk space.', 'success');
            aptCleaned = true;
            spiritSay('Cache cleaned. Run "sudo apt autoremove" to remove unused dependencies.');
            break;
          }
          
          // apt autoremove
          if (aptSubCmd === 'autoremove') {
            if (!aptCleaned) {
              print('E: apt autoremove requires apt clean first. Run "sudo apt clean".', 'error');
              break;
            }
            print('Reading package lists... Done', 'system');
            print('Building dependency tree... Done', 'system');
            print('The following packages will be REMOVED:', 'system');
            print('  old-dependency-1.0', 'system');
            print('  unused-lib-2.1', 'system');
            print('  deprecated-tool-1.2', 'system');
            print('Removing unused packages... Done', 'success');
            aptAutoremoved = true;
            spiritSay('System maintenance complete. Now install protection: sudo apt install antivirus');
            break;
          }
          
          // apt install
          if (aptSubCmd === 'install') {
            if (!aptAutoremoved) {
              print('E: apt install requires completing system maintenance first.', 'error');
              print('Run: sudo apt update && sudo apt upgrade && sudo apt clean && sudo apt autoremove', 'system');
              break;
            }
            
            if (aptArg === 'antivirus') {
              // Prompt for password
              spiritSay('The spirit asks: "What is the sudo password?"');
              print('[sudo] password for ' + (userName || 'user') + ': ', 'system');
              inputEl.dataset.sudoTarget = 'install_antivirus';
              inputEl.dataset.sudoPending = '1';
              inputEl.placeholder = '(type password and press Enter)';
              inputEl.focus();
              break;
            }
            
            if (aptArg === 'firewall') {
              if (!antivirusInstalled) {
                print('E: firewall requires antivirus to be installed first.', 'error');
                print('Run: sudo apt install antivirus', 'system');
                break;
              }
              if (badfilesRemoved < 20) {
                print('E: firewall requires all threats to be removed first.', 'error');
                print('Run antivirus to remove all ' + badfilesRemoved + '/20 threats detected.', 'system');
                break;
              }
              // Prompt for password
              spiritSay('The spirit asks: "What is the sudo password?"');
              print('[sudo] password for ' + (userName || 'user') + ': ', 'system');
              inputEl.dataset.sudoTarget = 'install_firewall';
              inputEl.dataset.sudoPending = '1';
              inputEl.placeholder = '(type password and press Enter)';
              inputEl.focus();
              break;
            }
            
            print('E: Unknown package: ' + aptArg, 'error');
            print('Available packages: antivirus, firewall', 'system');
            break;
          }
          
          // Unknown apt subcommand
          print('apt: Unknown subcommand: ' + aptSubCmd, 'error');
          print('Usage: apt update | apt upgrade | apt clean | apt autoremove | apt install <package>', 'system');
          break;
        }
        
        // ----- Handle rm command -----
        if (sudoCmd !== 'rm' || !sudoArg) {
          print('Usage: sudo rm <target>', 'system');
          print('You will be prompted for the password.', 'system');
          break;
        }
        const sudoPathParts = cwd.split('/').filter(Boolean);
        sudoPathParts.push(sudoArg);
        const sudoFullPath = sudoPathParts.join('/');
        const sudoNode = getNode(sudoFullPath);
        if (!sudoNode || (sudoNode.type !== 'boss' && sudoNode.type !== 'corrupted_folder')) {
          print('sudo rm: ' + sudoArg + ': No such file or directory, or target does not require sudo.', 'error');
          break;
        }
        spiritSay('The spirit asks: "What is the sudo password?" Type it when prompted.');
        print('[sudo] password for ' + (userName || 'user') + ': ', 'system');
        inputEl.placeholder = '(type password and press Enter)';
        inputEl.dataset.sudoTarget = sudoFullPath;
        inputEl.dataset.sudoPending = '1';
        inputEl.focus();
        break;
      }

      case 'echo': {
        const rest = trimmed.replace(/^\s*echo\s+/i, '').trim();

        // Match > and >> redirection
        const redirMatch = rest.match(/^(.+?)\s*(>>?)\s*([^\s]+)$/);
        if (redirMatch) {
          let [, content, op, filename] = redirMatch;
          // Remove surrounding quotes if present
          content = content.replace(/^["']|["']$/g, '');

          const filePath = resolvePath(cwd, filename);
          let fileNode = getNode(filePath);

          // If file doesn't exist and we are writing, create it (like real touch)
          if (!fileNode) {
            const parentPath = filePath.split('/').slice(0, -1).join('/');
            const parent = getNode(parentPath);
            if (!parent || parent.type !== 'dir') {
              print('echo: cannot create file: No such directory', 'error');
              break;
            }
            const newFile = { type: 'file', content: '', writable: true };
            const fileName = filePath.split('/').pop();
            parent.children[fileName] = newFile;
            fileNode = newFile;
            print('echo: created file \'' + fileName + '\'', 'success');
          }

          if (fileNode.type !== 'file') {
            print('echo: cannot write to \'' + filename + '\': Not a regular file', 'error');
            break;
          }
          if (!fileNode.writable) {
            print('echo: permission denied: \'' + filename + '\' is read-only', 'error');
            break;
          }

          // Special handling for journal in bedroom
          if (filePath === 'home/bedroom/journal' && op === '>>') {
            journalEntries.push(content);
            print('(appended to journal)', 'success');
            break;
          }

          if (op === '>') {
            fileNode.content = content;
            print('(overwritten)', 'success');
            
            // Check for Act 2 completion: config.txt moved to /etc/firewall/ or backup created
            if (filePath.startsWith('etc/firewall/') || filePath.startsWith('/etc/firewall/')) {
              const fileName = filePath.split('/').pop();
              if (fileName === 'config.txt' || fileName !== 'old_firewall') {
                print('');
                print('═══════════════════════════════════════════════════════════════', 'quest');
                print('  *** ACT 2 COMPLETE ***', 'quest');
                print('═══════════════════════════════════════════════════════════════', 'quest');
                print('');
                print('Firewall configuration complete! Your system is now protected.', 'success');
                print('');
                spiritSay('Congratulations! You have completed all acts in Terminus. The system is safe.');
                print('');
                print('Type "reset" to play again.', 'system');
              }
            }
          } else { // '>>'
            fileNode.content = (fileNode.content || '') + content + '\n';
            print('(appended)', 'success');
          }
          break;
        }

        // No redirection: just print the text
        print(rest.replace(/^["']|["']$/g, ''), 'system');
        break;
      }

      case 'unlock': {
        if (!arg) {
          print('unlock: usage: unlock <password>', 'error');
          print('If you know the password, type: unlock <password>', 'system');
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

      case 'man': {
        const topic = (arg || '').toLowerCase();
        
        // Determine mission based on current act
        const act2Mission = 'MISSION: Run system maintenance (apt update → upgrade → clean → autoremove) → Install antivirus (sudo apt install antivirus) → Run scan (antivirus) → Install firewall (sudo apt install firewall) → Extract and configure firewall';
        const act1Mission = 'MISSION: Find 3 password fragments in the house → Destroy Badfile_emiter in forest cave → Unlock home → Remove V1rUs_c0R3 from basement → Run system maintenance (apt update/upgrade/clean/autoremove) → Install antivirus → Install firewall';
        
        const manPages = {
          '': bossDefeated ? act2Mission : act1Mission,
          ls: 'List files and directories in current location.\n\nExample: ls',
          cd: 'Change directory. Use "cd .." to go back.\n\nExamples:\n  cd livingroom   (enter a room)\n  cd ..          (go back/up)\n  cd /            (go to root)',
          cat: 'Read and display file contents.\n\nExamples:\n  cat note        (read a file called "note")\n  cat sticky_note (read a file)',
          rm: 'Remove/delete files. Use "sudo rm" for locked files.\n\nExamples:\n  rm badfile           (delete a file)\n  sudo rm Badfile_emiter (delete locked file)',
          pwd: 'Print current directory path.\n\nExample: pwd',
          echo: 'Display text or write to files using > or >>.\n\nExamples:\n  echo "Hello world"              (print text)\n  echo "text" > file.txt           (write to file)\n  echo "text" >> file.txt          (append to file)',
          mkdir: 'Create a new directory.\n\nExample: mkdir myfolder',
          touch: 'Create an empty file.\n\nExample: touch myfile.txt',
          rmdir: 'Remove an empty directory.\n\nExample: rmdir myfolder',
          sudo: 'Run commands as superuser. Required for boss files and package management.\n\nExamples:\n  sudo rm Badfile_emiter (destroy virus emitter)\n  sudo apt update     (refresh package lists)\n  sudo apt upgrade    (install updates)\n  sudo apt install antivirus',
          unlock: 'Unlock doors using the password.\n\nExample: unlock password1',
          apt: 'Package manager. Run in sequence: update → upgrade → clean → autoremove → install.\n\nExamples:\n  sudo apt update       (refresh package lists)\n  sudo apt upgrade      (install updates)\n  sudo apt clean        (clear cache)\n  sudo apt autoremove   (remove unused packages)\n  sudo apt install antivirus',
          antivirus: 'Run antivirus scan to find and remove malware.\n\nExamples:\n  antivirus  (scan and remove badfiles)\n\nNote: Install first with sudo apt install antivirus',
          tar: 'Extract compressed archives.\n\nExamples:\n  tar -xzf file.tar.gz  (extract archive)',
          mv: 'Move or rename files and directories.\n\nExamples:\n  mv oldname.txt newname.txt  (rename)\n  mv file.txt /path/to/dir/   (move to directory)',
          cp: 'Copy files. Use -r for directories.\n\nExamples:\n  cp file1.txt file2.txt  (copy file)\n  cp file.txt /path/to/dir/   (copy to directory)',
          help: 'Show available commands.\n\nExample: help',
          clear: 'Clear the terminal screen.\n\nExample: clear'
        };
        const msg = manPages[topic] || 'Unknown command. Try: man ls, man cd, man cat, man rm, man apt, man antivirus';
        printLines(msg, 'less-content');
        break;
      }

      case 'help': {
        print('Commands:', 'system');
        if (bossDefeated) {
          print('  sudo apt update | upgrade | clean | autoremove', 'system');
          print('  sudo apt install antivirus | firewall', 'system');
          print('  antivirus  (scan for malware)', 'system');
          print('  tar -xzf  (extract archives)', 'system');
          print('  cd, ls, pwd, cat, rm, mkdir, touch, clear, man', 'system');
        } else {
          print('  ls, cd, pwd, cat, echo, rm, mkdir, touch, rmdir, man, sudo, unlock, clear, help', 'system');
          print('  tar, antivirus - Act 2 commands', 'system');
        }
        print('  man — spirit guide. Try "man" or "man apt"', 'system');
        break;
      }

      case 'clear': {
        terminalLines.length = 0;
        output.innerHTML = '';
        break;
      }

      case 'reset': {
        print('Resetting system...', 'system');
        setTimeout(() => resetGame(), 1500);
        break;
      }

      // Debug command to skip to Act 2
      case 'act2': {
        if (bossDefeated) {
          print('Act 2 already available!', 'system');
          break;
        }
        // Set all Act 1 completion states
        bossDefeated = true;
        homeUnlocked = true;
        fragmentsFound = new Set(['pass', 'word', '1']);
        // Add all fragments to journal
        const journal = getNode('home/bedroom/journal');
        if (journal) {
          journal.fragment = 'all';
        }
        print('Skipping to Act 2...', 'success');
        victoryMessage();
        break;
      }

      // ----- Act 2 Commands -----
      case 'antivirus': {
        if (!antivirusInstalled) {
          print('antivirus: command not found. Install with: sudo apt install antivirus', 'error');
          break;
        }
        print('Starting antivirus scan...', 'system');
        print('', 'system');
        
        // Scan the filesystem for badfiles
        const badfilePaths = [];
        function findBadfiles(node, path) {
          if (!node || !node.children) return;
          for (const [name, child] of Object.entries(node.children)) {
            const fullPath = path ? path + '/' + name : name;
            if (name === 'badfile' && child.type === 'file' && !removedPaths.has(fullPath)) {
              badfilePaths.push(fullPath);
            }
            if (child.type === 'dir') {
              findBadfiles(child, fullPath);
            }
          }
        }
        findBadfiles(fs[''], '');
        
        if (badfilePaths.length === 0) {
          print('Scan complete. No threats found. (Total removed: ' + badfilesRemoved + ')', 'success');
          if (badfilesRemoved >= 20) {
            spiritSay('All threats eliminated! You can now install the firewall: sudo apt install firewall');
          } else {
            spiritSay(badfilesRemoved + ' threats removed so far. Run antivirus again if more threats appear.');
          }
          break;
        }
        
        // Scan and remove each badfile
        let index = 0;
        function scanNext() {
          if (index < badfilePaths.length) {
            const path = badfilePaths[index];
            print('Scanning /' + path + '...', 'system');
            setTimeout(() => {
              print('  INFECTED → REMOVED', 'error');
              removedPaths.add(path);
              badfilesRemoved++;
              index++;
              if (index < badfilePaths.length) {
                scanNext();
              } else {
                // All done
                print('', 'system');
                print('Scan complete. ' + badfilePaths.length + ' threats neutralized.', 'success');
                if (badfilesRemoved >= 20) {
                  spiritSay('All threats eliminated. Now install firewall: sudo apt install firewall');
                } else {
                  spiritSay(badfilesRemoved + ' threats eliminated. Continue scanning if more remain.');
                }
              }
            }, 100);
          }
        }
        scanNext();
        break;
      }

      case 'tar': {
        const parts = arg.split(/\s+/);
        const flags = parts[0] || '';
        const fileArg = parts[1];
        
        if (!flags.includes('x') || !flags.includes('z') || !flags.includes('f')) {
          print('tar: you must specify -xzf flag to extract', 'error');
          print('Usage: tar -xzf <archive.tar.gz>', 'system');
          break;
        }
        
        if (!fileArg) {
          print('tar: no file specified', 'error');
          break;
        }
        
        const filePath = resolvePath(cwd, fileArg);
        const fileNode = getNode(filePath);
        
        if (!fileNode) {
          print('tar: ' + fileArg + ': No such file or directory', 'error');
          break;
        }
        
        if (fileNode.type !== 'file') {
          print('tar: ' + fileArg + ': Not a regular file', 'error');
          break;
        }
        
        // Extract the tarball
        const extractDir = fileArg.replace('.tar.gz', '');
        const parentPath = filePath.split('/').slice(0, -1).join('/');
        const parent = getNode(parentPath);
        
        if (!parent) {
          print('tar: could not access parent directory', 'error');
          break;
        }
        
        // Create extracted directory
        parent.children[extractDir] = {
          type: 'dir',
          desc: 'Extracted firewall package.',
          children: {
            'config.txt': {
              type: 'file',
              content: 'FIREWALL_RULES=strict\nDEFAULT_POLICY=deny\nLOG_LEVEL=verbose',
              writable: true
            }
          }
        };
        
        print('Extracted ' + fileArg + ' to ' + extractDir + '/', 'success');
        print('', 'system');
        print('Contents:', 'system');
        print('  config.txt', 'system');
        print('', 'system');
        spiritSay('Firewall extracted! Now: 1) cat config.txt to see new rules, 2) mv config.txt /etc/firewall/ to install, 3) cd /etc/firewall, 4) backup new config with echo > backup.txt');
        break;
      }

      case 'mv': {
        const mvParts = arg.split(/\s+/);
        if (mvParts.length < 2) {
          print('mv: missing file operand', 'error');
          print('Usage: mv <source> <destination>', 'system');
          break;
        }
        const source = mvParts[0];
        const dest = mvParts[1];
        
        const sourcePath = resolvePath(cwd, source);
        const sourceNode = getNode(sourcePath);
        
        if (!sourceNode) {
          print('mv: cannot stat \'' + source + '\': No such file or directory', 'error');
          break;
        }
        
        // Check if destination is a directory
        const destPath = resolvePath(cwd, dest);
        const destNode = getNode(destPath);
        
        if (destNode && destNode.type === 'dir') {
          // Moving into a directory
          const fileName = source.split('/').pop();
          const newPath = destPath ? destPath + '/' + fileName : fileName;
          const newParent = getNode(destPath);
          
          if (newParent && newParent.children) {
            newParent.children[fileName] = sourceNode;
            // Remove from old location
            const parentPath = sourcePath.split('/').slice(0, -1).join('/');
            const oldParent = getNode(parentPath);
            if (oldParent) {
              delete oldParent.children[source.split('/').pop()];
            }
            print('renamed \'' + source + '\' -> \'' + dest + '/' + fileName + '\'', 'success');
            
            // Check for Act 2 completion: config.txt moved to /etc/firewall/
            if (newPath === 'etc/firewall/config.txt' || newPath === '/etc/firewall/config.txt') {
              print('');
              print('═══════════════════════════════════════════════════════════════', 'quest');
              print('  *** ACT 2 COMPLETE ***', 'quest');
              print('═══════════════════════════════════════════════════════════════', 'quest');
              print('');
              print('Firewall configuration complete! Your system is now protected.', 'success');
              print('');
              spiritSay('Congratulations! You have completed all acts in Terminus. The system is safe.');
              print('');
              print('Type "reset" to play again.', 'system');
            }
          }
        } else {
          // Renaming in place
          const parentPath = sourcePath.split('/').slice(0, -1).join('/');
          const parent = getNode(parentPath);
          
          if (parent) {
            delete parent.children[source.split('/').pop()];
            parent.children[dest] = sourceNode;
            print('renamed \'' + source + '\' -> \'' + dest + '\'', 'success');
          }
        }
        break;
      }

      case 'cp': {
        const cpParts = arg.split(/\s+/);
        if (cpParts.length < 2) {
          print('cp: missing file operand', 'error');
          print('Usage: cp <source> <destination>', 'system');
          break;
        }
        const source = cpParts[0];
        const dest = cpParts[1];
        
        const sourcePath = resolvePath(cwd, source);
        const sourceNode = getNode(sourcePath);
        
        if (!sourceNode) {
          print('cp: cannot stat \'' + source + '\': No such file or directory', 'error');
          break;
        }
        
        if (sourceNode.type === 'dir') {
          print('cp: -r not specified; omitting directory \'' + source + '\'', 'error');
          break;
        }
        
        // Deep copy the node
        const destPath = resolvePath(cwd, dest);
        const destNode = getNode(destPath);
        
        if (destNode && destNode.type === 'dir') {
          // Copying into a directory
          const fileName = source.split('/').pop();
          const newParent = getNode(destPath);
          if (newParent && newParent.children) {
            newParent.children[fileName] = JSON.parse(JSON.stringify(sourceNode));
            print('copied \'' + source + '\' -> \'' + dest + '/' + fileName + '\'', 'success');
          }
        } else {
          // Copying to a new file
          const parentPath = destPath.split('/').slice(0, -1).join('/');
          const parent = getNode(parentPath);
          
          if (parent) {
            parent.children[dest] = JSON.parse(JSON.stringify(sourceNode));
            print('copied \'' + source + '\' -> \'' + dest + '\'', 'success');
          }
        }
        break;
      }

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
    }
  }

  function startAct1() {
    // Clear terminal history array and DOM
    terminalLines.length = 0;
    output.innerHTML = '';
    print('═══════════════════════════════════════════════════════════════', 'quest');
    print('  ACT 1: SYSTEM RECOVERY', 'quest');
    print('═══════════════════════════════════════════════════════════════', 'quest');
    print('');
    print('Your home network has been compromised.', 'system');
    print('Malware locked down multiple rooms. You\'ve lost access to your password.', 'system');
    print('The basement holds the infection core, but it\'s sealed.', 'system');
    print('');
    print('Start by clearing the living room and kitchen.', 'system');
    print('When you\'re ready, head outside to the forest.', 'system');
    print('');
    spiritSay('I\'ll help you recover. Type "man" for commands.');
    print('');
    print('You are in /home. Type "ls" to see what\'s here.', 'system');
    print('Type "cd <directory>" to enter a room (e.g., cd livingroom).', 'system');
    print('Type "cd .." to go back up a level.', 'system');
    showCommandHints();
    print('');
    print('Your mission:', 'quest');
    print('1. Explore the house: cd livingroom, cd kitchen', 'system');
    print('2. Find password fragments: cat sticky_note, cat drawer, cat clock', 'system');
    print('3. Go outside: cd .. (to /), cd forest, cd cave', 'system');
    print('4. Destroy Badfile_emiter: sudo rm Badfile_emiter', 'system');
    print('5. Return home and unlock all doors: unlock <password>', 'system');
    print('6. Enter basement: cd home, cd basement', 'system');
    print('7. Remove the virus: sudo rm V1rUs_c0R3', 'system');
    print('');
    cwd = 'home';
    setPrompt();
  }

  function victoryMessage() {
    // Full reset for Act 2 - clear terminal and filesystem, start fresh
    
    // Clear terminal history array and DOM FIRST
    terminalLines.length = 0;
    output.innerHTML = '';
    
    // Reset removedPaths BEFORE resetting filesystem
    // This ensures badfiles are "found" again in the fresh filesystem
    removedPaths.clear();
    
    // Reset filesystem to initial state (restores all badfiles for Act 2)
    fs = JSON.parse(JSON.stringify(INITIAL_FS));
    
    // Reset game state but keep Act 1 completion flags
    cwd = 'home';
    fragmentsFound.clear();
    journalEntries.length = 0;
    bedroomEchoTaught = false;
    
    // Reset Act 2 state variables for fresh start
    aptUpdated = false;
    aptUpgraded = false;
    aptCleaned = false;
    aptAutoremoved = false;
    antivirusInstalled = false;
    firewallDownloaded = false;
    badfilesRemoved = 0;
    
    // Keep Act 1 completion flags
    // bossDefeated = true (already set before calling victoryMessage)
    // homeUnlocked = true (already set when doors were unlocked)
    
    // Update prompt for fresh start
    setPrompt();
    
    print('');
    print('═══════════════════════════════════════════════════════════════', 'quest');
    print('  *** SYSTEM RECOVERY COMPLETE ***', 'quest');
    print('═══════════════════════════════════════════════════════════════', 'quest');
    print('');
    print('The virus core has been deleted. Your home network is now clean.', 'system');
    print('Your memory has been fully restored.', 'system');
    print('');
    print('═══════════════════════════════════════════════════════════════', 'quest');
    print('  ACT 2: SYSTEM HARDENING', 'quest');
    print('═══════════════════════════════════════════════════════════════', 'quest');
    print('');
    print('The system is still vulnerable. Run maintenance to strengthen it:', 'system');
    print('');
    print('Step 1: sudo apt update', 'system');
    print('Step 2: sudo apt upgrade (type Y to confirm)', 'system');
    print('Step 3: sudo apt clean', 'system');
    print('Step 4: sudo apt autoremove', 'system');
    print('Step 5: sudo apt install antivirus', 'system');
    print('Step 6: antivirus', 'system');
    print('Step 7: sudo apt install firewall', 'system');
    print('');
    spiritSay('Begin system maintenance: sudo apt update');
    print('');
    print('Type "reset" to play again.', 'system');
    print('');
  }

  function handleSudoPassword(line) {
    const target = inputEl.dataset.sudoTarget || '';
    delete inputEl.dataset.sudoTarget;
    delete inputEl.dataset.sudoPending;
    inputEl.placeholder = '';
    const password = line.trim();
    if (password !== PASSWORD) {
      print(password ? '(wrong password)' : '', 'error');
      print('sudo: 1 incorrect password attempt', 'error');
      setPrompt();
      return;
    }
    print('[sudo] password accepted.', 'success');
    
    // Handle package installations
    if (target === 'install_antivirus') {
      print('Installing antivirus...', 'system');
      print('Downloading package... Done', 'system');
      print('Extracting files... Done', 'system');
      print('Setting up antivirus... Done', 'system');
      print('Antivirus installed successfully.', 'success');
      print('', 'system');
      print('Type "antivirus" to run a system scan.', 'system');
      spiritSay('Antivirus installed. Type "antivirus" to run system scan.');
      antivirusInstalled = true;
      setPrompt();
      return;
    }
    
    if (target === 'install_firewall') {
      print('Installing firewall...', 'system');
      print('', 'system');
      print('Downloading firewall.tar.gz...', 'system');
      // Simulate download progress
      setTimeout(() => print('0%...', 'system'), 100);
      setTimeout(() => print('25%...', 'system'), 300);
      setTimeout(() => print('50%...', 'system'), 500);
      setTimeout(() => print('75%...', 'system'), 700);
      setTimeout(() => {
        print('100%', 'system');
        print('Download complete: firewall.tar.gz', 'success');
        print('', 'system');
        // Create the firewall tarball in tmp/downloads
        const downloads = getNode('tmp/downloads');
        if (downloads && downloads.children) {
          downloads.children['firewall.tar.gz'] = {
            type: 'file',
            content: 'FIREWALL_RULES=strict\nDEFAULT_POLICY=deny\nLOG_LEVEL=verbose'
          };
        }
        firewallDownloaded = true;
        spiritSay('Package downloaded to /tmp/downloads/. Extract and install: cd /tmp/downloads, then tar -xzf firewall.tar.gz');
        setPrompt();
      }, 900);
      return;
    }
    
    const node = getNode(target);
    if (node && node.type === 'boss') {
      bossDefeated = true;
      removedPaths.add(target);
      print('', 'system');
      print('You enter the password.', 'system');
      print('', 'system');
      print('A pause. Then: SUDO ACCESS GRANTED.', 'success');
      print('', 'system');
      print('The virus core screams—a raw system frequency. Its code unravels, deleted line by line. The corruption bleeds away from the walls.', 'system');
      print('', 'system');
      print('The basement falls silent. Your home network is now clean.', 'system');
      print('', 'system');
      print('*** SYSTEM RECOVERY COMPLETE ***', 'quest');
      print('', 'system');
      print('V1rUs_c0R3 has been removed. Root access restored.', 'system');
      print('', 'system');
      spiritSay('Recovery complete. System secured.');
      checkSystemIntegrity();
    } else if (node && node.type === 'corrupted_folder') {
      removedPaths.add(target);
      homeUnlocked = true;
      print('Badfile_emiter collapses. The cave falls silent.', 'success');
      print('', 'system');
      print('Across the filesystem, locks disengage. Your home unseals, room by room.', 'system');
      print('', 'system');
      print('The virus lost its mobility. Now it\'s trapped. Waiting in the basement.', 'system');
      spiritSay('Badfile_emiter destroyed. Your home is now unsealed. Return to /home and clear the basement: cd home, then cd basement. Use "sudo rm V1rUs_c0R3" to finish this.');
      checkSystemIntegrity();
    } else {
      print('sudo rm: target not found or already removed.', 'system');
    }
    setPrompt();
  }

  function onSubmit(line) {
    if (gameMode === 'name') {
      userName = line.trim() || 'Traveler';
      gameMode = 'play';
      print('Welcome, ' + userName + '.', 'success');
      print('');
      startAct1();
      return;
    }
    
    // Handle apt upgrade confirmation
    if (inputEl.dataset.aptUpgradePending === '1') {
      delete inputEl.dataset.aptUpgradePending;
      inputEl.placeholder = '';
      const response = line.trim().toLowerCase();
      if (response === 'y' || response === 'yes' || response === '') {
        print('Y', 'system');
        print('Get:1 http://archive.ubuntu.com focal InRelease [234 kB]', 'system');
        print('Get:2 http://security.ubuntu.com focal-security InRelease [45.6 kB]', 'system');
        print('Reading state information... Done', 'system');
        print('Preparing to upgrade... Done', 'system');
        print('Unpacking replacement libc6... Done', 'system');
        print('Setting up libc6 (2.31-0ubuntu9.4)... Done', 'system');
        print('Unpacking replacement systemd... Done', 'system');
        print('Setting up systemd (245.4-4ubuntu3.1)... Done', 'system');
        print('Processing triggers for man-db... Done', 'system');
        print('', 'system');
        print('System packages upgraded.', 'success');
        aptUpgraded = true;
        spiritSay('System packages upgraded. Run "sudo apt clean" to clear cache.');
      } else {
        print(response || 'n', 'system');
        print('Upgrade aborted.', 'system');
      }
      setPrompt();
      return;
    }
    
    if (inputEl.dataset.sudoPending === '1') {
      handleSudoPassword(line);
      return;
    }
    runCommand(line);
  }

  function promptName() {
    print('═══════════════════════════════════════════════════════════════', 'quest');
    print('  TERMINUS — SYSTEM RECOVERY', 'quest');
    print('═══════════════════════════════════════════════════════════════', 'quest');
    print('');
    print('What do you wish to be called?', 'quest');
    print('');
    promptText = '❯ ';
    promptEl.innerHTML = '<span class="p10k-arrow">❯</span>';
  }

  // ----- Init -----
  setPrompt();
  promptName();

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const line = inputEl.value;
      history.push(line);
      historyIndex = history.length;
      onSubmit(line);
      inputEl.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputEl.value = history[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length) {
        historyIndex++;
        inputEl.value = historyIndex < history.length ? history[historyIndex] : '';
      }
    }
  });

  inputEl.addEventListener('click', () => inputEl.focus());
  document.body.addEventListener('click', () => inputEl.focus());
})();
