import { Attribute, AttributeType, type Schema } from '../../types'

export type AttributeChangeGenerationAction = {
	type: 'attribute-change-generation'
	data: {
		tableName: string
		attribute: Attribute
	}
}

export const diffAttributeChangeGeneration = (originalSchema: Schema, newSchema: Schema) => {
	const diffs: AttributeChangeGenerationAction[] = []

	for (const originalModel of originalSchema.models) {
		const newModel = newSchema.models.find((model) => model.id === originalModel.id)

		// if the new model is gone, then the whole thing will be going, no need to remove a single attr
		if (!newModel) continue

		for (const originalAttribute of originalModel.attributes) {
			const newAttribute = newModel.attributes.find((attribute) => attribute.id === originalAttribute.id)

			// if the attr is gone, it can't be renamed
			if (!newAttribute) {
				continue
			}

			// if the attr is not generated, then we want to leave it alone
			if (!newAttribute.generated) {
				continue
			}

			if (newAttribute.generatedSql !== originalAttribute.generatedSql) {
				diffs.push({
					type: 'attribute-change-generation',
					data: {
						tableName: newModel.tableName,
						attribute: newAttribute,
					},
				})
			}
		}
	}

	return diffs
}
