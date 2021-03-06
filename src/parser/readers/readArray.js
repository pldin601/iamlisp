import readExpression from "./readExpression";
import skipDelimiters from "../helpers/skipDelimiters";
import { chars } from "../chars";

export default function readArray(reader) {
  const { currentChar, isEof, nextChar } = reader;

  let expr = [];

  while (!isEof()) {
    skipDelimiters(reader);

    if (currentChar() === chars.RIGHT_SQUARE_BRACKET) {
      nextChar();
      return expr;
    }

    expr.push(readExpression(reader));
  }

  throw new Error("Unclosed array expression");
}
