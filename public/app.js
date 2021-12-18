const COLOR_PICKER = document.getElementById("color-picker");
const WHITEBOARD = document.getElementById("whiteboard");
const CLEAR_BUTN = document.getElementById("clear-butn");
const ERASER = document.getElementById("eraser");
const GRID_LINES_TOGGLE = document.getElementById("gridlines");
const TABLE_ROWS = 80;
const TABLE_COLS = 80;
const socket = new WebSocket(`ws://${document.location.host}/ws`);
let mouseIsDown = false;
let currentColor = "#0000ff";

socket.onmessage = (e) => {
    let msg = JSON.parse(e.data).body;
    if(msg.startsWith("Update cell")) {
        let [_, __, row, col, color] = msg.split(" ");
        onChange(row, col, color);
    } else if(msg === "Clear") {
        clearBoard();
    } else if(msg === "Send state") {
        socket.send(`Update board: ${JSON.stringify(whiteboardState)}`);
    } else if(msg.startsWith("Update board")) {
        whiteboardState = JSON.parse(msg.substring(14));
        WHITEBOARD.innerHTML = "";
        generateWhiteboard();
    } 
}

GRID_LINES_TOGGLE.onclick = () => {
    Array.prototype.forEach.call(document.getElementsByClassName('cell'), (cell)  => {
        cell.classList.toggle("grid");
    });
}

COLOR_PICKER.addEventListener("change", (e) => currentColor = e.target.value);
CLEAR_BUTN.addEventListener("click", () => {
    socket.send("Clear");
    clearBoard();
});
ERASER.addEventListener("click", () => {currentColor="#f1f1f1", COLOR_PICKER.value = "#f1f1f1"})

document.body.onmousedown = e => {
    if(e.button == 0){ mouseIsDown = true; }
    else { mouseIsDown = false; }
}
document.body.onmouseup = () => {
    mouseIsDown = false;
}

let whiteboardState = [];
function generateDefaultWhiteboardState() {
    for (let i = 0; i < TABLE_ROWS; i++) {
        let row = [];
        for (let col = 0; col < TABLE_COLS; col++) {
            row.push({
                row: i,
                col,
                color: "#f1f1f1",
            });
        }
        whiteboardState.push(row);
    }
}

generateDefaultWhiteboardState();

// generates html table element
function generateWhiteboard() {
    for(i = 0; i < TABLE_ROWS; i++) {
        let row = document.createElement("tr");
        row.id = `${i}`;
        WHITEBOARD.appendChild(row);

        for(j = 0; j < TABLE_COLS; j++) {
            let td = document.createElement("td");
            td.id = `${i} ${j}`;
            td.className="cell grid";
            td.style.background = whiteboardState[i][j].color;
            td.addEventListener("mouseover", (e) => {
                if(mouseIsDown) {
                    let [row, col] = e.target.id.split(" ");
                    socket.send(`Update cell: ${row} ${col} ${currentColor}`);
                    onChange(row, col, currentColor);
                };
            })
            td.addEventListener("click", (e) => {
                let [row, col] = e.target.id.split(" ");
                socket.send(`Update cell: ${row} ${col} ${currentColor}`);
                onChange(row, col, currentColor);
            });

            row.appendChild(td);
        }
    }
}

generateWhiteboard();

function onChange(row, col, color) {
    whiteboardState[row][col] = {
        row,
        col,
        color,
    };

    updateCell(row, col, color);
}

function updateCell(row, col, color) {
    WHITEBOARD.childNodes[row].childNodes[col].style.background = color;
}

function clearBoard() {
    WHITEBOARD.innerHTML = "";
    whiteboardState = [];
    generateDefaultWhiteboardState();
    generateWhiteboard();
}