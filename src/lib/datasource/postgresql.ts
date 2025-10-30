// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P3-LD-001] PostgreSQL适配器;
// 应用的原则: 适配器模式;
// }}
import { Pool } from 'pg';
import type { IDataSourceAdapter, DataSourceConfig, SchemaTable, SchemaColumn, QueryResult } from './index';
import { log } from '@/lib/logger';

export class PostgreSQLAdapter implements IDataSourceAdapter {
  private pool: Pool | null = null;
  private config: DataSourceConfig;
  private connected: boolean = false;
  private lastError?: string;

  constructor(config: DataSourceConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ...this.config.connectionOptions,
      });

      await this.pool.query('SELECT 1');
      this.connected = true;
      this.lastError = undefined;

      log.info({ dataSourceId: this.config.id }, 'PostgreSQL connected');
    } catch (error: any) {
      this.connected = false;
      this.lastError = error.message;
      log.error({ error: error.message, dataSourceId: this.config.id }, 'PostgreSQL connection failed');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connected = false;
      log.info({ dataSourceId: this.config.id }, 'PostgreSQL disconnected');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.pool) await this.connect();
      await this.pool!.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSchemas(): Promise<string[]> {
    if (!this.pool) await this.connect();

    const result = await this.pool!.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);

    return result.rows.map((row) => row.schema_name);
  }

  async getTables(schema: string = 'public'): Promise<SchemaTable[]> {
    if (!this.pool) await this.connect();

    const result = await this.pool!.query(
      `
      SELECT 
        table_name,
        table_type,
        (SELECT reltuples::bigint FROM pg_class WHERE relname = table_name) as row_count
      FROM information_schema.tables
      WHERE table_schema = $1
      ORDER BY table_name
    `,
      [schema]
    );

    return result.rows.map((row) => ({
      name: row.table_name,
      schema,
      type: row.table_type === 'VIEW' ? 'view' : 'table',
      rowCount: parseInt(row.row_count || '0', 10),
    }));
  }

  async getTableSchema(tableName: string, schema: string = 'public'): Promise<SchemaColumn[]> {
    if (!this.pool) await this.connect();

    const result = await this.pool!.query(
      `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        col_description(('"' || c.table_schema || '"."' || c.table_name || '"')::regclass, c.ordinal_position) as comment,
        (SELECT true FROM information_schema.key_column_usage kcu
         WHERE kcu.table_schema = c.table_schema
         AND kcu.table_name = c.table_name
         AND kcu.column_name = c.column_name
         AND kcu.constraint_name IN (
           SELECT constraint_name FROM information_schema.table_constraints
           WHERE constraint_type = 'PRIMARY KEY'
         )) as is_primary_key
      FROM information_schema.columns c
      WHERE c.table_schema = $1 AND c.table_name = $2
      ORDER BY c.ordinal_position
    `,
      [schema, tableName]
    );

    return result.rows.map((row) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      isPrimaryKey: row.is_primary_key || false,
      defaultValue: row.column_default,
      comment: row.comment,
    }));
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.pool) await this.connect();

    const startTime = Date.now();
    const result = await this.pool!.query(query);
    const duration = Date.now() - startTime;

    return {
      data: result.rows,
      columns: result.fields.map((f) => f.name),
      rowCount: result.rowCount || 0,
      duration,
    };
  }

  getConnectionStatus() {
    return {
      connected: this.connected,
      error: this.lastError,
    };
  }
}
