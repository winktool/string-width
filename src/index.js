import eastAsianWidth from "eastasianwidth";
import emojiRegex from "emoji-regex";

function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))",
  ].join("|");

  return new RegExp(pattern, onlyFirst ? undefined : "g");
}

function stripAnsi(string) {
  if (typeof string !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }
  const regex = ansiRegex();
  // Even though the regex is global, we don't need to reset the `.lastIndex`
  // because unlike `.exec()` and `.test()`, `.replace()` does it automatically
  // and doing it manually has a performance penalty.
  return string.replace(regex, "");
}

module.export = function stringWidth(string, options) {
  if (typeof string !== "string" || string.length === 0) {
    return 0;
  }

  options = {
    ambiguousIsNarrow: true,
    countAnsiEscapeCodes: false,
    ...options,
  };

  if (!options.countAnsiEscapeCodes) {
    string = stripAnsi(string);
  }

  if (string.length === 0) {
    return 0;
  }

  const ambiguousCharacterWidth = options.ambiguousIsNarrow ? 1 : 2;
  let width = 0;

  for (const { segment: character } of new Intl.Segmenter().segment(string)) {
    const codePoint = character.codePointAt(0);

    // Ignore control characters
    if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      continue;
    }

    // Ignore combining characters
    if (codePoint >= 0x3_00 && codePoint <= 0x3_6f) {
      continue;
    }

    if (emojiRegex().test(character)) {
      width += 2;
      continue;
    }

    const code = eastAsianWidth.eastAsianWidth(character);
    switch (code) {
      case "F":
      case "W": {
        width += 2;
        break;
      }

      case "A": {
        width += ambiguousCharacterWidth;
        break;
      }

      default: {
        width += 1;
      }
    }
  }

  return width;
};
