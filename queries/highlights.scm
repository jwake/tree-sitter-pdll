[
  (comment)
  (multiline_comment)
] @comment

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
] @punctuation.bracket

[
  ","
  ";"
  "."
] @punctuation.delimiter

[
  "#"
  ":"
] @operator

[
  "="
  "!cond"
  (operator_keyword)
] @function

(var) @variable

(template_arg (identifier) @variable.parameter)

(_ argument: (value (identifier) @variable.parameter))

(type) @type

"code" @type.builtin

(number) @constant.numeric.integer
[
  (string_string)
  (code_string)
] @string

(preprocessor) @keyword.directive

[
 "Pattern",
 "Constraint",
 "Attr",
 "Value",
 "ValueRange",
] @type.builtin

[
 "with",
 "benefit",
] @keyword

[
  "let"
  "op"
  "attr"
  "replace"
  "rewrite"
] @keyword.operator

"include" @keyword.control.import

[
  "multiclass"
  "defm"
] @namespace

(ERROR) @error
