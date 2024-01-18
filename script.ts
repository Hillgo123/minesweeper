const grid = document.getElementById("grid")!;
const resetButton = document.getElementById("reset")!;
var rows = 20;
var columns = 20;
const totalCells = rows * columns;
var mines = 80;
var randomShapeSize = 9;

let cells: HTMLDivElement[][] = [];
let minesPlaced = false;
let minesCount = 0;
let revealedCells: [number, number][] = [];
let markedCells: [number, number][] = [];

/**
 * Initializes the grid by creating a div element for each cell and appending it to the grid container.
 * Also adds the necessary dataset attributes to each cell.
 */
const initializeGrid = () => {
    for (let row = 0; row < rows; row++) {
        const rowArray: HTMLDivElement[] = [];

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


let mineSet: Set<string> = new Set();

/**
 * Randomly places mines on the game board until the desired number of mines is reached.
 */
const placeMines = (initialCells: [number, number][]) => {
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
const revealAdjacentCells = (row: number, column: number) => {
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
const randomShape = (row: number, column: number, size: number) => {
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
const revealCell = (row: number, column: number) => {
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
    } else {
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
};

/**
 * Counts the number of adjacent mines to a given cell.
 * @param row - The row index of the cell.
 * @param column - The column index of the cell.
 * @returns The number of adjacent mines.
 */
const countAdjacentMines = (row: number, column: number) => {
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
const getNeighbors = (row: number, column: number) => {
    // Create an empty array to store the neighbors
    const neighbors: [number, number][] = [];

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
const markCell = (row: number, column: number) => {
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
    } else {
        cell.classList.add("marked");
        cell.textContent = "✖";

        markedCells.push([row, column]);
    }
};

let startTime: number = new Date().getTime();

const timeElement = document.getElementById("time") as HTMLParagraphElement;

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

        timeElement.textContent = `Time: ${seconds} seconds`;

        // If the game has ended stop the timer.
        if (gameWon || gameLost) {
            clearInterval(timeInterval);

            // If the player won add the time to the highscore.
            if (!gameLost) {
                setHighscore(seconds, currentDifficulty)
            }

            displayHighscore(currentDifficulty);
        }

        return seconds
    }
};

let timeInterval = setInterval(updateTime, 1000);
clearInterval(timeInterval)

/**
 * Adds a new score to the high scores list and stores it in local storage.
 * @param score The score to be added to the high scores list.
 */
const setHighscore = (score: number, difficulty: string) => {
    let highScores = getHighscores(difficulty);
    highScores.push(score);
    highScores.sort((a: number, b: number) => a - b);
    localStorage.setItem(`highScores_${difficulty}`, JSON.stringify(highScores));
}


/**
 * Retrieves the high scores from local storage and parses them as JSON.
 * @returns {Array} An array of high scores.
 */
const getHighscores = (difficulty: string) => {
    const storedData = localStorage.getItem(`highScores_${difficulty}`);
    if (storedData) {
        try {
            return JSON.parse(storedData) || [];
        } catch (error) {
            console.error('Error parsing high scores:', error);
            return [];
        }
    }
    return [];
}

/**
 * Clears the highscore list by resetting the local storage to an empty array.
 */
const clearHighscoreList = (difficulty: string) => {
    localStorage.setItem(`highScores_${difficulty}`, JSON.stringify([]));
}

/**
 * Displays the highscores on the page.
 */
const displayHighscore = (difficulty: string) => {
    const highscores = getHighscores(difficulty);
    const highscoreElement = document.getElementById(`highscores`) as HTMLDivElement;

    highscoreElement.innerHTML = "<h2>Highscores:</h2>";

    if (highscores.length === 0) {
        highscoreElement.innerHTML = "<h2>Highscores:</h2><p>No current scores recorded</p>"
    }

    highscores.forEach((score: number, index: number) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}: ${score} seconds`;
        highscoreElement.appendChild(listItem);
    });
}


/**
 * Resets the game by updating the time, clearing the grid, resetting game variables, initializing the grid, and starting the time interval.
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

    clearInterval(timeInterval)

    timeElement.innerHTML = "Time: 0 seconds"

    initializeGrid();

    displayHighscore(currentDifficulty);
};

let gameLost = false;
let gameWon = false;

var currentDifficulty = 'hard';

const changeDifficulty = () => {
    var selectDifficulty = document.getElementsByClassName('difficulty-drop-down') as HTMLCollectionOf<HTMLInputElement>;
    var newDifficulty: String = selectDifficulty[0].value;

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
            currentDifficulty = 'easy'
            resetGame();
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
            resetGame();
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
            currentDifficulty = 'hard'
            resetGame();
            break;
        default:
            break;
    }
    displayHighscore(currentDifficulty);
}

// Used to prevent the game form using randomShape twice and crashing the game
let gameInitializing = false;

/**
 * Used to interact with the game board.
 * @param row row to reveal
 * @param column column to reveal
 * @returns 
 */
const gameInteraction = (row: number, column: number) => {
    // If the game has already been won or lost, do nothing
    if (gameWon || gameLost || gameInitializing) {
        return;
    }

    // If the mines haven't been placed yet, place them and reveal the initial cells
    if (!minesPlaced) {
        gameInitializing = true;

        const initialCells = randomShape(row, column, randomShapeSize);

        placeMines(initialCells);
        minesPlaced = true;
        initialCells.forEach(([r, c]) => revealCell(r, c));

        startTime = new Date().getTime();
        timeInterval = setInterval(updateTime, 1000);

        gameInitializing = false;
    } else {
        // If the clicked cell is a mine and isn't marked, the game is lost
        const target = cells[row][column];

        if (mineSet.has(`${row},${column}`) && !target.classList.contains("marked")) {
            gameLost = true;
            alert("Game over!");

            // Highlight all cells with mines in red
            mineSet.forEach(mine => {
                const [r, c] = mine.split(",").map(Number);
                cells[r][c].style.backgroundColor = "red";
            });
            cells[row][column].style.backgroundColor = "purple"
        } else {
            // Otherwise, reveal the clicked cell and check if the game has been won
            revealCell(row, column);
            calculateMineProbabilityUsingBacktracking();
            checkForWin();
        }
    }
}

/**
 * Gives a hint by revealing an unrevealed cell that has at least one revealed neighbor.
 */
const giveHint = () => {
    // If the game has already been won or lost, don't give a hint
    if (gameWon || gameLost) {
        return;
    }

    // Create an array to hold all unrevealed cells that have at least one revealed neighbor
    let unrevealedCells: [number, number][] = [];

    // Find all unrevealed cells
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const cell = cells[row][column];

            // If the cell is unrevealed and unmarked...
            if (!cell.classList.contains("revealed") && !cell.classList.contains("marked")) {
                // ...get its neighbors...
                const neighbors = getNeighbors(row, column);
                // ...and if at least one neighbor is revealed, add this cell to the list of unrevealed cells with revealed neighbors
                if (neighbors.some(([r, c]) => cells[r][c].classList.contains("revealed"))) {
                    unrevealedCells.push([row, column]);
                }
            }
        }
    }

    // If there are any unrevealed cells with revealed neighbors...
    if (unrevealedCells.length > 0) {
        let randomIndex: number;
        let row: number;
        let column: number;

        // ...choose a random unrevealed cell with revealed neighbors that is not a mine...
        do {
            randomIndex = Math.floor(Math.random() * unrevealedCells.length);
            [row, column] = unrevealedCells[randomIndex];
        } while (mineSet.has(`${row},${column}`));

        // ...and reveal it
        revealCell(row, column);
        checkForWin();

        // Increase the timer by 5 seconds when a hint is used
        if (startTime !== null) {
            startTime -= 5000;
            updateTime()
        }
    }
}

interface CellConstraints {
    cellKey: string;
    constraints: Set<string>;
}

const clearProbabilities = () => {
    memo.clear();
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

const calculateConstraintsForCell = (row: number, column: number): CellConstraints => {
    const constraints = new Set<string>();
    const neighbors = getNeighbors(row, column);
    let mineCount = countAdjacentMines(row, column);

    neighbors.forEach(([r, c]) => {
        const cellKey = `${r},${c}`;
        if (!cells[r][c].classList.contains('revealed') && !cells[r][c].classList.contains('marked')) {
            constraints.add(cellKey);
        } else if (cells[r][c].classList.contains('marked')) {
            mineCount--;
        }
    });

    return { cellKey: `${row},${column}`, constraints };
};

const getPermutations = (arr: number[], size: number): number[][] => {
    function p(t: number[], i: number): number[][] {
        if (t.length === size) return [t];
        if (i + 1 > arr.length) return [];
        return p(t.concat(arr[i]), i + 1).concat(p(t, i + 1));
    }
    return p([], 0);
};

const validateConfiguration = (configuration: Set<string>, constraints: CellConstraints[]): boolean => {
    for (const constraint of constraints) {
        const mineCount = parseInt(cells[parseInt(constraint.cellKey.split(',')[0])][parseInt(constraint.cellKey.split(',')[1])].textContent || '0', 10);
        const adjacentMineCount = Array.from(constraint.constraints)
            .filter(key => configuration.has(key))
            .length;
        if (mineCount !== adjacentMineCount) return false;
    }
    return true;
};

const calculateMineProbabilityUsingBacktracking = () => {
    let configurationsCount = new Map<string, number>();
    const cellsToCheck: CellConstraints[] = revealedCells
        .map(([row, column]) => calculateConstraintsForCell(row, column))
        .filter(c => c.constraints.size > 0);

    const backtrack = (currentConfig: Set<string>, index: number) => {
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
    backtrack(new Set<string>(), 0);

    // Calculate probabilities
    const configurationKeys = Array.from(configurationsCount.keys());
    const totalConfigurations = configurationKeys.reduce((acc, key) => acc + (configurationsCount.get(key) || 0), 0);


    configurationKeys.forEach(key => {
        const [row, column] = key.split(',').map(Number);
        const cell = cells[row][column];
        if (!cell.classList.contains('revealed')) { // Make sure we only update unrevealed cells
            const probability = (configurationsCount.get(key) || 0) / totalConfigurations;
            cell.dataset.probability = probability.toString(); // Save probability as a string in the dataset

            // Explicitly check if the probability is zero, and display "0" if it is
            cell.textContent = probability == 0 ? "0" : probability.toFixed(2);
        }
    });
};

const memo = new Map<string, boolean>();

const configurationToString = (configuration: Set<string>): string => {
    return Array.from(configuration).sort().join(',');
};

const cachedValidateConfiguration = (configuration: Set<string>, constraints: CellConstraints[]): boolean => {
    const configStr = configurationToString(configuration);
    // Check if the result is already in the cache
    if (memo.has(configStr)) {
        return memo.get(configStr)!;
    }

    // If not, calculate it and store it in the cache
    const isValid = validateConfiguration(configuration, constraints);
    memo.set(configStr, isValid);
    return isValid;
};

const revealSafestCell = () => {
    calculateMineProbabilityUsingBacktracking();
    for (const [row, column] of revealedCells) {
        const cell = cells[row][column];
        // Check if the revealed cell has no adjacent mines
        if (cell.textContent === "") {
            const neighbors = getNeighbors(row, column);
            for (const [neighborRow, neighborColumn] of neighbors) {
                const neighborCell = cells[neighborRow][neighborColumn];
                // If the neighbor cell is not revealed and has no 'probability' data set...
                if (!neighborCell.classList.contains("revealed") && !neighborCell.dataset.probability) {
                    // ...reveal this neighbor cell
                    gameInteraction(neighborRow, neighborColumn);
                    return; // Exit after revealing one such neighbor cell
                }
            }
        }
    }

    // If no adjacent empty cell was revealed, proceed with revealing the safest cell
    calculateMineProbabilityUsingBacktracking();

    // Initialize variables to keep track of the cell with the lowest probability
    let lowestProbability = 1.0;
    let safestCellCoordinates = null;

    // Iterate over unrevealed cells to find the one with the lowest probability
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const cell = cells[row][column];
            // Check if the cell has a probability calculated and is not revealed
            if (!cell.classList.contains("revealed") && cell.dataset.probability) {
                const probability = parseFloat(cell.dataset.probability);
                if (probability < lowestProbability) {
                    lowestProbability = probability;
                    safestCellCoordinates = [row, column];
                }
            }
        }
    }

    // If a safest cell was found with the calculated probability, reveal it
    if (safestCellCoordinates) {
        const [row, column] = safestCellCoordinates;
        gameInteraction(row, column);
    }
};

// Add a click event listener to the grid
grid.addEventListener("click", (event) => {
    const target = event.target as HTMLDivElement;
    const row = parseInt(target.dataset.row!);
    const column = parseInt(target.dataset.column!);

    gameInteraction(row, column)
});

// Add a keydown event listener to the document to reveal cells with spacebar
let focusedCell: HTMLDivElement | null = null;

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        if (focusedCell) {
            const row = parseInt(focusedCell.dataset.row!);
            const column = parseInt(focusedCell.dataset.column!);

            gameInteraction(row, column)
        }
    }
});

// Add a mousemove event listener to get the target of the mouse for the spacebar event listener
grid.addEventListener("mousemove", (event) => {
    const target = event.target as HTMLDivElement;
    if (target.classList.contains("cell")) {
        focusedCell = target;
    }
});


grid.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    if (gameWon || gameLost) {
        return;
    }

    const target = event.target as HTMLDivElement;
    const row = parseInt(target.dataset.row!);
    const column = parseInt(target.dataset.column!);

    markCell(row, column);
});

resetButton.addEventListener("click", resetGame);

initializeGrid();
displayHighscore(currentDifficulty)