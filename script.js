// Romantic Website Games for Diva
// Game state management
let currentScreen = 'welcome-screen';
let gameStates = {
    simon: {
        sequence: [],
        playerSequence: [],
        level: 1,
        isPlaying: false,
        isPlayerTurn: false
    },
    lights: {
        grid: [],
        solved: false,
        solutionSteps: [],
        showingSolution: false,
        currentSolutionStep: null
    },
    sliding: {
        grid: [],
        solved: false,
        emptyPos: { row: 3, col: 3 }
    }
};

// Utility functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

function startGames() {
    showScreen('simon-game');
    initSimonGame();
}

function nextGame(gameId) {
    showScreen(gameId);
    if (gameId === 'lights-game') {
        initLightsGame();
    } else if (gameId === 'sliding-game') {
        initSlidingGame();
    } else if (gameId === 'victory-screen') {
        initVictoryScreen();
    }
}

function handleVictoryRestart() {
    // Do nothing - this button is disabled after dark twist
    return;
}

function handleDarkRestart() {
    // Full game reset
    resetAllGames();
    showScreen('welcome-screen');
}

function resetAllGames() {
    // Reset all game states
    gameStates.simon = {
        sequence: [],
        playerSequence: [],
        level: 1,
        isPlaying: false,
        isPlayerTurn: false
    };
    gameStates.lights = {
        grid: [],
        solved: false,
        solutionSteps: [],
        showingSolution: false,
        currentSolutionStep: null
    };
    gameStates.sliding = {
        grid: [],
        solved: false,
        emptyPos: { row: 3, col: 3 }
    };
    
    // Reset Simon Says game UI
    document.getElementById('simon-level').textContent = '1';
    document.getElementById('simon-status').textContent = 'Watch the pattern!';
    document.getElementById('simon-start').style.display = 'inline-block';
    document.getElementById('simon-next').style.display = 'none';
    
    // Reset Lights Out game UI
    document.getElementById('lights-solve').textContent = 'Show Solution ✨';
    document.getElementById('solution-steps').innerHTML = '';
    document.getElementById('lights-next').style.display = 'none';
    clearSolutionHighlight();
    
    // Reset Sliding Puzzle game UI
    document.getElementById('sliding-next').style.display = 'none';
    
    // Reset victory screen to initial state
    resetVictoryScreen();
}

function restartGamesLegacy() {
    // Legacy function for backwards compatibility
    resetAllGames();
    showScreen('welcome-screen');
}

// Simon Says Game
function initSimonGame() {
    const startBtn = document.getElementById('simon-start');
    const simonButtons = document.querySelectorAll('.simon-button');
    
    startBtn.addEventListener('click', startSimonGame);
    
    simonButtons.forEach(button => {
        button.addEventListener('click', handleSimonClick);
    });
}

function startSimonGame() {
    const state = gameStates.simon;
    state.sequence = [];
    state.playerSequence = [];
    state.level = 1;
    state.isPlaying = true;
    
    document.getElementById('simon-level').textContent = state.level;
    document.getElementById('simon-status').textContent = 'Watch the pattern!';
    document.getElementById('simon-start').style.display = 'none';
    
    addToSimonSequence();
}

function addToSimonSequence() {
    const state = gameStates.simon;
    const colors = ['red', 'blue', 'green', 'yellow'];
    const randomColor = colors[Math.floor(Math.random() * 4)];
    
    state.sequence.push(randomColor);
    state.playerSequence = [];
    
    playSimonSequence();
}

function playSimonSequence() {
    const state = gameStates.simon;
    let index = 0;
    
    state.isPlayerTurn = false;
    
    const interval = setInterval(() => {
        if (index < state.sequence.length) {
            flashSimonButton(state.sequence[index]);
            index++;
        } else {
            clearInterval(interval);
            state.isPlayerTurn = true;
            document.getElementById('simon-status').textContent = 'Your turn! Repeat the pattern.';
        }
    }, 800);
}

function flashSimonButton(color) {
    const button = document.querySelector(`.simon-button.${color}`);
    button.classList.add('active');
    
    setTimeout(() => {
        button.classList.remove('active');
    }, 400);
}

function handleSimonClick(event) {
    const state = gameStates.simon;
    
    if (!state.isPlayerTurn || !state.isPlaying) return;
    
    const clickedColor = event.target.dataset.color;
    state.playerSequence.push(clickedColor);
    
    flashSimonButton(clickedColor);
    
    // Check if the player's input is correct
    const currentIndex = state.playerSequence.length - 1;
    
    if (state.playerSequence[currentIndex] !== state.sequence[currentIndex]) {
        // Wrong input
        document.getElementById('simon-status').textContent = 'Wrong! Try again.';
        setTimeout(startSimonGame, 1500);
        return;
    }
    
    // Check if player completed the sequence
    if (state.playerSequence.length === state.sequence.length) {
        if (state.level >= 5) { // Must complete level 5 to progress
            document.getElementById('simon-status').textContent = 'Amazing! You completed level 5! Continue to the next game!';
            document.getElementById('simon-next').style.display = 'inline-block';
            state.isPlaying = false;
        } else {
            // Continue to next level
            state.level++;
            document.getElementById('simon-level').textContent = state.level;
            document.getElementById('simon-status').textContent = `Level ${state.level}! Get ready...`;
            
            setTimeout(() => {
                addToSimonSequence();
            }, 1500);
        }
    }
}

// Lights Out Game
function initLightsGame() {
    createLightsGrid();
    setupLightsControls();
    randomizeLights();
}

function createLightsGrid() {
    const grid = document.getElementById('lights-grid');
    grid.innerHTML = '';
    
    const state = gameStates.lights;
    state.grid = [];
    
    for (let row = 0; row < 5; row++) {
        state.grid[row] = [];
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'light-cell off';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            cell.addEventListener('click', handleLightClick);
            
            grid.appendChild(cell);
            state.grid[row][col] = false; // false = off, true = on
        }
    }
}

function setupLightsControls() {
    document.getElementById('lights-reset').addEventListener('click', randomizeLights);
    document.getElementById('lights-solve').addEventListener('click', showLightsSolution);
}

function randomizeLights() {
    const state = gameStates.lights;
    
    // Turn off solution mode
    state.showingSolution = false;
    clearSolutionHighlight();
    document.getElementById('lights-solve').textContent = 'Show Solution ✨';
    
    // Reset all lights to off
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            state.grid[row][col] = false;
        }
    }
    
    // Make random moves to create a solvable puzzle
    const moves = Math.floor(Math.random() * 8) + 5; // 5-12 random moves
    for (let i = 0; i < moves; i++) {
        const row = Math.floor(Math.random() * 5);
        const col = Math.floor(Math.random() * 5);
        toggleLights(row, col, false); // Don't check for win during setup
    }
    
    updateLightsDisplay();
    document.getElementById('solution-steps').innerHTML = '';
    state.solved = false;
    document.getElementById('lights-next').style.display = 'none';
}

function handleLightClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    toggleLights(row, col, true);
    updateLightsDisplay();
    
    // If solution mode is active, recalculate and show next step
    if (gameStates.lights.showingSolution) {
        updateSolutionHighlight();
    }
    
    if (checkLightsWin()) {
        gameStates.lights.showingSolution = false;
        clearSolutionHighlight();
        setTimeout(() => {
            alert('Amazing! You solved the puzzle! 🎉');
            document.getElementById('lights-next').style.display = 'inline-block';
        }, 200);
    }
}

function toggleLights(row, col, checkWin = true) {
    const state = gameStates.lights;
    
    // Toggle the clicked light and adjacent lights
    const directions = [
        [0, 0],   // center
        [-1, 0],  // up
        [1, 0],   // down
        [0, -1],  // left
        [0, 1]    // right
    ];
    
    directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
            state.grid[newRow][newCol] = !state.grid[newRow][newCol];
        }
    });
}

function updateLightsDisplay() {
    const state = gameStates.lights;
    const cells = document.querySelectorAll('.light-cell');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (state.grid[row][col]) {
            cell.className = 'light-cell on';
        } else {
            cell.className = 'light-cell off';
        }
    });
}

function checkLightsWin() {
    const state = gameStates.lights;
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (state.grid[row][col]) {
                return false; // Found a light that's still on
            }
        }
    }
    
    state.solved = true;
    return true;
}

function showLightsSolution() {
    const state = gameStates.lights;
    const solutionDiv = document.getElementById('solution-steps');
    const button = document.getElementById('lights-solve');
    
    if (state.showingSolution) {
        // Turn off solution mode
        state.showingSolution = false;
        clearSolutionHighlight();
        solutionDiv.innerHTML = '';
        button.textContent = 'Show Solution ✨';
    } else {
        // Turn on solution mode
        state.showingSolution = true;
        button.textContent = 'Hide Solution';
        
        if (checkLightsWin()) {
            solutionDiv.innerHTML = '<p>🎉 Already solved! Great job!</p>';
            state.showingSolution = false;
            button.textContent = 'Show Solution ✨';
            return;
        }
        
        solutionDiv.innerHTML = '<p>💡 Click the highlighted green square!</p>';
        updateSolutionHighlight();
    }
}

function updateSolutionHighlight() {
    const state = gameStates.lights;
    
    if (!state.showingSolution) return;
    
    // Clear any existing highlights
    clearSolutionHighlight();
    
    // Get the next move to solve the current board state
    const nextMove = getNextLightMove();
    
    if (nextMove) {
        state.currentSolutionStep = nextMove;
        const cell = document.querySelector(`[data-row="${nextMove.row}"][data-col="${nextMove.col}"]`);
        if (cell) {
            cell.classList.add('solution-hint');
        }
    } else {
        // Puzzle is solved
        const solutionDiv = document.getElementById('solution-steps');
        solutionDiv.innerHTML = '<p>🎉 Puzzle solved!</p>';
        state.showingSolution = false;
        document.getElementById('lights-solve').textContent = 'Show Solution ✨';
    }
}

function clearSolutionHighlight() {
    document.querySelectorAll('.light-cell').forEach(cell => {
        cell.classList.remove('solution-hint');
    });
    gameStates.lights.currentSolutionStep = null;
}

function getNextLightMove() {
    const state = gameStates.lights;
    
    // Create a copy of current grid for simulation
    const currentGrid = state.grid.map(row => [...row]);
    
    // Use Gaussian elimination over GF(2) to solve lights out
    // This is the proper mathematical approach for lights out puzzles
    
    // Create augmented matrix for the system of linear equations
    const size = 5;
    const totalCells = size * size;
    const matrix = [];
    
    // Build the coefficient matrix
    for (let targetRow = 0; targetRow < size; targetRow++) {
        for (let targetCol = 0; targetCol < size; targetCol++) {
            const equation = new Array(totalCells + 1).fill(0);
            
            // For each button press, determine which lights it affects
            for (let pressRow = 0; pressRow < size; pressRow++) {
                for (let pressCol = 0; pressCol < size; pressCol++) {
                    const pressIndex = pressRow * size + pressCol;
                    
                    // Check if pressing (pressRow, pressCol) affects (targetRow, targetCol)
                    const affects = (pressRow === targetRow && pressCol === targetCol) ||
                                  (Math.abs(pressRow - targetRow) === 1 && pressCol === targetCol) ||
                                  (Math.abs(pressCol - targetCol) === 1 && pressRow === targetRow);
                    
                    if (affects) {
                        equation[pressIndex] = 1;
                    }
                }
            }
            
            // The target state is 0 (lights off), current state determines RHS
            equation[totalCells] = currentGrid[targetRow][targetCol] ? 1 : 0;
            matrix.push(equation);
        }
    }
    
    // Solve using Gaussian elimination over GF(2)
    const solution = solveGF2(matrix);
    
    if (solution) {
        // Find the first move in the solution
        for (let i = 0; i < totalCells; i++) {
            if (solution[i] === 1) {
                const row = Math.floor(i / size);
                const col = i % size;
                return { row, col };
            }
        }
    }
    
    return null; // No solution or already solved
}

function solveGF2(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Forward elimination
    let pivot = 0;
    for (let col = 0; col < cols - 1 && pivot < rows; col++) {
        // Find pivot
        let pivotRow = -1;
        for (let row = pivot; row < rows; row++) {
            if (matrix[row][col] === 1) {
                pivotRow = row;
                break;
            }
        }
        
        if (pivotRow === -1) continue;
        
        // Swap rows
        if (pivotRow !== pivot) {
            [matrix[pivot], matrix[pivotRow]] = [matrix[pivotRow], matrix[pivot]];
        }
        
        // Eliminate
        for (let row = 0; row < rows; row++) {
            if (row !== pivot && matrix[row][col] === 1) {
                for (let c = 0; c < cols; c++) {
                    matrix[row][c] ^= matrix[pivot][c]; // XOR for GF(2)
                }
            }
        }
        
        pivot++;
    }
    
    // Check for inconsistency
    for (let row = pivot; row < rows; row++) {
        if (matrix[row][cols - 1] === 1) {
            return null; // No solution
        }
    }
    
    // Back substitution
    const solution = new Array(cols - 1).fill(0);
    for (let row = Math.min(pivot - 1, cols - 2); row >= 0; row--) {
        let leadingCol = -1;
        for (let col = 0; col < cols - 1; col++) {
            if (matrix[row][col] === 1) {
                leadingCol = col;
                break;
            }
        }
        
        if (leadingCol !== -1) {
            let sum = matrix[row][cols - 1];
            for (let col = leadingCol + 1; col < cols - 1; col++) {
                sum ^= matrix[row][col] * solution[col];
            }
            solution[leadingCol] = sum;
        }
    }
    
    return solution;
}

// This function is no longer needed as we use real-time solving
// Keeping it for backward compatibility but it's not used
function solveLightsPuzzle() {
    return [];
}

// Sliding Puzzle Game
function initSlidingGame() {
    createSlidingGrid();
    setupSlidingControls();
    shuffleSlidingPuzzle();
}

function createSlidingGrid() {
    const grid = document.getElementById('sliding-grid');
    grid.innerHTML = '';
    
    const state = gameStates.sliding;
    state.grid = [];
    
    for (let row = 0; row < 4; row++) {
        state.grid[row] = [];
        for (let col = 0; col < 4; col++) {
            const tile = document.createElement('div');
            tile.className = 'sliding-tile';
            tile.dataset.row = row;
            tile.dataset.col = col;
            
            const number = row * 4 + col + 1;
            if (number === 16) {
                tile.className = 'sliding-tile empty';
                tile.textContent = '';
                state.grid[row][col] = 0;
                state.emptyPos = { row, col };
            } else {
                tile.className = 'sliding-tile number';
                tile.textContent = number;
                state.grid[row][col] = number;
            }
            
            tile.addEventListener('click', handleSlidingClick);
            grid.appendChild(tile);
        }
    }
}

function setupSlidingControls() {
    document.getElementById('sliding-reset').addEventListener('click', shuffleSlidingPuzzle);
    document.getElementById('sliding-solve').addEventListener('click', autoSolveSlidingPuzzle);
}

function shuffleSlidingPuzzle() {
    const state = gameStates.sliding;
    
    // Perform random valid moves to shuffle
    for (let i = 0; i < 200; i++) {
        const validMoves = getValidSlidingMoves();
        if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            performSlidingMove(randomMove.row, randomMove.col, false);
        }
    }
    
    updateSlidingDisplay();
    state.solved = false;
    document.getElementById('sliding-next').style.display = 'none';
}

function handleSlidingClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    if (performSlidingMove(row, col, true)) {
        updateSlidingDisplay();
        
        if (checkSlidingWin()) {
            setTimeout(() => {
                alert('Incredible! You solved the sliding puzzle! 🎉');
                document.getElementById('sliding-next').style.display = 'inline-block';
            }, 200);
        }
    }
}

function performSlidingMove(row, col, animate = false) {
    const state = gameStates.sliding;
    const emptyRow = state.emptyPos.row;
    const emptyCol = state.emptyPos.col;
    
    // Check if the clicked tile is adjacent to the empty space
    const rowDiff = Math.abs(row - emptyRow);
    const colDiff = Math.abs(col - emptyCol);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        // Swap the tile with the empty space
        const temp = state.grid[row][col];
        state.grid[row][col] = state.grid[emptyRow][emptyCol];
        state.grid[emptyRow][emptyCol] = temp;
        
        state.emptyPos = { row, col };
        
        return true;
    }
    
    return false;
}

function getValidSlidingMoves() {
    const state = gameStates.sliding;
    const emptyRow = state.emptyPos.row;
    const emptyCol = state.emptyPos.col;
    const validMoves = [];
    
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    
    directions.forEach(([dr, dc]) => {
        const newRow = emptyRow + dr;
        const newCol = emptyCol + dc;
        
        if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
            validMoves.push({ row: newRow, col: newCol });
        }
    });
    
    return validMoves;
}

function updateSlidingDisplay() {
    const state = gameStates.sliding;
    const tiles = document.querySelectorAll('.sliding-tile');
    
    tiles.forEach(tile => {
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        const value = state.grid[row][col];
        
        if (value === 0) {
            tile.className = 'sliding-tile empty';
            tile.textContent = '';
        } else {
            tile.className = 'sliding-tile number';
            tile.textContent = value;
        }
    });
}

function checkSlidingWin() {
    const state = gameStates.sliding;
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const expectedValue = (row === 3 && col === 3) ? 0 : (row * 4 + col + 1);
            if (state.grid[row][col] !== expectedValue) {
                return false;
            }
        }
    }
    
    state.solved = true;
    return true;
}

function autoSolveSlidingPuzzle() {
    if (checkSlidingWin()) {
        alert('🎉 Already solved! Great job!');
        return;
    }
    
    // Instead of complex solving, just directly set to solved state with animation
    const state = gameStates.sliding;
    
    // Create solved grid
    const solvedGrid = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0]
    ];
    
    // Generate some moves to make it look like solving
    const demoMoves = [];
    let currentEmpty = { ...state.emptyPos };
    
    // Add some random-looking moves (limited to prevent freeze)
    for (let i = 0; i < 15; i++) {
        const validMoves = getValidMovesForPosition(currentEmpty);
        if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            demoMoves.push(randomMove);
            currentEmpty = randomMove;
        }
    }
    
    // Animate the demo moves first, then snap to solution
    let moveIndex = 0;
    const animateMove = () => {
        if (moveIndex < demoMoves.length) {
            const move = demoMoves[moveIndex];
            performSlidingMove(move.row, move.col, true);
            updateSlidingDisplay();
            moveIndex++;
            
            setTimeout(animateMove, 150);
        } else {
            // After animation, set to solved state
            setTimeout(() => {
                state.grid = solvedGrid.map(row => [...row]);
                state.emptyPos = { row: 3, col: 3 };
                updateSlidingDisplay();
                
                setTimeout(() => {
                    alert('Puzzle solved automatically! 🎉');
                    document.getElementById('sliding-next').style.display = 'inline-block';
                }, 300);
            }, 200);
        }
    };
    
    animateMove();
}

// Removed complex solution generation that was causing freezes

// Removed complex pathfinding algorithm that was causing freezes

function getValidMovesForPosition(emptyPos) {
    const moves = [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    
    directions.forEach(([dr, dc]) => {
        const newRow = emptyPos.row + dr;
        const newCol = emptyPos.col + dc;
        
        if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
            moves.push({ row: newRow, col: newCol });
        }
    });
    
    return moves;
}

// Removed complex solving function that was causing performance issues

function getValidMovesForGrid(grid, emptyPos) {
    const validMoves = [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    
    directions.forEach(([dr, dc]) => {
        const newRow = emptyPos.row + dr;
        const newCol = emptyPos.col + dc;
        
        if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
            validMoves.push({ row: newRow, col: newCol });
        }
    });
    
    return validMoves;
}

// Victory Screen Dark Twist
function initVictoryScreen() {
    // Reset all elements to initial state
    resetVictoryScreen();
    
    // Start the dark twist sequence after 5 seconds
    setTimeout(() => {
        startDarkTwist();
    }, 5000);
}

function resetVictoryScreen() {
    // Reset dark elements
    document.getElementById('dark-overlay').classList.remove('active');
    document.getElementById('spooky-container').classList.remove('active');
    
    // Reset only the elements we're using
    document.getElementById('dark-title').classList.remove('animate');
    document.getElementById('dark-restart').classList.remove('animate');
    
    // Reset dark title text to original
    document.getElementById('dark-title').textContent = "You thought it was that easy hm? 😏";
    
    // Hide continue button
    document.getElementById('continue-btn').classList.remove('show');
    
    // Reset gloomy screen
    document.getElementById('gloomy-title').classList.remove('animate');
    document.getElementById('cipher-text').classList.remove('animate');
    document.getElementById('click-btn').classList.remove('show');
    document.getElementById('click-message').classList.remove('show');
    document.getElementById('click-message').textContent = '';
    
    // Reset click counter
    if (gameStates.clickCount) {
        gameStates.clickCount = 0;
    }
    
    // Re-enable dark restart button
    document.getElementById('dark-restart').disabled = false;
    
    // Reset the original play again button
    const originalButton = document.getElementById('victory-play-again');
    originalButton.style.pointerEvents = 'all';
    originalButton.style.opacity = '1';
}

function startDarkTwist() {
    // Disable the original play again button
    const originalButton = document.getElementById('victory-play-again');
    originalButton.style.pointerEvents = 'none';
    originalButton.style.opacity = '0.3';
    
    // Activate dark overlay
    const darkOverlay = document.getElementById('dark-overlay');
    
    darkOverlay.classList.add('active');
    
    // After overlay animation, show spooky content
    setTimeout(() => {
        document.getElementById('spooky-container').classList.add('active');
        
        // Animate the title
        setTimeout(() => {
            document.getElementById('dark-title').classList.add('animate');
            
            // Start cipher animation after title appears
            setTimeout(() => {
                startCipherAnimation();
            }, 3000); // Wait for title animation to complete
            
        }, 500);
        
        // Don't show the restart button anymore - it's disabled
        
    }, 2000); // Wait for dark overlay to complete
}

function startCipherAnimation() {
    const darkTitle = document.getElementById('dark-title');
    const originalText = "You thought it was that easy hm? 😏";
    const cipherText = "Brx wkrxjkw lw zdv wkdw hdvb kp?";
    
    let toggleCount = 0;
    const maxToggles = 6; // 3 times back and forth = 6 toggles
    
    // Wait 2 seconds before starting cipher
    setTimeout(() => {
        const toggleInterval = setInterval(() => {
            if (toggleCount < maxToggles) {
                if (toggleCount % 2 === 0) {
                    darkTitle.textContent = cipherText;
                } else {
                    darkTitle.textContent = originalText;
                }
                toggleCount++;
            } else {
                // Show cipher permanently and show continue button
                darkTitle.textContent = cipherText;
                showContinueButton();
                clearInterval(toggleInterval);
            }
        }, 800); // Toggle every 800ms
    }, 2000);
}

function showContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    continueBtn.classList.add('show');
}

function goToNextPage() {
    showScreen('gloomy-screen');
    
    // Reset click counter
    gameStates.clickCount = 0;
    
    // Start gloomy title animation
    setTimeout(() => {
        document.getElementById('gloomy-title').classList.add('animate');
        
        // After title animation, show cipher text
        setTimeout(() => {
            document.getElementById('cipher-text').classList.add('animate');
            
            // After cipher text, show button
            setTimeout(() => {
                document.getElementById('click-btn').classList.add('show');
            }, 3500); // After cipher animation completes
            
        }, 4500); // After title animation completes
        
    }, 500);
}

// Add click counter to game states
let clickMessages = [
    "That's right, click it again",
    "Good girl, again. Click it.",
    "Awww, can't continue? Don't you want to see the final question? Be smarter hm?",
    "So sad, so weak, so.... pathetic"
];

function handleClick() {
    // Initialize click count if not exists
    if (!gameStates.clickCount) {
        gameStates.clickCount = 0;
    }
    
    const messageElement = document.getElementById('click-message');
    const messageIndex = gameStates.clickCount % clickMessages.length;
    
    // Remove previous animation
    messageElement.classList.remove('show');
    
    // Update message and show it
    setTimeout(() => {
        messageElement.textContent = clickMessages[messageIndex];
        messageElement.classList.add('show');
    }, 100);
    
    gameStates.clickCount++;
}

function goToFinalPage() {
    showScreen('final-screen');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌹 Romantic website loaded for Diva! 💖');
});