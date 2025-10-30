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

export class DataSourceFactory {
  private static adapters = new Map<string, IDataSourceAdapter>();

  static createAdapter(config: DataSourceConfig): IDataSourceAdapter {
    // 检查是否已存在
    if (this.adapters.has(config.id)) {
      return this.adapters.get(config.id)!;
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

    this.adapters.set(config.id, adapter);
    return adapter;
  }

  static getAdapter(id: string): IDataSourceAdapter | undefined {
    return this.adapters.get(id);
  }

  static async closeAdapter(id: string): Promise<void> {
    const adapter = this.adapters.get(id);
    if (adapter) {
      await adapter.disconnect();
      this.adapters.delete(id);
    }
  }

  static async closeAll(): Promise<void> {
    const promises = Array.from(this.adapters.values()).map((adapter) => adapter.disconnect());
    await Promise.all(promises);
    this.adapters.clear();
  }

  static getActiveConnections(): string[] {
    return Array.from(this.adapters.keys());
  }
}
