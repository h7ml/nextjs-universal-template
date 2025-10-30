// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P3-LD-003] MongoDB适配器;
// 应用的原则: 适配器模式;
// }}
import { MongoClient, Db } from 'mongodb';
import type { IDataSourceAdapter, DataSourceConfig, SchemaTable, SchemaColumn, QueryResult } from './index';
import { log } from '@/lib/logger';

export class MongoDBAdapter implements IDataSourceAdapter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: DataSourceConfig;
  private connected: boolean = false;
  private lastError?: string;

  constructor(config: DataSourceConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const uri = `mongodb://${this.config.username ? `${this.config.username}:${this.config.password}@` : ''}${this.config.host}:${this.config.port}/${this.config.database}${this.config.ssl ? '?ssl=true' : ''}`;

      this.client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        ...this.config.connectionOptions,
      });

      await this.client.connect();
      this.db = this.client.db(this.config.database);
      this.connected = true;
      this.lastError = undefined;

      log.info({ dataSourceId: this.config.id }, 'MongoDB connected');
    } catch (error: any) {
      this.connected = false;
      this.lastError = error.message;
      log.error({ error: error.message, dataSourceId: this.config.id }, 'MongoDB connection failed');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.connected = false;
      log.info({ dataSourceId: this.config.id }, 'MongoDB disconnected');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) await this.connect();
      await this.db!.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSchemas(): Promise<string[]> {
    if (!this.client) await this.connect();

    const admin = this.client!.db('admin');
    const result = await admin.admin().listDatabases();
    return result.databases
      .map((db) => db.name)
      .filter((name) => !['admin', 'local', 'config'].includes(name));
  }

  async getTables(schema?: string): Promise<SchemaTable[]> {
    if (!this.client) await this.connect();

    const database = schema ? this.client!.db(schema) : this.db!;
    const collections = await database.listCollections().toArray();

    const tables: SchemaTable[] = [];

    for (const collection of collections) {
      const stats = await database.collection(collection.name).stats();
      tables.push({
        name: collection.name,
        schema: database.databaseName,
        type: 'collection',
        rowCount: stats.count,
        sizeBytes: stats.size,
      });
    }

    return tables;
  }

  async getTableSchema(tableName: string, schema?: string): Promise<SchemaColumn[]> {
    if (!this.client) await this.connect();

    const database = schema ? this.client!.db(schema) : this.db!;
    const collection = database.collection(tableName);

    // 采样文档以推断 schema
    const samples = await collection.find({}).limit(100).toArray();

    if (samples.length === 0) {
      return [];
    }

    // 合并所有字段
    const fieldMap = new Map<string, { types: Set<string>; nullable: boolean }>();

    for (const doc of samples) {
      for (const [key, value] of Object.entries(doc)) {
        if (!fieldMap.has(key)) {
          fieldMap.set(key, { types: new Set(), nullable: false });
        }
        const field = fieldMap.get(key)!;
        if (value === null || value === undefined) {
          field.nullable = true;
        } else {
          field.types.add(typeof value === 'object' && Array.isArray(value) ? 'array' : typeof value);
        }
      }
    }

    return Array.from(fieldMap.entries()).map(([name, info]) => ({
      name,
      type: Array.from(info.types).join(' | ') || 'unknown',
      nullable: info.nullable,
      isPrimaryKey: name === '_id',
    }));
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.client) await this.connect();

    const startTime = Date.now();

    try {
      // 解析 MongoDB 查询（简单实现）
      const parsed = this.parseMongoQuery(query);
      const collection = this.db!.collection(parsed.collection);

      let cursor;
      switch (parsed.operation) {
        case 'find':
          cursor = collection.find(parsed.filter || {});
          if (parsed.limit) cursor = cursor.limit(parsed.limit);
          break;
        case 'aggregate':
          cursor = collection.aggregate(parsed.pipeline || []);
          break;
        default:
          throw new Error(`Unsupported operation: ${parsed.operation}`);
      }

      const data = await cursor.toArray();
      const duration = Date.now() - startTime;

      return {
        data,
        columns: data.length > 0 ? Object.keys(data[0]) : [],
        rowCount: data.length,
        duration,
      };
    } catch (error: any) {
      throw new Error(`MongoDB query failed: ${error.message}`);
    }
  }

  private parseMongoQuery(query: string): {
    collection: string;
    operation: string;
    filter?: any;
    pipeline?: any[];
    limit?: number;
  } {
    // 简单的查询解析（实际应用中需要更健壮的实现）
    const trimmed = query.trim();

    // 示例: db.users.find({age: {$gt: 18}}).limit(10)
    const findMatch = trimmed.match(/db\.(\w+)\.find\((.*?)\)(?:\.limit\((\d+)\))?/s);
    if (findMatch) {
      return {
        collection: findMatch[1],
        operation: 'find',
        filter: findMatch[2] ? JSON.parse(findMatch[2]) : {},
        limit: findMatch[3] ? parseInt(findMatch[3], 10) : undefined,
      };
    }

    // 示例: db.users.aggregate([{$match: {age: {$gt: 18}}}])
    const aggMatch = trimmed.match(/db\.(\w+)\.aggregate\((.*?)\)/s);
    if (aggMatch) {
      return {
        collection: aggMatch[1],
        operation: 'aggregate',
        pipeline: JSON.parse(aggMatch[2]),
      };
    }

    throw new Error('Unable to parse MongoDB query. Use format: db.collection.find({filter}).limit(n)');
  }

  getConnectionStatus() {
    return {
      connected: this.connected,
      error: this.lastError,
    };
  }
}
