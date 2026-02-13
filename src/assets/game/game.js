/**
 * Terminus — ACT 1: The Forgotten Password
 * Terminal learning game. Commands: ls, cd, pwd, cat, rm, mkdir, touch, rmdir, echo, man, sudo, unlock, help, clear
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
                badfile: { type: 'corrupted', name: 'badfile' }
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
                badfile: { type: 'corrupted', name: 'badfile' }
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
                badfile: { type: 'corrupted', name: 'badfile' }
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
                badfile: { type: 'corrupted', name: 'badfile' }
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
                badfile: { type: 'corrupted', name: 'badfile' }
              }
            },
            attic: {
              type: 'dir',
              desc: 'The attic. Storage for forgotten data. Cardboard boxes have missing textures. Cobwebs look like severed network connections.',
              children: {
                old_disk: {
                  type: 'file',
                  content: 'An old 3.5" floppy disk. The label reads:\n\n*"BACKUP PASSWORD - BREAK GLASS IN CASE OF APOCALYPSE password1"*\n\n<<MEMORY RESTORED: FULL SUDO PASSWORD IS password1>>'
                }
              }
            },
            basement: {
              type: 'dir',
              desc: 'The basement. The infection core V1rUs_c0R3 is here. Root access required to remove it.',
              children: {
                V1rUs_c0R3: {
                  type: 'boss',
                  content: 'V1RUS CORE DETECTED\n\nA corrupted data mass blocks the basement. It\'s been here the whole time.\n\nRoot access required to delete.\n\n>> sudo rm V1rUs_c0R3'
                }
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
                badfile: { type: 'corrupted', name: 'badfile' }
              }
            },
            cave: {
              type: 'dir',
              desc: 'A dark cave. The walls show raw, hexadecimal code. Inside is Badfile_emiter—a corrupted folder. It can only be destroyed with root access.',
              children: {
                badfile: { type: 'corrupted', name: 'badfile' },
                Badfile_emiter: { type: 'corrupted_folder', name: 'Badfile_emiter' }
              }
            }
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

  function print(text, className = '') {
    const line = document.createElement('div');
    line.className = 'line' + (className ? ' ' + className : '');
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function printLsLine(names, path) {
    const line = document.createElement('div');
    line.className = 'line';
    const node = getNode(path);
    const children = node && node.children || {};
    names.forEach((name, i) => {
      if (i > 0) line.appendChild(document.createTextNode('  '));
      const span = document.createElement('span');
      const child = children[name];
      if (child.type === 'dir') span.className = 'ls-dir';
      else if (child.type === 'corrupted' || child.type === 'corrupted_folder' || child.type === 'boss') span.className = 'ls-bad';
      else span.className = 'ls-file';
      span.textContent = name;
      line.appendChild(span);
    });
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
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

    // Clear screen and start over
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
        const sudoCmd = (rest.split(/\s+/)[0] || '').toLowerCase();
        const sudoArg = rest.split(/\s+/).slice(1).join(' ').trim();
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
          break;
        }
        if (arg !== PASSWORD) {
          print('unlock: wrong password. The doors stay locked.', 'error');
          spiritSay('Wrong combination. The fragments must be in order: pass + word + 1.');
          break;
        }
      homeUnlocked = true;
      print('The locks click open. All doors in your home are now unlocked.', 'success');
      spiritSay('Doors unsealed. Access restored. The infection core V1rUs_c0R3 is in the basement. Use sudo when ready.');
      setPrompt();
        break;
      }

      case 'man': {
        const topic = (arg || '').toLowerCase();
        const manPages = {
          '': 'I\'m the system daemon. Type "man" for help with commands. Goal: find password fragments, clear Badfile_emiter in the forest, then remove V1rUs_c0R3 from the basement.',
          ls: 'LS(1)\n\n  ls — list directory contents\n\n  Use "ls" to see files and directories in your current location. Try it now.',
          cd: 'CD(1)\n\n  cd <directory> — change directory\n\n  Move into a place: "cd livingroom". Go back: "cd ..".',
          pwd: 'PWD(1)\n\n  pwd — print name of current directory\n\n  Shows your full path, e.g. /home/kitchen.',
          cat: 'CAT(1)\n\n  cat <file> — read and display file contents\n\n  Read a file without changing anything. Example: "cat sticky_note".',
          rm: 'RM(1)\n\n  rm <file> — remove files\n\n  Here, "rm" destroys corrupted files. "rm badfile". Some targets require "sudo rm".',
          sudo: 'SUDO(8)\n\n  sudo rm <target> — run remove as superuser\n\n  Badfile_emiter (forest cave) and V1rUs_c0R3 (basement) require sudo. Password = three fragments combined.',
          unlock: 'UNLOCK(1)\n\n  unlock <password> — unlock locked doors\n\n  Use password from fragments (pass+word+1 = password1). Or destroy Badfile_emiter in forest cave: "sudo rm Badfile_emiter".',
          echo: 'ECHO(1)\n\n  echo <text> — display text\n  echo <text> > <file> — overwrite file with text\n  echo <text> >> <file> — append text to file\n\n  Files are created automatically if they don\'t exist. Use quotes for text with spaces.',
          mkdir: 'MKDIR(1)\n\n  mkdir <directory> — create an empty directory\n\n  Example: mkdir documents',
          touch: 'TOUCH(1)\n\n  touch <file> — create an empty file\n\n  Example: touch notes.txt',
          rmdir: 'RMDIR(1)\n\n  rmdir <directory> — remove an empty directory\n\n  Cannot delete system directories. Example: rmdir oldfolder'
        };
        const msg = manPages[topic] || manPages[''];
        printLines(msg, 'less-content');
        break;
      }

      case 'help': {
        print('Commands:', 'system');
        print('  ls, cd, pwd, cat, echo, rm, mkdir, touch, rmdir, man, sudo, unlock, clear, help', 'system');
        print('  man — spirit guide. Try "man" or "man ls"', 'system');
        break;
      }

      case 'clear': {
        output.innerHTML = '';
        break;
      }

      default:
        if (cmd) print('command not found: ' + cmd + '. Type "help" or "man".', 'error');
    }
  }

  function startAct1() {
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
    print('');
    cwd = 'home';
    setPrompt();
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
