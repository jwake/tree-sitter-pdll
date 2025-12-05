/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "pdll",

  // conflicts: ($) => [[$.value], [$._value_concat], [$._simple_value]],

  externals: ($) => [$.multiline_comment],

  extras: ($) => [/\s+/, $.comment, $.multiline_comment], //, $.preprocessor],

  word: ($) => $.identifier,

  rules: {
    file: ($) => repeat($.statement),

    comment: ($) => /\/\/[^\n\r]*/,

    number: ($) => /[+-]?\d+|0x[\da-fA-F]+|0b[01]+/,
    identifier: ($) => /[a-zA-Z_0-9]*[a-zA-Z_][a-zA-Z_0-9]*/,
    string_string: ($) => /"(\\\\|\\'|\\"|\\t|\\n|[^\\"])*"/,
    code_string: ($) => /\[\{([^}]|\}+[^}\]])*\}\]/,
    var: ($) => /\$[a-zA-Z_][a-zA-Z_0-9]*/,

    identifier_tuple: ($) => seq("(", commaSep1($.identifier), ")"),
    dialect_identifier: ($) => /[a-zA-Z_0-9]*[a-zA-Z_0-9\.]*[a-zA-Z_0-9]*/,

    include: ($) => seq("include", $.string_string),

    // let name = whatever
    variable_stmt: ($) =>
      seq(
        "let",
        field("name", $.identifier),
        choice(seq(":", $.type_constraint), seq("=", $.constraint_expr)),
        ";",
      ),

    // A value expression - either a let variable identifier, an index into a tuple
    value: ($) =>
      field(
        "name",
        seq($.identifier, optional(seq(".", choice($.identifier, $.number)))),
      ),

    type_constraint: ($) =>
      choice(
        "Type",
        "TypeRange",
        $.value_constraint,
        $.value_range_constraint,
        $.op_constraint,
        $.attr_constraint,
      ),

    value_constraint: ($) =>
      seq("Value", optional(seq("<", field("op", $.dialect_identifier), ">"))),

    value_range_constraint: ($) =>
      seq(
        "ValueRange",
        optional(seq("<", field("op", $.dialect_identifier), ">")),
      ),

    op_constraint: ($) =>
      seq("Op", optional(seq("<", field("op", $.dialect_identifier), ">"))),

    attr_constraint: ($) =>
      seq("Attr", optional(seq("<", field("attr", $.dialect_identifier), ">"))),

    // Top-level statements
    statement: ($) =>
      choice($.directive, $.pattern_decl, $.constraint_decl, $.rewrite_decl),

    // Preprocessor directive
    directive: ($) => seq("#", $.include),

    // Function signature (declaration)
    decl_signature_arg: ($) =>
      seq(
        choice("_", field("name", $.identifier)),
        ":",
        field("type", $.type_constraint),
      ),

    decl_signature: ($) =>
      seq(
        "(",
        commaSep(field("arg", $.decl_signature_arg)),
        ")",
        optional(seq("->", field("return_type", $.return_type))),
      ),

    return_type: ($) =>
      choice(
        field("type", $.type_constraint),
        seq("(", commaSep(field("type", $.type_constraint)), ")"),
      ),

    // Function signaure (call site)
    invocation_signature: ($) => seq("(", commaSep(field("arg", $.value)), ")"),

    function_invocation: ($) =>
      seq(field("name", $.identifier), field("args", $.invocation_signature)),

    // Pattern declaration
    pattern_decl: ($) =>
      seq(
        "Pattern",
        optional(field("name", $.identifier)),
        optional(
          seq(
            "with",
            repeat(
              choice(
                "recursion",
                seq("benefit", "(", field("benefit", $.number), ")"),
              ),
            ),
          ),
        ),
        choice(
          // inline patterns
          seq("=>", $.pattern_rewrite_stmt),
          // regular pattern declaration
          seq("{", $.pattern_body, "}"),
        ),
      ),

    pattern_body: ($) =>
      seq($.pattern_match_section, $.pattern_rewrite_section),

    pattern_match_section: ($) => repeat1($.variable_stmt),

    pattern_rewrite_section: ($) => $.pattern_rewrite_stmt,

    // Pattern reqrite statements
    pattern_rewrite_stmt: ($) =>
      choice($.erase_stmt, $.replace_stmt, $.rewrite_stmt),

    erase_stmt: ($) =>
      seq("erase", field("op", choice($.op_expression, $.value)), ";"),

    replace_stmt: ($) =>
      seq(
        "replace",

        field("op", choice($.op_expression, $.value)),

        "with",

        choice(
          field("replacement", $.op_expression),
          field("replacement", $.value),
          seq("(", commaSep(field("replacement", $.value)), ")"),
        ),

        ";",
      ),

    rewrite_stmt: ($) =>
      seq(
        "rewrite",
        field("op", $.op_expression),
        "with",
        seq("{", $.rewrite_body, "}"),
      ),

    rewrite_body: ($) =>
      repeat1(choice($.replace_stmt, $.variable_stmt, $.expr)),

    expr: ($) => choice($.attr_expression, $.type_expression, $.op_expression),

    // A literal MLIR attribute, embedded in a string
    attr_expression: ($) => expression($, "attr"),

    type_expression: ($) => expression($, "type"),

    op_expression: ($) => expression($, "op"),

    unit_attr: ($) => field("name", $.identifier),
    named_attr: ($) =>
      seq(
        field("name", $.identifier),
        "=",
        field("value", $.value),
        optional(seq(":", field("attr_type", $.identifier))),
      ),

    // Of the form { unit_attr } or { name = value : Attr, name2 = value2 : Attr,... }
    attr_block: ($) => seq("{", repeat(choice($.named_attr, $.unit_attr)), "}"),

    constraint_expr: ($) => $.expr,

    constraint_decl: ($) =>
      seq(
        "Constraint",
        optional(field("name", $.identifier)),
        "(",
        seq(commaSep(field("argument", $.identifier))),
        ")",
        "->",
        $.return_type,
        choice(seq("{", $.constraint_body, "}"), $.code_string, ";"),
      ),

    constraint: ($) =>
      choice(
        field("name", $.identifier),
        seq("(", commaSep(field("name", $.identifier)), ")"),
      ),

    return_stmt: ($) =>
      seq("return", choice($.value, seq("(", commaSep($.value), ")")), ";"),

    constraint_body: ($) =>
      repeat1(choice($.variable_stmt, $.expr, $.return_stmt)),
    rewrite_decl: ($) => "sdfdssfdssd",
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function expression($, typename) {
  return seq(
    typename,
    "<",
    optional(field(typename.toLowerCase(), $.dialect_identifier)),
    ">",
    optional($.decl_signature),
    optional(field("attributes", $.attr_block)),
  );
}
