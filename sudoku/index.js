// sudoku
// back-end game model and operations

const SIZE = 9;
const BOX = 3;
const EMPTY = 0;

class Sudoku {
  constructor(grid) {
    this.grid = grid
      ? grid.map((row) => row.slice())
      : Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  }

  get(row, col) {
    return this.grid[row][col];
  }

  set(row, col, value) {
    this.grid[row][col] = value;
  }

  clear(row, col) {
    this.grid[row][col] = EMPTY;
  }

  // Returns true if the current values contain no duplicate in any
  // row, column, or 3x3 box. Empty cells are ignored, so a partially
  // filled board can still be valid.
  isValid() {
    return (
      this.rowsValid() &&
      this.columnsValid() &&
      this.boxesValid()
    );
  }

  rowsValid() {
    for (let r = 0; r < SIZE; r++) {
      if (hasDuplicate(this.grid[r])) return false;
    }
    return true;
  }

  columnsValid() {
    for (let c = 0; c < SIZE; c++) {
      const column = [];
      for (let r = 0; r < SIZE; r++) column.push(this.grid[r][c]);
      if (hasDuplicate(column)) return false;
    }
    return true;
  }

  boxesValid() {
    for (let br = 0; br < SIZE; br += BOX) {
      for (let bc = 0; bc < SIZE; bc += BOX) {
        const box = [];
        for (let r = br; r < br + BOX; r++) {
          for (let c = bc; c < bc + BOX; c++) box.push(this.grid[r][c]);
        }
        if (hasDuplicate(box)) return false;
      }
    }
    return true;
  }

  isComplete() {
    return this.grid.every((row) => row.every((v) => v !== EMPTY));
  }

  isSolved() {
    return this.isComplete() && this.isValid();
  }
}

// Checks a group of 9 cells for a repeated non-empty value.
function hasDuplicate(cells) {
  const seen = new Set();
  for (const value of cells) {
    if (value === EMPTY) continue;
    if (seen.has(value)) return true;
    seen.add(value);
  }
  return false;
}

// True if `value` can be placed at (row, col) without conflicting with
// the current row, column, or box.
function canPlace(grid, row, col, value) {
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === value) return false;
    if (grid[i][col] === value) return false;
  }
  const br = row - (row % BOX);
  const bc = col - (col % BOX);
  for (let r = br; r < br + BOX; r++) {
    for (let c = bc; c < bc + BOX; c++) {
      if (grid[r][c] === value) return false;
    }
  }
  return true;
}

function firstEmpty(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === EMPTY) return [r, c];
    }
  }
  return null;
}

function shuffled(values) {
  const arr = values.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const DIGITS = Array.from({ length: SIZE }, (_, i) => i + 1);

const ADJECTIVES = [
  "fast", "slow", "big", "small", "crazy", "sly", "beautiful", "ugly",
  "venomous", "peaceful", "quaint", "horrific", "brave", "clever", "gentle",
  "fierce", "lazy", "noble", "sneaky", "grumpy", "cheerful", "mighty",
  "tiny", "giant", "silent", "loud", "shiny", "rusty", "ancient", "modern",
  "curious", "dizzy", "elegant", "frosty", "golden", "hidden", "jolly",
  "lucky", "mellow", "nimble", "proud", "radiant", "savage", "timid",
  "wild", "witty", "zany", "bold", "dapper", "eager",
];

const ANIMALS = [
  "cat", "dog", "pig", "rabbit", "horse", "cow", "spider", "snake",
  "dragon", "donkey", "hawk", "sparrow", "guppy", "dolphin", "otter",
  "badger", "fox", "wolf", "bear", "moose", "beaver", "raven", "owl",
  "falcon", "lynx", "panther", "leopard", "cheetah", "tiger", "lion",
  "gecko", "iguana", "turtle", "frog", "newt", "crab", "lobster", "shark",
  "whale", "seal", "walrus", "penguin", "flamingo", "heron", "stork",
  "mantis", "beetle", "moth", "hornet", "koala",
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromPuzzle(puzzle) {
  let hash = 2166136261;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = puzzle.get(r, c);
      hash ^= (value === EMPTY ? 0 : value) + 1;
      hash = Math.imul(hash, 16777619);
    }
  }
  return hash >>> 0;
}

function nameFromPuzzle(puzzle) {
  const rand = mulberry32(seedFromPuzzle(puzzle));
  const adjective = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(rand() * ANIMALS.length)];
  return adjective + " " + animal;
}

// Phase 1: fill an empty grid with a complete valid solution using
// randomized backtracking. Trying digits in random order yields a
// different solution on each call.
function fillGrid(grid) {
  const cell = firstEmpty(grid);
  if (!cell) return true;
  const [row, col] = cell;
  for (const value of shuffled(DIGITS)) {
    if (!canPlace(grid, row, col, value)) continue;
    grid[row][col] = value;
    if (fillGrid(grid)) return true;
    grid[row][col] = EMPTY;
  }
  return false;
}

// Full backtracking solution counter. Stops as soon as `limit`
// solutions are found so uniqueness checks stay cheap.
function countSolutions(grid, limit = 2) {
  const cell = firstEmpty(grid);
  if (!cell) return 1;
  const [row, col] = cell;
  let count = 0;
  for (const value of DIGITS) {
    if (!canPlace(grid, row, col, value)) continue;
    grid[row][col] = value;
    count += countSolutions(grid, limit - count);
    grid[row][col] = EMPTY;
    if (count >= limit) break;
  }
  return count;
}

// Generates a fully solved Sudoku.
function generateSolved() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  fillGrid(grid);
  return new Sudoku(grid);
}

// Phase 2 (remove-and-check): start from a full solution and remove
// values one at a time, keeping a removal only while the puzzle still
// has exactly one solution (verified by full backtracking). `clues` is
// an optional lower bound on the number of givens to keep.
function generatePuzzle(clues = 0) {
  const solved = generateSolved();
  const grid = solved.grid.map((row) => row.slice());

  const cells = shuffled(
    Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE])
  );

  let given = SIZE * SIZE;
  for (const [row, col] of cells) {
    if (given <= clues) break;
    const backup = grid[row][col];
    grid[row][col] = EMPTY;
    if (countSolutions(grid, 2) === 1) {
      given--;
    } else {
      grid[row][col] = backup;
    }
  }

  return { puzzle: new Sudoku(grid), solution: solved };
}

// --- Constraint propagation (WFC-style) -------------------------------------
// Shared by the browser UI (index.html) and headless analysis scripts.

// The 9 coordinates of the row, column, or box that (r, c) belongs to.
function unitCoords(r, c, kind) {
  const coords = [];
  if (kind === "row") for (let i = 0; i < SIZE; i++) coords.push([r, i]);
  else if (kind === "col") for (let i = 0; i < SIZE; i++) coords.push([i, c]);
  else {
    const br = r - (r % BOX);
    const bc = c - (c % BOX);
    for (let rr = br; rr < br + BOX; rr++)
      for (let cc = bc; cc < bc + BOX; cc++) coords.push([rr, cc]);
  }
  return coords;
}

// Values still legal for an empty cell given only its filled peers.
function legalCandidates(grid, r, c) {
  const s = new Set(DIGITS);
  const br = r - (r % BOX);
  const bc = c - (c % BOX);
  for (let i = 0; i < SIZE; i++) {
    s.delete(grid[r][i]);
    s.delete(grid[i][c]);
  }
  for (let rr = br; rr < br + BOX; rr++)
    for (let cc = bc; cc < bc + BOX; cc++) s.delete(grid[rr][cc]);
  return s;
}

// Kuhn's algorithm: can every cell be matched to a distinct candidate value?
function hasPerfectMatching(candLists) {
  const matchOfValue = new Map();
  function tryKuhn(u, seen) {
    for (const v of candLists[u]) {
      if (seen.has(v)) continue;
      seen.add(v);
      const w = matchOfValue.get(v);
      if (w === undefined || tryKuhn(w, seen)) {
        matchOfValue.set(v, u);
        return true;
      }
    }
    return false;
  }
  for (let u = 0; u < candLists.length; u++) {
    if (!tryKuhn(u, new Set())) return false;
  }
  return true;
}

// Would fixing (r, c) to `v` still let this unit be completed, i.e. can each
// remaining empty cell take a distinct still-missing value from its marks?
function unitAllows(grid, snap, r, c, v, kind) {
  const coords = unitCoords(r, c, kind);
  const filled = [];
  const empties = [];
  for (const [rr, cc] of coords) {
    if (grid[rr][cc] !== EMPTY) filled.push(grid[rr][cc]);
    else empties.push([rr, cc]);
  }
  if (new Set(filled).size !== filled.length) return true; // conflicted unit; don't prune
  const missing = new Set(DIGITS);
  for (const f of filled) missing.delete(f);
  if (!missing.has(v)) return false;
  const candLists = empties.map(([rr, cc]) => {
    const base = rr === r && cc === c ? new Set([v]) : snap[rr][cc];
    const list = [];
    for (const x of base) if (missing.has(x)) list.push(x);
    return list;
  });
  return hasPerfectMatching(candLists);
}

// One WFC pass over plain data. `grid` is a 2D array of numbers (EMPTY for
// blanks); `notes` is a 2D array of Sets holding each empty cell's candidates.
// Drops any pencil mark that would make one of the cell's connecting units
// unsolvable on its own, fills any cell left with a single survivor, and
// mutates both `grid` and `notes` in place. Returns { changed, fills }.
function propagationPass(grid, notes) {
  const snap = [];
  for (let r = 0; r < SIZE; r++) {
    snap.push([]);
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] !== EMPTY) snap[r].push(new Set());
      else
        snap[r].push(
          notes[r][c].size > 0 ? new Set(notes[r][c]) : legalCandidates(grid, r, c)
        );
    }
  }
  let changed = false;
  const fills = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] !== EMPTY || notes[r][c].size === 0) continue;
      const survivors = new Set();
      for (const v of notes[r][c]) {
        if (
          unitAllows(grid, snap, r, c, v, "row") &&
          unitAllows(grid, snap, r, c, v, "col") &&
          unitAllows(grid, snap, r, c, v, "box")
        ) {
          survivors.add(v);
        }
      }
      if (survivors.size !== notes[r][c].size) changed = true;
      notes[r][c] = survivors;
      if (survivors.size === 1) {
        fills.push([r, c, [...survivors][0]]);
        notes[r][c] = new Set();
      }
    }
  }
  for (const [r, c, v] of fills) grid[r][c] = v;
  return { changed, fills };
}

// Headless equivalent of "Add Pencil" then repeated "Constraint Propagation":
// fill every empty cell with all candidates, then run passes until one changes
// nothing. Returns the resulting grid/notes plus pass count and remaining blanks.
function runPropagation(givenGrid) {
  const grid = givenGrid.map((row) => row.slice());
  const notes = [];
  for (let r = 0; r < SIZE; r++) {
    notes.push([]);
    for (let c = 0; c < SIZE; c++) {
      notes[r].push(grid[r][c] === EMPTY ? new Set(DIGITS) : new Set());
    }
  }
  let passes = 0;
  while (propagationPass(grid, notes).changed && passes < 20) passes++;
  let remaining = 0;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (grid[r][c] === EMPTY) remaining++;

  let level = "Impossible";
  if (remaining === 0 && passes < 10) {
    level = "Easy";
  } else if (remaining === 0 && passes >= 10) {
    level = "Medium";
  } else if (remaining < 10) {
    level = "Hard";
  } else if (remaining < 30) {
    level = "Very Hard";
  } else {
    level = "Impossible";
  }
  let difficulty = remaining == 0 ? passes : remaining + 20;
  return { grid, notes, passes, remaining, level, difficulty };
}

function generateLadderGames(count = 100) {
  const games = [];
  for (let i = 0; i < count; i++) {
    const { puzzle, solution } = generatePuzzle();
    const given = puzzle.grid.map((row) => row.slice());
    const propagation = runPropagation(given);
    games.push({
      name: `${propagation.level} ${nameFromPuzzle(puzzle)}`,
      given,
      solution: solution.grid.map((row) => row.slice()),
      level: propagation.level,
      passes: propagation.passes,
      remaining: propagation.remaining,
      difficulty: propagation.difficulty,
    });
  }

  games.sort((a, b) => a.difficulty - b.difficulty);
  return games;
}

function writeLadderInfo(games, filePath) {
  const fs = require("fs");
  const output = `const ladderInfo = ${JSON.stringify(games, null, 2)};\n\n` +
    `if (typeof module !== "undefined" && module.exports) {\n` +
    `  module.exports = ladderInfo;\n}\n`;
  fs.writeFileSync(filePath, output);
}

function readLadderInfo(filePath) {
  if (typeof window === "undefined" && typeof require !== "undefined") {
    const fs = require("fs");
    const path = require("path");
    const baseDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
    const targetPath = filePath
      ? path.resolve(filePath)
      : path.join(baseDir, "ladder_info.js");
    if (!fs.existsSync(targetPath)) {
      return [];
    }
    try {
      delete require.cache[require.resolve(targetPath)];
      const imported = require(targetPath);
      if (Array.isArray(imported)) return imported;
      if (imported && Array.isArray(imported.ladderInfo)) return imported.ladderInfo;
    } catch {
      const content = fs.readFileSync(targetPath, "utf8");
      try {
        return JSON.parse(content);
      } catch {
        const start = content.indexOf("[");
        const end = content.lastIndexOf("]");
        if (start !== -1 && end !== -1) {
          return JSON.parse(content.slice(start, end + 1));
        }
      }
    }
    return [];
  }
  if (typeof ladderInfo !== "undefined") {
    return ladderInfo;
  }
  if (typeof window !== "undefined" && window.ladderInfo) {
    return window.ladderInfo;
  }
  return [];
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    Sudoku,
    SIZE,
    EMPTY,
    fillGrid,
    countSolutions,
    generateSolved,
    generatePuzzle,
    nameFromPuzzle,
    unitCoords,
    legalCandidates,
    hasPerfectMatching,
    unitAllows,
    propagationPass,
    runPropagation,
    generateLadderGames,
    writeLadderInfo,
    readLadderInfo,
  };
}

if (typeof require !== "undefined" && require.main === module) {
  const path = require("path");
  const games = generateLadderGames();
  writeLadderInfo(games, path.join(__dirname, "ladder_info.js"));
}
