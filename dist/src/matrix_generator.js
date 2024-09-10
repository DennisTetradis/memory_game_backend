"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Generate_Matrix;
function Generate_Matrix(elements, size) {
    let array = new Array(size);
    let matrix = { size, elements, cells: array };
    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    for (let i = 0; i < size; i++) {
        array[i] = new Array(size);
        for (let j = 0; j < size; j++) {
            array[i][j] = { element: false, open: false };
        }
    }
    for (let i = elements; i > 0;) {
        const x = randomIntFromInterval(0, size - 1);
        const y = randomIntFromInterval(0, size - 1);
        if (array[x][y].element === false) {
            array[x][y].element = true;
            i--;
        }
    }
    matrix.cells = array;
    return matrix;
}
