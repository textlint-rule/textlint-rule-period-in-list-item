// MIT © 2017 azu
"use strict";
import { checkEndsWithPeriod } from "check-ends-with-period";

/**
 * check `text` that the end is not periodMark
 * @param {string} text
 * @param {string[]} periodMarks
 * @returns {{valid: boolean, periodMark: string, index: number}}
 */
const checkEndsWithoutPeriodMark = (text, periodMarks) => {
    const {periodMark, index} = checkEndsWithPeriod(text, {
        periodMarks
    });
    // actually periodMark is at end.
    const isPeriodMarkAtEnd = periodMarks.indexOf(periodMark) !== -1;
    if (isPeriodMarkAtEnd) {
        return {
            valid: false,
            periodMark,
            index
        };
    }
    return {
        valid: true,
        periodMark,
        index
    };
};
/**
 * Return true if parent node is Ordered List
 * @param node
 * @returns {boolean}
 */
const isItemNodeInOrderedList = (node) => {
    return node && node.parent && node.parent.ordered === true;
};
const defaultOptions = {
    // prefer to use period mark.
    // "" (default is no period)
    // You can select period mark like "." from "periodMarks".
    "periodMark": "",
    // Built-in recognized period mark list
    // if the period of the text is not `periodMark` and it is a string in the `periodMarks`,
    "periodMarks": [".", "。", "．"],
    // Ignore only link tag
    // - [text](link)
    // It is not needed period mark
    "ignoreLinkEnd": true,
    // define exception period mark list at end of the list item
    // Ignore this period mark
    "allowPeriodMarks": [],
    // Allow emoji at end of the list item
    "allowEmoji": false,
    // Allow ordered list item
    // 1. ~.
    // 2. ~.
    "allowOrderedList": false,
    // If not exist `periodMark` at end of the list item
    // Automatically, append `periodMark` when does textlint --fix
    "forceAppendPeriod": false
};
const reporter = (context, options = {}) => {
    const {Syntax, RuleError, report, fixer, getSource} = context;
    const preferPeriodMark = options.periodMark || defaultOptions.periodMark;
    const isNotNeededPeriodMark = preferPeriodMark === "";
    // always `preferPeriodMark` is added to periodMarks
    const periodMarks = (options.periodMarks || defaultOptions.periodMarks).concat(preferPeriodMark);
    const allowPeriodMarks = options.allowPeriodMarks !== undefined
        ? options.allowPeriodMarks
        : defaultOptions.allowPeriodMarks;
    const ignoreLinkEnd = options.ignoreLinkEnd !== undefined
        ? options.ignoreLinkEnd
        : defaultOptions.ignoreLinkEnd;
    const allowEmoji = options.allowEmoji !== undefined
        ? options.allowEmoji
        : defaultOptions.allowEmoji;
    const allowOrderedList = options.allowOrderedList !== undefined
        ? options.allowOrderedList
        : defaultOptions.allowOrderedList;
    const forceAppendPeriod = options.forceAppendPeriod !== undefined
        ? options.forceAppendPeriod
        : defaultOptions.forceAppendPeriod;
    return {
        [Syntax.ListItem](node) {
            // Skip Ordered List item if option is enabled
            if (allowOrderedList && isItemNodeInOrderedList(node)) {
                return;
            }
            // A ListItem should includes child nodes.
            // https://github.com/textlint-rule/textlint-rule-period-in-list-item/issues/3
            const paragraphNodes = node.children.filter(node => node.type === Syntax.Paragraph);
            const firstParagraphNode = paragraphNodes[0];
            if (!firstParagraphNode) {
                return;
            }
            const text = getSource(firstParagraphNode);
            // Prefer no needed period, but exist period
            if (isNotNeededPeriodMark) {
                const {valid, periodMark, index} = checkEndsWithoutPeriodMark(text, periodMarks);
                if (valid) {
                    return;
                }
                // should be remove period mark
                report(firstParagraphNode, new RuleError(`Should remove period mark("${periodMark}") at end of list item.`, {
                    index,
                    fix: fixer.replaceTextRange([index, index + periodMark.length], "")
                }));
                return;
            }
            // - [link](http://example)
            // should be ignored
            if (ignoreLinkEnd) {
                const linkNodes = firstParagraphNode.children;
                if (linkNodes.length === 1 && linkNodes[0].type === Syntax.Link) {
                    return;
                }
            }
            const {valid, periodMark, index} = checkEndsWithPeriod(text, {
                periodMarks,
                allowPeriodMarks,
                allowEmoji,
            });
            // Prefer to use period
            if (valid) {
                //  but exist difference period
                const isPeriodMarkAtEnd = periodMarks.indexOf(periodMark) !== -1;
                // exception case that should not report
                // !?
                if (!isPeriodMarkAtEnd) {
                    return;
                }
                // periodMark is expected, then exit
                if (periodMark === preferPeriodMark) {
                    return;
                }
                report(firstParagraphNode, new RuleError(`Prefer to use period mark("${preferPeriodMark}") at end of list item.`, {
                    index,
                    fix: fixer.replaceTextRange([index, index + periodMark.length], preferPeriodMark)
                }));
            } else {
                // but not exist period
                if (forceAppendPeriod) {
                    report(firstParagraphNode, new RuleError(`Not exist period mark("${preferPeriodMark}") at end of list item.`, {
                        index,
                        fix: fixer.replaceTextRange([index + 1, index + 1], preferPeriodMark)
                    }));
                } else {
                    report(firstParagraphNode, new RuleError(`Not exist period mark("${preferPeriodMark}") at end of list item.`, {
                        index
                    }))
                }
            }
        }
    }
};
module.exports = {
    linter: reporter,
    fixer: reporter
};
