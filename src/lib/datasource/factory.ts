// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P3-AR-002] 数据源工厂;
// 应用的原则: 工厂模式;
// }}
import type { IDataSourceAdapter, DataSourceConfig } from './index';
import { PostgreSQLAdapter } from './postgresql';
import { MySQLAdapter } from './mysql';
import { MongoDBAdapter } from './mongodb';

type AdapterEntry = {
  adapter: IDataSourceAdapter;
  signature: string;
};

function normalizeConnectionOptions(
  options: DataSourceConfig['connectionOptions']
): Record<string, unknown> | undefined {
  if (!options) {
    return undefined;
  }

  const sortedKeys = Object.keys(options).sort();
  const normalized: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    const value = options[key];
    normalized[key] =
      value && typeof value === 'object' && !Array.isArray(value)
        ? normalizeConnectionOptions(value as Record<string, unknown>)
        : value;
  }
  return normalized;
}

function createConfigSignature(config: DataSourceConfig): string {
  return JSON.stringify({
    type: config.type,
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    ssl: config.ssl,
    connectionOptions: normalizeConnectionOptions(config.connectionOptions),
  });
}

export class DataSourceFactory {
  private static adapters = new Map<string, AdapterEntry>();

  static createAdapter(config: DataSourceConfig): IDataSourceAdapter {
    const signature = createConfigSignature(config);
    const existingEntry = this.adapters.get(config.id);

    if (existingEntry) {
      if (existingEntry.signature === signature) {
        return existingEntry.adapter;
      }

      void existingEntry.adapter.disconnect().catch(() => undefined);
      this.adapters.delete(config.id);
    }

    let adapter: IDataSourceAdapter;

    switch (config.type) {
      case 'postgresql':
        adapter = new PostgreSQLAdapter(config);
        break;
      case 'mysql':
        adapter = new MySQLAdapter(config);
        break;
      case 'mongodb':
        adapter = new MongoDBAdapter(config);
        break;
      default:
        throw new Error(`Unsupported data source type: ${config.type}`);
    }

    this.adapters.set(config.id, { adapter, signature });
    return adapter;
  }

  static getAdapter(id: string): IDataSourceAdapter | undefined {
    return this.adapters.get(id)?.adapter;
  }

  static async closeAdapter(id: string): Promise<void> {
    const entry = this.adapters.get(id);
    if (entry) {
      await entry.adapter.disconnect();
      this.adapters.delete(id);
    }
  }

  static async closeAll(): Promise<void> {
    const promises = Array.from(this.adapters.values()).map((entry) =>
      entry.adapter.disconnect()
    );
    await Promise.all(promises);
    this.adapters.clear();
  }

  static getActiveConnections(): string[] {
    return Array.from(this.adapters.keys());
  }
}
