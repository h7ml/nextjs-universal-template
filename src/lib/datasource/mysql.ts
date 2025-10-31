// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P3-LD-002] MySQL适配器;
// 应用的原则: 适配器模式;
// }}
import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import type { IDataSourceAdapter, DataSourceConfig, SchemaTable, SchemaColumn, QueryResult } from './index';
import { log } from '@/lib/logger';

export class MySQLAdapter implements IDataSourceAdapter {
  private pool: Pool | null = null;
  private config: DataSourceConfig;
  private connected: boolean = false;
  private lastError?: string;

  constructor(config: DataSourceConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? {} : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ...this.config.connectionOptions,
      });

      await this.pool.query('SELECT 1');
      this.connected = true;
      this.lastError = undefined;

      log.info('MySQL connected', { dataSourceId: this.config.id });
    } catch (error: any) {
      this.connected = false;
      this.lastError = error.message;
      log.error('MySQL connection failed', {
        error: error.message,
        dataSourceId: this.config.id,
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connected = false;
      log.info('MySQL disconnected', { dataSourceId: this.config.id });
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

    const [rows] = await this.pool!.query('SHOW DATABASES');
    return (rows as any[])
      .map((row) => row.Database)
      .filter((db) => !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db));
  }

  async getTables(schema?: string): Promise<SchemaTable[]> {
    if (!this.pool) await this.connect();

    const database = schema || this.config.database;
    const [rows] = await this.pool!.query(
      `
      SELECT 
        TABLE_NAME as name,
        TABLE_TYPE as type,
        TABLE_ROWS as row_count,
        DATA_LENGTH as size_bytes
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `,
      [database]
    );

    return (rows as any[]).map((row) => ({
      name: row.name,
      schema: database,
      type: row.type === 'VIEW' ? 'view' : 'table',
      rowCount: parseInt(row.row_count || '0', 10),
      sizeBytes: parseInt(row.size_bytes || '0', 10),
    }));
  }

  async getTableSchema(tableName: string, schema?: string): Promise<SchemaColumn[]> {
    if (!this.pool) await this.connect();

    const database = schema || this.config.database;
    const [rows] = await this.pool!.query(
      `
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_KEY as key_type,
        COLUMN_DEFAULT as default_value,
        COLUMN_COMMENT as comment
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `,
      [database, tableName]
    );

    return (rows as any[]).map((row) => ({
      name: row.name,
      type: row.type,
      nullable: row.nullable === 'YES',
      isPrimaryKey: row.key_type === 'PRI',
      isForeignKey: row.key_type === 'MUL',
      defaultValue: row.default_value,
      comment: row.comment,
    }));
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.pool) await this.connect();

    const startTime = Date.now();
    const [rows, fields] = await this.pool!.query(query);
    const duration = Date.now() - startTime;

    return {
      data: rows as any[],
      columns: (fields as any[]).map((f) => f.name),
      rowCount: (rows as any[]).length,
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
