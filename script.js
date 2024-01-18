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
const placeMines = (initialCells) => {
    while (minesCount < mines) {
        const row = Math.floor(Math.random() * rows);
        const column = Math.floor(Math.random() * columns);
        if (initialCells.some(([r, c]) => r === row && c === column)) {
            continue;
        }
        const cellKey = `${row},${column}`;
        if (!mineSet.has(cellKey)) {
            mineSet.add(cellKey);
            minesCount++;
        }
    }
};
const revealAdjacentCells = (row, column) => {
    const neighbors = getNeighbors(row, column);
    neighbors.forEach(([r, c]) => {
        if (!revealedCells.some(([x, y]) => x === r && y === c)) {
            revealCell(r, c);
        }
    });
};
const randomShape = (row, column, size) => {
    revealedCells = [[row, column]];
    let count = Math.floor(Math.random() * 3) + size;
    while (count > 0) {
        const randomCell = revealedCells[Math.floor(Math.random() * revealedCells.length)];
        const neighbors = getNeighbors(randomCell[0], randomCell[1]);
        for (const [r, c] of neighbors) {
            if (!revealedCells.some(cell => cell[0] === r && cell[1] === c)) {
                revealedCells.push([r, c]);
                count--;
            }
        }
    }
    return revealedCells;
};
const revealCell = (row, column) => {
    const cell = cells[row][column];
    if (cell.classList.contains("revealed") || mineSet.has(`${row},${column}`) || cell.classList.contains("marked")) {
        return;
    }
    cell.classList.add("revealed");
    revealedCells.push([row, column]);
    const mineCount = countAdjacentMines(row, column);
    if (mineCount === 0) {
        revealAdjacentCells(row, column);
    }
    else {
        cell.textContent = mineCount.toString();
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
const getNeighbors = (row, column) => {
    const neighbors = [];
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, column - 1); c <= Math.min(columns - 1, column + 1); c++) {
            if (r !== row || c !== column) {
                neighbors.push([r, c]);
            }
        }
    }
    return neighbors;
};
const checkForWin = () => {
    let allCellsRevealed = true;
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const cell = cells[row][column];
            if (!mineSet.has(`${row},${column}`) && !cell.classList.contains("revealed")) {
                allCellsRevealed = false;
                break;
            }
        }
    }
    if (allCellsRevealed) {
        gameWon = true;
        mineSet.forEach(mine => {
            const [r, c] = mine.split(",").map(Number);
            cells[r][c].style.backgroundColor = "red";
        });
        alert("You won!");
        return true;
    }
    return false;
};
const markCell = (row, column) => {
    const cell = cells[row][column];
    if (cell.classList.contains("revealed")) {
        return;
    }
    if (cell.classList.contains("marked")) {
        cell.classList.remove("marked");
        cell.textContent = "";
        markedCells = markedCells.filter(([r, c]) => r !== row || c !== column);
    }
    else {
        cell.classList.add("marked");
        cell.textContent = "✖";
        markedCells.push([row, column]);
    }
};
let startTime = new Date().getTime();
const timeElement = document.getElementById("time");
const updateTime = () => {
    if (startTime !== null) {
        const currentTime = new Date().getTime();
        const elapsedMilliseconds = currentTime - startTime;
        const seconds = Math.floor(elapsedMilliseconds / 1000);
        timeElement.textContent = `Time: ${seconds} seconds`;
        if (gameWon || gameLost) {
            clearInterval(timeInterval);
            if (!gameLost) {
                setHighscore(seconds, currentDifficulty);
            }
            displayHighscore(currentDifficulty);
        }
        return seconds;
    }
};
let timeInterval = setInterval(updateTime, 1000);
clearInterval(timeInterval);
const setHighscore = (score, difficulty) => {
    let highScores = getHighscores(difficulty);
    highScores.push(score);
    highScores.sort((a, b) => a - b);
    localStorage.setItem(`highScores_${difficulty}`, JSON.stringify(highScores));
};
const getHighscores = (difficulty) => {
    const storedData = localStorage.getItem(`highScores_${difficulty}`);
    if (storedData) {
        try {
            return JSON.parse(storedData) || [];
        }
        catch (error) {
            console.error('Error parsing high scores:', error);
            return [];
        }
    }
    return [];
};
const clearHighscoreList = (difficulty) => {
    localStorage.setItem(`highScores_${difficulty}`, JSON.stringify([]));
};
const displayHighscore = (difficulty) => {
    const highscores = getHighscores(difficulty);
    const highscoreElement = document.getElementById(`highscores`);
    highscoreElement.innerHTML = "<h2>Highscores:</h2>";
    if (highscores.length === 0) {
        highscoreElement.innerHTML = "<h2>Highscores:</h2><p>No current scores recorded</p>";
    }
    highscores.forEach((score, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}: ${score} seconds`;
        highscoreElement.appendChild(listItem);
    });
};
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
    timeElement.innerHTML = "Time: 0 seconds";
    initializeGrid();
    displayHighscore(currentDifficulty);
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
            currentDifficulty = 'hard';
            resetGame();
            break;
        default:
            break;
    }
    displayHighscore(currentDifficulty);
};
let gameInitializing = false;
const gameInteraction = (row, column) => {
    if (gameWon || gameLost || gameInitializing) {
        return;
    }
    if (!minesPlaced) {
        gameInitializing = true;
        const initialCells = randomShape(row, column, randomShapeSize);
        placeMines(initialCells);
        minesPlaced = true;
        initialCells.forEach(([r, c]) => revealCell(r, c));
        startTime = new Date().getTime();
        timeInterval = setInterval(updateTime, 1000);
        gameInitializing = false;
    }
    else {
        const target = cells[row][column];
        if (mineSet.has(`${row},${column}`) && !target.classList.contains("marked")) {
            gameLost = true;
            alert("Game over!");
            mineSet.forEach(mine => {
                const [r, c] = mine.split(",").map(Number);
                cells[r][c].style.backgroundColor = "red";
            });
            cells[row][column].style.backgroundColor = "purple";
        }
        else {
            revealCell(row, column);
            calculateMineProbabilityUsingBacktracking();
            checkForWin();
        }
    }
};
const giveHint = () => {
    if (gameWon || gameLost) {
        return;
    }
    let unrevealedCells = [];
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const cell = cells[row][column];
            if (!cell.classList.contains("revealed") && !cell.classList.contains("marked")) {
                const neighbors = getNeighbors(row, column);
                if (neighbors.some(([r, c]) => cells[r][c].classList.contains("revealed"))) {
                    unrevealedCells.push([row, column]);
                }
            }
        }
    }
    if (unrevealedCells.length > 0) {
        let randomIndex;
        let row;
        let column;
        do {
            randomIndex = Math.floor(Math.random() * unrevealedCells.length);
            [row, column] = unrevealedCells[randomIndex];
        } while (mineSet.has(`${row},${column}`));
        revealCell(row, column);
        checkForWin();
        if (startTime !== null) {
            startTime -= 5000;
            updateTime();
        }
    }
};
const clearProbabilities = () => {
    memo.clear();
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const cell = cells[row][column];
            if (!cell.classList.contains('revealed')) {
                delete cell.dataset.probability;
                cell.textContent = '';
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
    backtrack(new Set(), 0);
    const configurationKeys = Array.from(configurationsCount.keys());
    const totalConfigurations = configurationKeys.reduce((acc, key) => acc + (configurationsCount.get(key) || 0), 0);
    configurationKeys.forEach(key => {
        const [row, column] = key.split(',').map(Number);
        const cell = cells[row][column];
        if (!cell.classList.contains('revealed')) {
            const probability = (configurationsCount.get(key) || 0) / totalConfigurations;
            cell.dataset.probability = probability.toString();
            cell.textContent = probability == 0 ? "0" : probability.toFixed(2);
        }
    });
};
const memo = new Map();
const configurationToString = (configuration) => {
    return Array.from(configuration).sort().join(',');
};
const cachedValidateConfiguration = (configuration, constraints) => {
    const configStr = configurationToString(configuration);
    if (memo.has(configStr)) {
        return memo.get(configStr);
    }
    const isValid = validateConfiguration(configuration, constraints);
    memo.set(configStr, isValid);
    return isValid;
};
const revealSafestCell = () => {
    calculateMineProbabilityUsingBacktracking();
    for (const [row, column] of revealedCells) {
        const cell = cells[row][column];
        if (cell.textContent === "") {
            const neighbors = getNeighbors(row, column);
            for (const [neighborRow, neighborColumn] of neighbors) {
                const neighborCell = cells[neighborRow][neighborColumn];
                if (!neighborCell.classList.contains("revealed") && !neighborCell.dataset.probability) {
                    gameInteraction(neighborRow, neighborColumn);
                    return;
                }
            }
        }
    }
    calculateMineProbabilityUsingBacktracking();
    let lowestProbability = 1.0;
    let safestCellCoordinates = null;
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const cell = cells[row][column];
            if (!cell.classList.contains("revealed") && cell.dataset.probability) {
                const probability = parseFloat(cell.dataset.probability);
                if (probability < lowestProbability) {
                    lowestProbability = probability;
                    safestCellCoordinates = [row, column];
                }
            }
        }
    }
    if (safestCellCoordinates) {
        const [row, column] = safestCellCoordinates;
        gameInteraction(row, column);
    }
};
grid.addEventListener("click", (event) => {
    const target = event.target;
    const row = parseInt(target.dataset.row);
    const column = parseInt(target.dataset.column);
    gameInteraction(row, column);
});
let focusedCell = null;
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        if (focusedCell) {
            const row = parseInt(focusedCell.dataset.row);
            const column = parseInt(focusedCell.dataset.column);
            gameInteraction(row, column);
        }
    }
});
grid.addEventListener("mousemove", (event) => {
    const target = event.target;
    if (target.classList.contains("cell")) {
        focusedCell = target;
    }
});
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
displayHighscore(currentDifficulty);
