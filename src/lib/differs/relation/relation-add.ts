import type { Schema } from '../../types'

export type RelationAddAction = {
	type: 'relation-add'
	data: {
		name: string
		fromTable: string
		toTable: string
		column: string
	}
}

export const diffRelationAdd = (originalSchema: Schema, newSchema: Schema) => {
	const diffs: RelationAddAction[] = []

	for (const newRelation of newSchema.relations) {
		const originalRelation = originalSchema.relations.find((relation) => {
			return (
				relation.id === newRelation.id &&
				relation.targetId === newRelation.targetId &&
				relation.sourceId === newRelation.sourceId
			)
		})

		if (!originalRelation) {
			const fromModelId = newRelation.type === 'oneToMany' ? newRelation.targetId : newRelation.sourceId
			const fromModel = newSchema.models.find((model) => model.id === fromModelId)
			if (!fromModel) return []
			const fromTable = fromModel?.tableName

			const toModelId = newRelation.type === 'oneToMany' ? newRelation.sourceId : newRelation.targetId
			const toModel = newSchema.models.find((model) => model.id === toModelId)
			if (!toModel) return []
			const toTable = toModel?.tableName

			const column = `${newRelation.type === 'oneToMany' ? newRelation.sourceName : newRelation.targetName}Id`

			diffs.push({
				type: 'relation-add',
				data: {
					name: newRelation.id,
					fromTable,
					toTable,
					column,
				},
			})
		}
	}

	return diffs
}
