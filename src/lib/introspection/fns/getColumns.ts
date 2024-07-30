import { z } from 'zod'
import { QueryFn } from '../../types'

const validate = z.array(
	z.object({
		name: z.string(),
		tableName: z.string(),
		type: z.string(),
		notnull: z.boolean(),
		autoIncrement: z.boolean(),
		generated: z.boolean(),
		expression: z.string().nullable(),
	})
)

export const getColumns = async (query: QueryFn, dbName: string) => {
	const rows = await query(`
		SELECT COLUMN_NAME as name, TABLE_NAME as tableName, COLUMN_TYPE as type, IS_NULLABLE as notnull, EXTRA as extra, GENERATION_EXPRESSION as expression
		FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = '${dbName}'
	`)

	return validate.parse(
		(rows as any[]).map((row) => ({
			...row,
			notnull: row.notnull === 'NO',
			autoIncrement: row.extra === 'auto_increment',
			generated: row.extra === 'STORED GENERATED' || row.extra === 'VIRTUAL GENERATED',
			expression: row.expression,
		}))
	)
}
