// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P3-AR-001] 多数据源抽象层;
// 应用的原则: 抽象工厂模式, 依赖注入;
// }}
export interface DataSourceConfig {
  id: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  name: string;
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  connectionOptions?: Record<string, any>;
}

export interface SchemaTable {
  name: string;
  schema?: string;
  type: 'table' | 'view' | 'collection';
  rowCount?: number;
  sizeBytes?: number;
  columns?: SchemaColumn[];
}

export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  defaultValue?: any;
  comment?: string;
}

export interface QueryResult {
  data: any[];
  columns: string[];
  rowCount: number;
  duration: number;
}

export interface IDataSourceAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  getSchemas(): Promise<string[]>;
  getTables(schema?: string): Promise<SchemaTable[]>;
  getTableSchema(tableName: string, schema?: string): Promise<SchemaColumn[]>;
  executeQuery(query: string): Promise<QueryResult>;
  getConnectionStatus(): { connected: boolean; error?: string };
}

export * from './postgresql';
export * from './mysql';
export * from './mongodb';
