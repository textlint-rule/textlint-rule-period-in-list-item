// MIT © 2017 azu
"use strict";
const checkEndsWithPeriod = require("check-ends-with-period");
const defaultOptions = {
    // prefer to use period mark.
    // "" (default is no period)
    // You can select period mark like "." from "periodMarks".
    "periodMark": "",
    // Built-in recognized period mark list
    // if the period of the text is not `periodMark` and it is a string in the `periodMarks`,
    "periodMarks": [".", "。", "．"],
    // allow exception period mark list at end of the list item
    // Ignore this period mark
    "allowPeriodMarks": [],
    // Allow emoji at end of the list item
    "allowEmoji": false,
    // If not exist `periodMark` at end of the list item
    // Automatically, append `periodMark` when does textlint --fix
    "forceAppendPeriod": false
};
const reporter = (context, options = {}) => {
    const { Syntax, RuleError, report, fixer, getSource } = context;
    const preferPeriodMark = options.periodMark || defaultOptions.periodMark;
    const isNotNeededPeriodMark = preferPeriodMark === "";
    const periodMarks = (options.periodMarks || defaultOptions.periodMarks).concat(preferPeriodMark);
    const allowPeriodMarks = options.allowPeriodMarks !== undefined
        ? options.allowPeriodMarks
        : defaultOptions.allowPeriodMarks;
    const allowEmoji = options.allowEmoji !== undefined
        ? options.allowEmoji
        : defaultOptions.allowEmoji;
    const forceAppendPeriod = options.forceAppendPeriod !== undefined
        ? options.forceAppendPeriod
        : defaultOptions.forceAppendPeriod;
    return {
        [Syntax.ListItem](node){
            const text = getSource(node);
            const { valid, periodMark, index } = checkEndsWithPeriod(text, {
                periodMarks,
                allowPeriodMarks,
                allowEmoji,
            });
            // Prefer no needed period, but exist period
            if (isNotNeededPeriodMark) {
                if (valid) {
                    // should be remove period mark
                    report(node, new RuleError(`Should remove period mark("${periodMark}") at end of list item.`, {
                        index,
                        fix: fixer.replaceTextRange([index, index + periodMark.length], "")
                    }));
                    return;
                }
            } else {
                // Prefer to use period
                if (valid) {
                    //  but exist difference period
                    if (periodMark === preferPeriodMark) {
                        return;
                    }
                    report(node, new RuleError(`Prefer to use period mark("${preferPeriodMark}") at end of list item.`, {
                        index,
                        fix: fixer.replaceTextRange([index, index + periodMark.length], preferPeriodMark)
                    }));
                    return;
                } else {
                    // but not exist period
                    if (forceAppendPeriod) {
                        report(node, new RuleError(`Not exist period mark("${preferPeriodMark}") at end of list item.`, {
                            index,
                            fix: fixer.replaceTextRange([index + 1, index + 1], preferPeriodMark)
                        }));
                    } else {
                        report(node, new RuleError(`Not exist period mark("${preferPeriodMark}") at end of list item.`, {
                            index
                        }))
                    }

                }
            }
        }
    }
};
module.exports = {
    linter: reporter,
    fixer: reporter
};