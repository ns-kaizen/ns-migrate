import { z } from 'zod'
import { QueryFn } from '../../types'

const validate = z.array(
	z.object({
		tableName: z.string(),
		columnName: z.string(),
		targetTable: z.string().nullable(),
		targetColumn: z.string().nullable(),
		type: z.string(),
	})
)

export const getForeignKeyConstraints = async (query: QueryFn, dbName: string) => {
	const rows = await query(`
		SELECT DISTINCT k.TABLE_NAME as tableName, k.COLUMN_NAME as columnName, k.REFERENCED_TABLE_NAME as targetTable, k.REFERENCED_COLUMN_NAME as targetColumn, c.CONSTRAINT_TYPE as type
		FROM information_schema.KEY_COLUMN_USAGE as k, information_schema.TABLE_CONSTRAINTS as c
		WHERE k.CONSTRAINT_SCHEMA = '${dbName}'
		AND c.CONSTRAINT_NAME = k.CONSTRAINT_NAME
		AND c.CONSTRAINT_TYPE = 'FOREIGN KEY'
		AND k.TABLE_NAME != '_ref'
	`)

	return validate.parse(rows)
}
