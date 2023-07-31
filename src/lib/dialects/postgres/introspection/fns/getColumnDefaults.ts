import { Client, Pool } from 'pg'
import { z } from 'zod'

const validate = z.array(
	z.object({
		table: z.string(),
		column: z.string(),
		value: z.string().nullable(),
	})
)

export const getColumnDefaults = async (db: Client | Pool) => {
	const { rows } = await db.query(`
		SELECT c.relname AS table, a.attname AS column, pg_get_expr(d.adbin, d.adrelid) AS value
		FROM pg_class c, pg_namespace n, pg_attrdef d, pg_attribute a
		WHERE c.relkind='r'
		AND c.relnamespace=n.oid
		AND n.nspname = 'public'
		AND d.adrelid = c.oid
		AND a.attnum = d.adnum
		AND a.attrelid = c.oid
	`)
	return validate
		.parse(rows)
		.map((x) => ({ ...x, value: x.value?.replace('public.', '') }))
}
