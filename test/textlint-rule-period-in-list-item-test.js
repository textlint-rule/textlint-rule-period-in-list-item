// MIT © 2017 azu
"use strict";
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
// rule
const rule = require("../src/textlint-rule-period-in-list-item");
// ruleName, rule, { valid, invalid }
tester.run("textlint-rule-period-in-list-item", rule, {
    valid: [
        // no problem
        "text",
        {
            text: `- text`,
            options: {
                periodMark: ""
            }
        },
        {
            text: `- text!`,
            options: {
                periodMark: ""
            }
        },
        {
            text: `- text!`,
            options: {
                periodMark: "。"
            }
        },
        {
            text: `- [text](http://example.com)`,
            options: {
                periodMark: ""
            }
        },
        {
            text: `- [text](http://example.com)`,
            options: {
                ignoreOnlyLink: true,
                periodMark: "."
            }
        },
        {
            text: `
- item1。
- item2。
- item3。
`,
            options: {
                periodMark: "。"
            }
        },
        {
            text: `
- item1.
- item2.
- item3t。.
`,
            options: {
                periodMark: "."
            }
        },
        // allowOrderedList
        {
            text: `
1. item1.
2. item2.
3. item3.
`,
            options: {
                allowOrderedList: true
            }
        },
        // https://github.com/textlint-rule/textlint-rule-period-in-list-item/issues/3
        {
            text: `
- list item 1.

    A paragraph describing this list item 1.

- list item 2.

    A paragraph describing this list item.

- list item 3.

    Another paragraph describing list item 3.
`,
            options: {
                periodMark: "."
            }
        },
    ],
    invalid: [
        // remove period mark
        {
            text: `- item1.`,
            output: `- item1`,
            errors: [
                {
                    "message": `Should remove period mark(".") at end of list item.`,
                    line: 1,
                    column: 8
                }
            ]
        },
        {
            text: `
1. item1
2. item2
3. item3.
`,
            options: {
                allowOrderedList: false
            },
            errors: [
                {
                    "message": `Should remove period mark(".") at end of list item.`,
                    line: 4,
                    column: 9
                }
            ]
        },
        // not exist period mark
        {
            text: `- item1`,
            output: `- item1`,
            options: {
                periodMark: "."
            },
            errors: [
                {
                    "message": `Not exist period mark(".") at end of list item.`,
                    line: 1,
                    column: 7
                }
            ]
        },
        // not exist period mark and force append period mark
        {
            text: `- item8`,
            output: `- item8.`,
            options: {
                periodMark: ".",
                forceAppendPeriod: true
            },
            errors: [
                {
                    "message": `Not exist period mark(".") at end of list item.`,
                    line: 1,
                    column: 7
                }
            ]
        },
        {
            text: `- [text](http://example.com) is bad`,
            options: {
                ignoreOnlyLink: true,
                periodMark: "."
            },
            errors: [
                {
                    "message": `Not exist period mark(".") at end of list item.`,
                    line: 1,
                    column: 35
                }
            ]
        },
        // multiple match
        {
            text: `
- item1.
- item2.
- item3.
`,
            output: `
- item1。
- item2。
- item3。
`

            ,
            options: {
                periodMark: "。"
            },
            errors: [
                {
                    "message": 'Prefer to use period mark("。") at end of list item.',
                    line: 2,
                    column: 8
                },
                {
                    "message": 'Prefer to use period mark("。") at end of list item.',
                    line: 3,
                    column: 8
                },
                {
                    "message": 'Prefer to use period mark("。") at end of list item.',
                    line: 4,
                    column: 8
                }
            ]
        },
        // https://github.com/textlint-rule/textlint-rule-period-in-list-item/issues/3
        {
            text: `
- list item 1

    A paragraph describing this list item 1.

- list item 2

    A paragraph describing this list item.

- list item 3

    Another paragraph describing list item 3.
`,
            options: {
                periodMark: "."
            },
            errors: [{ line: 2, column: 13 }, { line: 6, column: 13 }, { line: 10, column: 13 }]
        },
    ]
});