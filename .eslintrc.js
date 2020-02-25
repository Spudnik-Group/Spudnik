module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "plugins": [
		"@typescript-eslint",
		"unicorn",
		"prefer-arrow",
	],
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
		"plugin:node/recommended",
		"plugin:node/recommended-module"
	],
	"parserOptions": {
		"ecmaVersion": 11,
		"sourceType": "module",
		"ecmaFeatures": {
			"modules": true
		},
		"tsconfigRootDir": __dirname,
		"project": ['./tsconfig.json']
	},
    "rules": {
		"indent": "off",
    	"@typescript-eslint/indent": ["error", "tab"],
		"@typescript-eslint/promise-function-async": "off",
		"quotes": "off",
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
        "no-underscore-dangle": "error",
        "no-unused-labels": "error",
        "no-var": "error",
        "object-shorthand": [
            "error",
            "never"
        ],
        "padding-line-between-statements": [
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
        "use-isnan": "error"
    }
};
