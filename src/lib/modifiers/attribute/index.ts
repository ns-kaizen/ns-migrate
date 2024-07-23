import { format } from 'sql-formatter'
import { DiffAction } from '../../types'
import { attributeAddQuery } from './attribute-add'
import { attributeRemoveQuery } from './attribute-remove'
import { attributeRenameQuery } from './attribute-rename'
import { attributeChangeTypeQuery } from './attribute-change-type'
import { attributeChangeDefaultQuery } from './attribute-change-default'
import { attributeChangeGenerationQuery } from './attribute-change-generation'
import { Priority, Query, isQuery } from '../../utils'

export const getAttributeQueries = (actions: DiffAction[]): Query[] => {
	return actions
		.map<Query | undefined>((action) => {
			switch (action.type) {
				case 'attribute-remove':
					return { priority: Priority.ATTRIBUTE_REMOVE, query: attributeRemoveQuery(action) }
				case 'attribute-add':
					return { priority: Priority.ATTRIBUTE, query: attributeAddQuery(action) }
				case 'attribute-rename':
					return { priority: Priority.ATTRIBUTE, query: attributeRenameQuery(action) }
				case 'attribute-change-type':
					return { priority: Priority.ATTRIBUTE, query: attributeChangeTypeQuery(action) }
				case 'attribute-change-default':
					return { priority: Priority.ATTRIBUTE, query: attributeChangeDefaultQuery(action) }
				case 'attribute-change-generation':
					return { priority: Priority.ATTRIBUTE, query: attributeChangeGenerationQuery(action) }

				default:
					return undefined
			}
		})
		.flat()
		.filter(isQuery)
		.map((x) => ({
			query: format(x.query, { language: 'mysql', keywordCase: 'upper' }),
			priority: x.priority,
		}))
}
