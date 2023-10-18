const grid = document.getElementById("grid")!;
const resetButton = document.getElementById("reset")!;

const rows = 20;
const columns = 20;
const totalCells = rows * columns;
const mines = 80;

let cells: HTMLDivElement[][] = [];
let minesPlaced = false;
let minesCount = 0;
let revealedCells: [number, number][] = [];
let markedCells: [number, number][] = [];

const initializeGrid = () => {
    for (let row = 0; row < rows; row++) {
        const rowArray: HTMLDivElement[] = [];

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

const revealAdjacentCells = (row: number, col: number) => {
    const neighbors = getNeighbors(row, col);

    neighbors.forEach(([r, c]) => {
        if (!revealedCells.some(([x, y]) => x === r && y === c)) {
            revealCell(r, c);
        }
    });
};

const getRandomShape = (row: number, col: number) => {
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

const revealCell = (row: number, col: number) => {
    const cell = cells[row][col];

    if (cell.classList.contains("revealed") || cell.classList.contains("mine") || cell.classList.contains("marked")) {
        return;
    }

    cell.classList.add("revealed");
    revealedCells.push([row, col]);
    const mineCount = countAdjacentMines(row, col);

    if (mineCount === 0) {
        revealAdjacentCells(row, col);
    } else {
        cell.textContent = mineCount.toString();
    }

};

const countAdjacentMines = (row: number, col: number) => {
    const neighbors = getNeighbors(row, col);
    let count = 0;

    neighbors.forEach(([r, c]) => {
        if (cells[r][c].classList.contains("mine")) {
            count++;
        }
    });

    return count;
};

const getNeighbors = (row: number, col: number) => {
    const neighbors: [number, number][] = [];

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
    }
};

const markCell = (row: number, col: number) => {
    const cell = cells[row][col];

    if (cell.classList.contains("revealed")) {
        return;
    }

    if (cell.classList.contains("marked")) {
        cell.classList.remove("marked");
        cell.textContent = "";

        markedCells = markedCells.filter(([r, c]) => r !== row || c !== col);
    } else {
        cell.classList.add("marked");
        cell.textContent = "✖";

        markedCells.push([row, col]);
    }
};

const resetGame = () => {
    grid.innerHTML = "";
    cells = [];
    minesPlaced = false;
    minesCount = 0;
    revealedCells = [];
    markedCells = [];

    initializeGrid();
};

grid.addEventListener("click", (event) => {
    const target = event.target as HTMLDivElement;
    const row = parseInt(target.dataset.row!);
    const col = parseInt(target.dataset.col!);

    if (!minesPlaced) {
        const initialCells = getRandomShape(row, col);

        initialCells.forEach(([r, c]) => placeMines());
        minesPlaced = true;
        initialCells.forEach(([r, c]) => revealCell(r, c));
    } else {
        if (target.classList.contains("mine") && !target.classList.contains("marked")) {
            alert("Game over!");
            const cellsWithMine = document.getElementsByClassName("mine");

            for (let i = 0; i < cellsWithMine.length; i++) {
                const cell = cellsWithMine[i] as HTMLDivElement;
                cell.style.backgroundColor = 'red';
            }
        } else {
            revealCell(row, col);
            checkForWin();
        }
    }

});

grid.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const target = event.target as HTMLDivElement;
    const row = parseInt(target.dataset.row!);
    const col = parseInt(target.dataset.col!);

    markCell(row, col);
});

resetButton.addEventListener("click", resetGame);

initializeGrid();
