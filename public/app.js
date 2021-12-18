const COLOR_PICKER = document.getElementById("color-picker");
const WHITEBOARD = document.getElementById("whiteboard");
const CLEAR_BUTN = document.getElementById("clear-butn");
const ERASER = document.getElementById("eraser");
const TABLE_ROWS = 80;
const TABLE_COLS = 80;
const socket = new WebSocket(`ws://${document.location.host}/ws`);
let mouseIsDown = false;
let currentColor = "#0000ff";

socket.onmessage = (e) => {
    console.log(JSON.parse(e.data));
}

socket.onclose = (e) => {
    console.log("Websocket connection lost...");
}

COLOR_PICKER.onchange = (e) => currentColor = e.target.value;
ERASER.onclick = () => currentColor="#f1f1f1", COLOR_PICKER.value = "#f1f1f1";
CLEAR_BUTN.onclick = "click", () => {
    WHITEBOARD.innerHTML = "";
    generateWhiteboard();
    generateDefaultWhiteboardState();
}

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
            td.addEventListener("mouseover", (e) => {
                if(mouseIsDown) {onChange(e)};
            })
            td.addEventListener("click", (e) => onChange(e));

            row.appendChild(td);
        }
    }
}

generateWhiteboard();

function onChange(e) {
    let [row, col] = e.target.id.split(" ");
    whiteboardState[row][col] = {
        row,
        col,
        colour: currentColor,
    };

    updateCell(row, col)
}

function updateCell(row, col) {
    WHITEBOARD.childNodes[row].childNodes[col].style.background = currentColor;
}
