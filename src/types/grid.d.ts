import Cell from "./cell";

export default interface Grid {
  size: number;
  elements: number;
  cells: Array<Array<Cell>>;
}
