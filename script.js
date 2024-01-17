"use strict";
const grid = document.getElementById("grid");
const resetButton = document.getElementById("reset");
var rows = 20;
var columns = 20;
const totalCells = rows * columns;
var mines = 80;
var randomShapeSize = 9;
let cells = [];
let minesPlaced = false;
let minesCount = 0;
let revealedCells = [];
let markedCells = [];
/**
 * Initializes the grid by creating a div element for each cell and appending it to the grid container.
 * Also adds the necessary dataset attributes to each cell.
 */
const initializeGrid = () => {
    for (let row = 0; row < rows; row++) {
        const rowArray = [];
        for (let column = 0; column < columns; column++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row.toString();
            cell.dataset.column = column.toString();
            grid.appendChild(cell);
            rowArray.push(cell);
        }
        cells.push(rowArray);
    }
};
let mineSet = new Set();
/**
 * Randomly places mines on the game board until the desired number of mines is reached.
 */
const placeMines = (initialCells) => {
    while (minesCount < mines) { // Keep looping until we've placed all the mines desired
        const row = Math.floor(Math.random() * rows); // Choose a random row index
        const column = Math.floor(Math.random() * columns); // Choose a random column index
        // Check if the chosen row and column is one of the initial cells
        if (initialCells.some(([r, c]) => r === row && c === column)) {
            continue;
        }
        // Check if the cell at the chosen row and column has already been revealed or already contains a mine
        // (!revealedCells.some(([r, c]) => r === row && c === column)
        const cellKey = `${row},${column}`;
        if (!mineSet.has(cellKey)) {
            mineSet.add(cellKey);
            minesCount++;
        }
    }
};
/**
 * Reveals all adjacent cells to the given cell coordinates that have not already been revealed.
 * @param row - The row index of the cell.
 * @param column - The column index of the cell.
 */
const revealAdjacentCells = (row, column) => {
    // Get an array of all the neighboring cells to the given row and column
    const neighbors = getNeighbors(row, column);
    // Loop through each neighboring cell
    neighbors.forEach(([r, c]) => {
        // Check if the neighboring cell has already been revealed
        if (!revealedCells.some(([x, y]) => x === r && y === c)) {
            // If the neighboring cell has not been revealed and has 0 adjacent mines, reveal it
            revealCell(r, c);
        }
    });
};
/**
 * Returns an array of cells to be revealed in a random shape around the given row and column.
 * @param row - The row index of the starting cell.
 * @param column - The column index of the starting cell.
 * @returns An array of cells to be revealed.
 */
const randomShape = (row, column, size) => {
    // Set the revealedCells array to contain only the given row and column
    revealedCells = [[row, column]];
    // Choose a random number between 9 and 11 (inclusive) to determine how many cells to reveal
    let count = Math.floor(Math.random() * 3) + size;
    // Loop until we've revealed the desired number of cells
    while (count > 0) {
        // Choose a random cell from the revealedCells array
        const randomCell = revealedCells[Math.floor(Math.random() * revealedCells.length)];
        // Get an array of all the neighboring cells to the random cell
        const neighbors = getNeighbors(randomCell[0], randomCell[1]);
        // Loop through each neighboring cell
        for (const [r, c] of neighbors) {
            // Check if the neighboring cell has not already been revealed
            if (!revealedCells.some(cell => cell[0] === r && cell[1] === c)) {
                // If the neighboring cell has not been revealed, add it to the revealedCells array and decrement the count
                revealedCells.push([r, c]);
                count--;
            }
        }
    }
    // Return the array of cells that have been revealed in the random shape
    return revealedCells;
};
/**
 * Reveals a cell on the game board and updates its appearance based on its contents.
 * @param row - The row index of the cell to reveal.
 * @param column - The column index of the cell to reveal.
 */
const revealCell = (row, column) => {
    const cell = cells[row][column];
    if (cell.classList.contains("revealed") || mineSet.has(`${row},${column}`) || cell.classList.contains("marked")) {
        return;
    }
    cell.classList.add("revealed");
    revealedCells.push([row, column]);
    const mineCount = countAdjacentMines(row, column);
    // If there are no adjacent mines, reveal all adjacent cells
    if (mineCount === 0) {
        revealAdjacentCells(row, column);
    }
    else {
        // Otherwise, set the text content of the cell to the number of adjacent mines
        cell.textContent = mineCount.toString();
        // Set the color of the cell based on the number of adjacent mines
        switch (mineCount) {
            case 1:
                cell.style.color = "blue";
                break;
            case 2:
                cell.style.color = "green";
                break;
            case 3:
                cell.style.color = "red";
                break;
            case 4:
                cell.style.color = "purple";
                break;
            case 5:
                cell.style.color = "maroon";
                break;
            case 6:
                cell.style.color = "rgb(000, 130, 130)";
                break;
            case 7:
                cell.style.color = "black";
                break;
            case 8:
                cell.style.color = "gray";
                break;
            default:
                break;
        }
    }
    memo.clear();
    calculateMineProbabilityUsingCSP();
};
/**
 * Counts the number of adjacent mines to a given cell.
 * @param row - The row index of the cell.
 * @param column - The column index of the cell.
 * @returns The number of adjacent mines.
 */
const countAdjacentMines = (row, column) => {
    const neighbors = getNeighbors(row, column);
    let count = 0;
    neighbors.forEach(([r, c]) => {
        if (mineSet.has(`${r},${c}`)) {
            count++;
        }
    });
    return count;
};
/**
 * Returns an array of coordinates representing the neighbors of a given cell.
 * @param row - The row index of the cell.
 * @param column - The column index of the cell.
 * @returns An array of coordinate tuples representing the neighbors of the cell.
 */
// Define a function called getNeighbors that takes in a row and column number as arguments
const getNeighbors = (row, column) => {
    // Create an empty array to store the neighbors
    const neighbors = [];
    // Loop through all possible neighbors of the given cell
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, column - 1); c <= Math.min(columns - 1, column + 1); c++) {
            // Exclude the cell itself from the list of neighbors
            if (r !== row || c !== column) {
                neighbors.push([r, c]);
            }
        }
    }
    return neighbors;
};
/**
 * Checks if all non-mine cells have been revealed, indicating a win.
 * If all cells have been revealed, sets gameWon to true, updates the highscore, displays the highscore, and returns true.
 * Otherwise, returns false.
 * @returns {boolean} Whether all non-mine cells have been revealed.
 */
const checkForWin = () => {
    // Initialize a variable to keep track of whether all cells have been revealed
    let allCellsRevealed = true;
    // Loop through all cells on the game board
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const cell = cells[row][column];
            // If the cell is not a mine and has not been revealed, set allCellsRevealed to false and break out of the loop
            if (!mineSet.has(`${row},${column}`) && !cell.classList.contains("revealed")) {
                allCellsRevealed = false;
                break;
            }
        }
    }
    // If all cells have been revealed, set gameWon to true, display the highscore, and return true
    if (allCellsRevealed) {
        gameWon = true;
        mineSet.forEach(mine => {
            const [r, c] = mine.split(",").map(Number);
            cells[r][c].style.backgroundColor = "red";
        });
        alert("You won!");
        return true;
    }
    // Otherwise, return false
    return false;
};
/**
 * Marks or unmarks a cell at the specified row and column.
 * @param row - The row index of the cell to mark or unmark.
 * @param column - The column index of the cell to mark or unmark.
 */
// Define a function called markCell that takes in a row and column number as arguments
const markCell = (row, column) => {
    // Get the cell at the specified row and column
    const cell = cells[row][column];
    // If the cell has already been revealed, do nothing and return
    if (cell.classList.contains("revealed")) {
        return;
    }
    // If the cell is already marked, remove the "marked" class and clear its text content
    if (cell.classList.contains("marked")) {
        cell.classList.remove("marked");
        cell.textContent = "";
        // Remove the cell from the list of marked cells
        markedCells = markedCells.filter(([r, c]) => r !== row || c !== column);
    }
    else {
        cell.classList.add("marked");
        cell.textContent = "✖";
        markedCells.push([row, column]);
    }
};
let startTime = new Date().getTime();
/**
 * Updates the time elapsed since the game started and displays it on the page.
 * If the game has been won or lost, the time interval is cleared and the highscore is set (if applicable).
 * @returns The number of seconds elapsed since the game started.
 */
const updateTime = () => {
    if (startTime !== null) {
        const currentTime = new Date().getTime();
        const elapsedMilliseconds = currentTime - startTime;
        const seconds = Math.floor(elapsedMilliseconds / 1000);
        const timeElement = document.getElementById("time");
        timeElement.textContent = `Time: ${seconds} seconds`;
        // If the game has ended stop the timer.
        if (gameWon || gameLost) {
            clearInterval(timeInterval);
            // If the player won add the time to the highscore.
            if (!gameLost) {
                setHighscore(seconds, currentDifficulty);
            }
            displayHighscore();
        }
        return seconds;
    }
};
let timeInterval = setInterval(updateTime, 1000);
clearInterval(timeInterval);
/**
 * Adds a new score to the high scores list and stores it in local storage.
 * @param score The score to be added to the high scores list.
 */
const setHighscore = (score, difficulty) => {
    var highScores = JSON.parse(localStorage['highScores']);
    highScores.push(score);
    localStorage[`highScores${difficulty}`] = JSON.stringify(highScores.sort());
};
/**
 * Retrieves the high scores from local storage and parses them as JSON.
 * @returns {Array} An array of high scores.
 */
const getHighscores = () => {
    return JSON.parse(localStorage['highScores']);
};
/**
 * Clears the highscore list by resetting the local storage to an empty array.
 */
const clearHighscoreList = () => {
    const highscores = [];
    localStorage['highScores'] = JSON.stringify(highscores);
};
/**
 * Displays the highscores on the page.
 */
const displayHighscore = () => {
    const highscores = getHighscores();
    const highscoreElement = document.getElementById("highscores");
    highscoreElement.innerHTML = "";
    highscores.forEach((score, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}: ${score} seconds`;
        highscoreElement.appendChild(listItem);
    });
};
/**
 * Resets the game by updating the time, clearing the grid, resetting game variables, initializing the grid, and starting the time interval.
 * @returns void
 */
const resetGame = () => {
    grid.innerHTML = "";
    cells = [];
    minesPlaced = false;
    minesCount = 0;
    revealedCells = [];
    markedCells = [];
    gameLost = false;
    gameWon = false;
    mineSet.clear();
    clearInterval(timeInterval);
    initializeGrid();
    displayHighscore();
};
let gameLost = false;
let gameWon = false;
var currentDifficulty = 'hard';
const changeDifficulty = () => {
    var selectDifficulty = document.getElementsByClassName('difficulty-drop-down');
    var newDifficulty = selectDifficulty[0].value;
    switch (newDifficulty) {
        case ('easy'):
            rows = 10;
            columns = 10;
            mines = 30;
            randomShapeSize = 3;
            cells = [];
            grid.innerHTML = '';
            initializeGrid();
            grid.style.gridTemplateColumns = `repeat(${columns}, 30px)`;
            currentDifficulty = 'easy';
            break;
        case ('medium'):
            rows = 15;
            columns = 15;
            mines = 50;
            randomShapeSize = 6;
            cells = [];
            grid.innerHTML = '';
            initializeGrid();
            grid.style.gridTemplateColumns = `repeat(${columns}, 30px)`;
            currentDifficulty = 'medium';
            break;
        case ('hard'):
            rows = 20;
            columns = 20;
            mines = 80;
            randomShapeSize = 9;
            cells = [];
            grid.innerHTML = '';
            initializeGrid();
            grid.style.gridTemplateColumns = `repeat(${columns}, 30px)`;
            currentDifficulty = 'hard';
            break;
        default:
            break;
    }
};
const gameInteraction = (event) => {
    // Get the clicked cell's row and column
    const target = event.target;
    const row = parseInt(target.dataset.row);
    const column = parseInt(target.dataset.column);
    // If the game has already been won or lost, do nothing
    if (gameWon || gameLost) {
        return;
    }
    // If the mines haven't been placed yet, place them and reveal the initial cells
    if (!minesPlaced) {
        const initialCells = randomShape(row, column, randomShapeSize);
        placeMines(initialCells);
        minesPlaced = true;
        initialCells.forEach(([r, c]) => revealCell(r, c));
        startTime = new Date().getTime();
        timeInterval = setInterval(updateTime, 1000);
    }
    else {
        // If the clicked cell is a mine and isn't marked, the game is lost
        if (mineSet.has(`${row},${column}`) && !target.classList.contains("marked")) {
            gameLost = true;
            alert("Game over!");
            // Highlight all cells with mines in red
            mineSet.forEach(mine => {
                const [r, c] = mine.split(",").map(Number);
                cells[r][c].style.backgroundColor = "red";
            });
        }
        else {
            // Otherwise, reveal the clicked cell and check if the game has been won
            revealCell(row, column);
            checkForWin();
        }
    }
};
// Add a click event listener to the grid
grid.addEventListener("click", (event) => {
    gameInteraction(event);
});
// document.addEventListener("keydown", (event) => {
//     if (event.code === "Space") {
//         event.preventDefault();
//         gameInteraction(event);
//     }
// });
grid.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (gameWon || gameLost) {
        return;
    }
    const target = event.target;
    const row = parseInt(target.dataset.row);
    const column = parseInt(target.dataset.column);
    markCell(row, column);
});
resetButton.addEventListener("click", resetGame);
initializeGrid();
displayHighscore();
const clearProbabilities = () => {
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const cell = cells[row][column];
            if (!cell.classList.contains('revealed')) {
                delete cell.dataset.probability; // Remove the probability data attribute
                cell.textContent = ''; // Clear the text content
            }
        }
    }
};
const calculateConstraintsForCell = (row, column) => {
    const constraints = new Set();
    const neighbors = getNeighbors(row, column);
    let mineCount = countAdjacentMines(row, column);
    neighbors.forEach(([r, c]) => {
        const cellKey = `${r},${c}`;
        if (!cells[r][c].classList.contains('revealed') && !cells[r][c].classList.contains('marked')) {
            constraints.add(cellKey);
        }
        else if (cells[r][c].classList.contains('marked')) {
            mineCount--;
        }
    });
    return { cellKey: `${row},${column}`, constraints };
};
const calculateMineProbabilityUsingCSP = () => {
    clearProbabilities(); // Reset probabilities before calculation
    let configurationsCount = new Map();
    const constraints = [];
    // Generate constraints for each revealed cell with a number
    revealedCells.forEach(([row, column]) => {
        if (cells[row][column].textContent) {
            constraints.push(calculateConstraintsForCell(row, column));
        }
    });
    // Simplify and solve the system of constraints
    // For now, let's assume the simple case where each number corresponds
    // directly to the number of mines around it.
    constraints.forEach(constraint => {
        const numMines = parseInt(cells[parseInt(constraint.cellKey.split(',')[0])][parseInt(constraint.cellKey.split(',')[1])].textContent || '0', 10);
        const numCells = constraint.constraints.size;
        const probability = numMines / numCells;
        constraint.constraints.forEach(cellKey => {
            const existingProbability = probabilities.get(cellKey);
            probabilities.set(cellKey, existingProbability !== undefined ? Math.max(existingProbability, probability) : probability);
        });
    });
    // Update cell probabilities
    probabilities.forEach((probability, cellKey) => {
        const [row, column] = cellKey.split(',').map(Number);
        const cell = cells[row][column];
        cell.dataset.probability = probability.toFixed(2); // Save to data attribute
        cell.textContent = probability.toFixed(2); // Display on UI
    });
};
const getPermutations = (arr, size) => {
    function p(t, i) {
        if (t.length === size)
            return [t];
        if (i + 1 > arr.length)
            return [];
        return p(t.concat(arr[i]), i + 1).concat(p(t, i + 1));
    }
    return p([], 0);
};
const validateConfiguration = (configuration, constraints) => {
    for (const constraint of constraints) {
        const mineCount = parseInt(cells[parseInt(constraint.cellKey.split(',')[0])][parseInt(constraint.cellKey.split(',')[1])].textContent || '0', 10);
        const adjacentMineCount = Array.from(constraint.constraints)
            .filter(key => configuration.has(key))
            .length;
        if (mineCount !== adjacentMineCount)
            return false;
    }
    return true;
};
const calculateMineProbabilityUsingBacktracking = () => {
    clearProbabilities(); // Reset probabilities before calculation
    let configurationsCount = new Map();
    const cellsToCheck = revealedCells
        .map(([row, column]) => calculateConstraintsForCell(row, column))
        .filter(c => c.constraints.size > 0);
    const backtrack = (currentConfig, index) => {
        if (index === cellsToCheck.length) {
            currentConfig.forEach(key => {
                configurationsCount.set(key, (configurationsCount.get(key) || 0) + 1);
            });
            return;
        }
        const cellConstraints = cellsToCheck[index];
        if (cellConstraints.constraints.size === 0) {
            backtrack(currentConfig, index + 1);
            return;
        }
        const permutationKeys = Array.from(cellConstraints.constraints);
        const mineCount = parseInt(cells[parseInt(cellConstraints.cellKey.split(',')[0])][parseInt(cellConstraints.cellKey.split(',')[1])].textContent || '0', 10);
        const permutations = mineCount === 0 ? [[]] : getPermutations(permutationKeys, mineCount);
        for (const permutation of permutations) {
            const newConfig = new Set(currentConfig);
            permutation.forEach(key => newConfig.add(key));
            if (cachedValidateConfiguration(newConfig, cellsToCheck.slice(0, index + 1))) {
                backtrack(newConfig, index + 1);
            }
        }
    };
    // Start backtracking from the first cell
    backtrack(new Set(), 0);
    // Calculate probabilities
    const configurationKeys = Array.from(configurationsCount.keys());
    const totalConfigurations = configurationKeys.reduce((acc, key) => acc + (configurationsCount.get(key) || 0), 0);
    configurationKeys.forEach(key => {
        const [row, column] = key.split(',').map(Number);
        const cell = cells[row][column];
        if (!cell.classList.contains('revealed')) { // Make sure we only update unrevealed cells
            const probability = (configurationsCount.get(key) || 0) / totalConfigurations;
            cell.dataset.probability = probability.toFixed(2); // Save to data attribute
            cell.textContent = probability.toFixed(2); // Display on UI
        }
    });
};
const memo = new Map();
const configurationToString = (configuration) => {
    return Array.from(configuration).sort().join(',');
};
const cachedValidateConfiguration = (configuration, constraints) => {
    const configStr = configurationToString(configuration);
    // Check if the result is already in the cache
    if (memo.has(configStr)) {
        return memo.get(configStr);
    }
    // If not, calculate it and store it in the cache
    const isValid = validateConfiguration(configuration, constraints);
    memo.set(configStr, isValid);
    return isValid;
};
