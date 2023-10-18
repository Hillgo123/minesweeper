"use strict";
const grid = document.getElementById("grid");
const resetButton = document.getElementById("reset");
const rows = 20;
const columns = 20;
const totalCells = rows * columns;
const mines = 380;
let cells = [];
let minesPlaced = false;
let minesCount = 0;
let revealedCells = [];
let markedCells = [];
const initializeGrid = () => {
    for (let row = 0; row < rows; row++) {
        const rowArray = [];
        for (let col = 0; col < columns; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row.toString();
            cell.dataset.col = col.toString();
            grid.appendChild(cell);
            rowArray.push(cell);
        }
        cells.push(rowArray);
    }
};
const placeMines = () => {
    while (minesCount < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * columns);
        if (!revealedCells.some(([r, c]) => r === row && c === col) &&
            !cells[row][col].classList.contains("mine")) {
            cells[row][col].classList.add("mine");
            minesCount++;
        }
    }
};
const revealAdjacentCells = (row, col) => {
    const neighbors = getNeighbors(row, col);
    neighbors.forEach(([r, c]) => {
        if (!revealedCells.some(([x, y]) => x === r && y === c)) {
            revealCell(r, c);
        }
    });
};
const getRandomShape = (row, col) => {
    revealedCells = [[row, col]];
    let count = Math.floor(Math.random() * 3) + 9;
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
const revealCell = (row, col) => {
    const cell = cells[row][col];
    if (cell.classList.contains("revealed") || cell.classList.contains("mine") || cell.classList.contains("marked")) {
        return;
    }
    cell.classList.add("revealed");
    revealedCells.push([row, col]);
    const mineCount = countAdjacentMines(row, col);
    if (mineCount === 0) {
        revealAdjacentCells(row, col);
    }
    else {
        cell.textContent = mineCount.toString();
    }
};
const countAdjacentMines = (row, col) => {
    const neighbors = getNeighbors(row, col);
    let count = 0;
    neighbors.forEach(([r, c]) => {
        if (cells[r][c].classList.contains("mine")) {
            count++;
        }
    });
    return count;
};
const getNeighbors = (row, col) => {
    const neighbors = [];
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(columns - 1, col + 1); c++) {
            if (r !== row || c !== col) {
                neighbors.push([r, c]);
            }
        }
    }
    return neighbors;
};
const checkForWin = () => {
    let allCellsRevealed = true;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const cell = cells[row][col];
            if (!cell.classList.contains("mine") && !cell.classList.contains("revealed")) {
                allCellsRevealed = false;
                break;
            }
        }
    }
    if (allCellsRevealed) {
        alert("You won!");
        setHighscore(updateTime(false) || '');
        return true;
    }
    return false;
};
const markCell = (row, col) => {
    const cell = cells[row][col];
    if (cell.classList.contains("revealed")) {
        return;
    }
    if (cell.classList.contains("marked")) {
        cell.classList.remove("marked");
        cell.textContent = "";
        markedCells = markedCells.filter(([r, c]) => r !== row || c !== col);
    }
    else {
        cell.classList.add("marked");
        cell.textContent = "✖";
        markedCells.push([row, col]);
    }
};
let startTime = new Date().getTime();
const updateTime = (gameOverCheck = true) => {
    if (startTime !== null) {
        const currentTime = new Date().getTime();
        const elapsedMilliseconds = currentTime - startTime;
        const seconds = Math.floor(elapsedMilliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const timeElement = document.getElementById("time");
        timeElement.textContent = `Time: ${minutes}:${seconds % 60}`;
        if (gameOverCheck && checkForWin() || gameLost) {
            clearInterval(timeInterval);
            setHighscore(`${minutes}:${seconds % 60}`);
        }
        return `${minutes}:${seconds % 60}`;
    }
};
let timeInterval = setInterval(updateTime, 1000);
const setHighscore = (score) => {
    var highScores = JSON.parse(localStorage['highScores']);
    highScores.push(score);
    localStorage['highScores'] = JSON.stringify(highScores.sort());
    console.log(JSON.parse(localStorage['highScores']));
};
const getHighscores = () => {
    return JSON.parse(localStorage['highScores']);
};
const clearHighscoreList = () => {
    const highscores = [];
    localStorage['highScores'] = JSON.stringify(highscores);
};
const displayHighscore = () => {
    const highscores = getHighscores();
    const highscoreElement = document.getElementById("highscores");
    highscoreElement.textContent = `Highscores: ${highscores}`;
};
const resetGame = () => {
    updateTime(false);
    grid.innerHTML = "";
    cells = [];
    minesPlaced = false;
    minesCount = 0;
    revealedCells = [];
    markedCells = [];
    startTime = new Date().getTime();
    initializeGrid();
    timeInterval = setInterval(updateTime, 1000);
};
let gameLost = false;
grid.addEventListener("click", (event) => {
    const target = event.target;
    const row = parseInt(target.dataset.row);
    const col = parseInt(target.dataset.col);
    if (!minesPlaced) {
        const initialCells = getRandomShape(row, col);
        initialCells.forEach(([r, c]) => placeMines());
        minesPlaced = true;
        initialCells.forEach(([r, c]) => revealCell(r, c));
    }
    else {
        if (target.classList.contains("mine") && !target.classList.contains("marked")) {
            gameLost = true;
            alert("Game over!");
            const cellsWithMine = document.getElementsByClassName("mine");
            for (let i = 0; i < cellsWithMine.length; i++) {
                const cell = cellsWithMine[i];
                cell.style.backgroundColor = 'red';
            }
        }
        else {
            revealCell(row, col);
            checkForWin();
        }
    }
});
grid.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const target = event.target;
    const row = parseInt(target.dataset.row);
    const col = parseInt(target.dataset.col);
    markCell(row, col);
});
resetButton.addEventListener("click", resetGame);
initializeGrid();
