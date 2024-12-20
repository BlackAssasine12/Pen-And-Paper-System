"use strict";

function InToHTML(operation) {
    document.getElementById("eqField").innerHTML += operation;
    document.getElementById("evField").innerText = " ";
}

function clearEqField() {
    document.getElementById("eqField").innerText = " ";
    document.getElementById("evField").innerText = " ";
}

function calculate() {
    let calculate = (document.getElementById("eqField").innerText);
    let result = eval(calculate);

    document.getElementById("evField").innerText = result;
    console.log(calculate +"="+result);
}


//https://www.w3schools.com/howto/howto_js_draggable.asp
//Make the DIV element draggagle:
dragElement(document.getElementById("container"));
dragElement(document.getElementById("FieldContainer"));

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "dragfield")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "dragfield").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}