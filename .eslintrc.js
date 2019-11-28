module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "@typescript-eslint/tslint"
    ],
    "rules": {
        "@typescript-eslint/indent": [
            "error",
            "tabs"
        ],
        "@typescript-eslint/promise-function-async": "off",
        "@typescript-eslint/quotes": [
            "error",
            "single",
            {
                "avoidEscape": true
            }
        ],
        "arrow-body-style": "error",
        "camelcase": "error",
        "capitalized-comments": [
            "error",
            "always"
        ],
        "comma-dangle": [
            "error",
            {
                "objects": "never",
                "arrays": "never",
                "functions": "never"
            }
        ],
        "curly": [
            "error",
            "multi-line"
        ],
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "off",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "max-classes-per-file": "off",
        "max-len": "off",
        "newline-per-chained-call": "off",
        "no-console": "off",
        "no-empty": [
            "error",
            {
                "allowEmptyCatch": true
            }
        ],
        "no-new-wrappers": "error",
        "no-sequences": "error",
        "no-shadow": [
            "off",
            {
                "hoist": "all"
            }
        ],
        "no-underscore-dangle": [
            "error",
            "off"
        ],
        "no-unused-labels": "error",
        "no-var": "error",
        "object-shorthand": [
            "error",
            "never"
        ],
        "padding-line-between-statements": [
            "error",
            "error",
            {
                "blankLine": "always",
                "prev": "*",
                "next": "return"
            }
        ],
        "prefer-arrow/prefer-arrow-functions": "error",
        "space-before-function-paren": "off",
        "spaced-comment": [
            "error",
            "never"
        ],
        "unicorn/filename-case": "error",
        "use-isnan": "error",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "jsdoc-require": [
                        true,
                        "no-private",
                        "no-private-properties"
                    ],
                    "object-literal-sort-keys": [
                        true,
                        "ignore-case"
                    ],
                    "one-line": [
                        true,
                        "check-catch",
                        "check-finally",
                        "check-else",
                        "check-open-brace",
                        "check-whitespace"
                    ]
                }
            }
        ]
    }
};
