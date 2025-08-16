import { DataSource } from 'typeorm';
import { CreateTables1746923551240 } from '../migrations/1746923551240-CreateTables';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'maria_luisa_db',
  entities: [], 
  migrations: [CreateTables1746923551240],
  synchronize: false,
});
