import { type Connection, createConnection } from 'mysql2/promise'
import mysql from './lib'
import type { Schema } from './lib/types'

type Credentials = {
	host: string
	port?: number
	database: string
	user: string
	password: string
}

const isCredentials = (credentials: unknown): credentials is Credentials => {
	return (
		credentials !== null &&
		typeof credentials === 'object' &&
		'host' in credentials &&
		typeof credentials.host === 'string' &&
		('port' in credentials && (typeof credentials.port === 'number' || typeof credentials.port === 'undefined')) &&
		'database' in credentials &&
		typeof credentials.database === 'string' &&
		'user' in credentials &&
		typeof credentials.user === 'string' &&
		'password' in credentials &&
		typeof credentials.password === 'string'
	)
}

type DBURL = string

export const getSchema = async (credentials: Credentials | DBURL | Connection, dbName: string) => {
	const client: Connection = await createConnection(
		isCredentials(credentials) ? credentials : { uri: credentials as DBURL }
	)

	return mysql.getSchema(async (sql: string) => {
		const [rows] = await client.query(sql)
		return rows
	}, dbName)
}

export const LogLevel = {
	none: 0,
	log: 1,
	deep: 2,
} as const

type Options = {
	force?: boolean
	log?: (typeof LogLevel)[keyof typeof LogLevel]
	debug?: boolean
}

export const migrate = async (credentials: Credentials | DBURL, schema: Schema, options: Options) => {
	const { force = false, log = LogLevel.none, debug = false } = options
	// const force: boolean = true
	// const debug: boolean = false
	// const log: number = 1

	const client = await createConnection(isCredentials(credentials) ? credentials : { uri: credentials as DBURL })

	const query = async (sql: string) => {
		if (log === LogLevel.deep) {
			console.log(sql)
			console.log(' ')
		}
		const [rows] = await client.query(sql)
		return rows
	}

	const dbName = isCredentials(credentials) ? credentials.database : credentials.split('/').pop()
	if (!dbName) return

	// create the ref table if it doesn't already exist
	await mysql.createRefTable(query)

	// introspect the database and create a schema object
	const dbSchema = await mysql.getSchema(query, dbName)

	// compare the db schema with the incoming schema, and get the sync queries
	const queries = mysql.getQueries(dbSchema, schema, force)

	// console log each of the sync queries
	for (const sql of queries) {
		if (log === LogLevel.log) {
			console.log(sql)
			console.log(' ')
		}

		if (!debug) await query(sql)
	}

	if (!debug) await mysql.updateRefs(query, schema)

	await client.end()
}

export const writeRefs = async (credentials: Credentials | DBURL, schema: Schema, options: Pick<Options, 'log'>) => {
	const { log = LogLevel.none } = options

	const client = await createConnection(isCredentials(credentials) ? credentials : { uri: credentials as DBURL })

	const query = async (sql: string) => {
		if (log === LogLevel.deep) {
			console.log(sql)
			console.log(' ')
		}
		const [rows] = await client.query(sql)
		return rows
	}

	const dbName = isCredentials(credentials) ? credentials.database : credentials.split('/').pop()
	if (!dbName) return

	await mysql.updateRefs(query, schema)

	await client.end()
}
