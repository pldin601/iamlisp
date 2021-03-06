export const chars = {
  LEFT_PAREN: "(",
  RIGHT_PAREN: ")",
  LEFT_BRACKET: "{",
  RIGHT_BRACKET: "}",
  LEFT_SQUARE_BRACKET: "[",
  RIGHT_SQUARE_BRACKET: "]",
  DOUBLE_QUOTE: '"',
  SINGLE_QUOTE: "'",
  BACKSLASH: "\\",
  SPACE: " ",
  TAB: "\t",
  LINE_FEED: "\n",
  CARRIAGE_RETURN: "\r",
  SEMICOLON: ";",
  CARET: "^",
  SHARP: "#"
};

export const punctuators = {
  DOT: ".",
  ELLIPSIS: "..."
};

export const reserved = new Set(Object.values(chars));

export const delimiters = new Set([
  chars.SPACE,
  chars.TAB,
  chars.LINE_FEED,
  chars.CARRIAGE_RETURN
]);
