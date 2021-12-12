const WHITEBOARD = document.getElementById("whiteboard");
const TABLE_ROWS = 80;
const TABLE_COLS = 80;
let mouseIsDown = false;

document.body.onmousedown = e => {
    if(e.button == 0){ mouseIsDown = true; }
    else { mouseIsDown = false; }
}
document.body.onmouseup = () => {
    mouseIsDown = false;    
}

// @todo generate whiteboard from json object

// generates html table element
function generateWhiteboardTable() {
    for(i=0; i<TABLE_ROWS; i++) {
        let row = document.createElement("tr");
        row.id = `${i}`;
        WHITEBOARD.appendChild(row);

        for(j=0; j<TABLE_COLS; j++) {
            let td = document.createElement("td");
            td.id = `col-${j} row-${i}`;
            td.addEventListener("mouseover", (e) => {
                if(mouseIsDown) {
                    td.style.background = "blue"
                }
            })
            td.addEventListener("click", () => td.style.background = "blue")

            row.appendChild(td);
        }
    }
}

generateWhiteboardTable();

/**
 * [{
 *  row: 0
 *  column: 2
 * color: blue
 * }]
 */