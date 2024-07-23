import { AttributeChangeGenerationAction } from '../../differs/attribute/attribute-change-generation'
import { mapAttributeTypeToMySQLType } from '../../utils'

export const attributeChangeGenerationQuery = (action: AttributeChangeGenerationAction) => {
	const { tableName, attribute } = action.data

	const name = attribute.name
	const type = mapAttributeTypeToMySQLType(attribute.type)
	const storage = 'PERSISTENT'
	const expression = attribute.generatedSql

	return `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${name}\` ${type} GENERATED ALWAYS AS (${expression}) ${storage};`
}
