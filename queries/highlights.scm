[
  (comment)
  (multiline_comment)
] @comment

[
  "("
  ")"
  ; "["
  ; "]"
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

; [
;   "="
;   (operator_keyword)
; ] @function

(variable_stmt (identifier)) @variable

; (template_arg (identifier) @variable.parameter)

; (_ argument: (value (identifier) @variable.parameter))

(type_constraint) @type

(number) @constant.numeric.integer
[
  (string_string)
  ; (code_string)
] @string

(directive) @keyword.directive

[
 "Pattern"
 "Constraint"
 "Attr"
 "Value"
 "ValueRange"
 "Type"
 "TypeRange"
 "Op"
] @type.builtin

[
 "with"
 "benefit"
] @keyword

[
  "let"
  "op"
  "attr"
  "replace"
  "rewrite"
  "erase"
  "return"
] @keyword.operator

"include" @keyword.control.import


(ERROR) @error
