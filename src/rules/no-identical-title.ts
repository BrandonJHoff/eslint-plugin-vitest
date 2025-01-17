import { createEslintRule } from '../utils'

export const RULE_NAME = 'no-identical-title'
export type MESSAGE_ID = 'noIdenticalTitle';
export type Options = [];

export default createEslintRule<Options, MESSAGE_ID>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow identical titles',
			recommended: 'strict'
		},
		fixable: 'code',
		schema: [],
		messages: {
			noIdenticalTitle: 'Identical titles are not allowed.'
		}
	},
	defaultOptions: [],
	create(context) {
		const stack: string[] = []
		return {
			ExpressionStatement(node) {
				if (
					node.expression.type === 'CallExpression' &&
					node.expression.callee.type === 'Identifier' &&
					node.expression.callee.name === 'describe'
				) {
					const { arguments: args } = node.expression

					if (args[1].type === 'FunctionExpression') {
						const {
							body: { body }
						} = args[1]
						if (body.length > 0) {
							body.forEach((node) => {
								if (
									node.type === 'ExpressionStatement' &&
									node.expression.type === 'CallExpression' &&
									node.expression.callee.type === 'Identifier' &&
									(node.expression.callee.name === 'it' ||
										node.expression.callee.name === 'describe')
								) {
									const { arguments: args } = node.expression

									if (args.length > 0) {
										if (args[0].type === 'Literal') {
											const title = args[0].value as string
											if (stack.includes(title)) {
												context.report({
													node,
													messageId: 'noIdenticalTitle'
												})
											}
											stack.push(title)
										}
									}
								}
							})
						}
					}
				}
			}
		}
	}
})
