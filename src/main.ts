import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './config/data-source';
async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    try {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
      console.log('Migraciones ejecutadas correctamente');
    } catch (error) {
      console.error('Error ejecutando migraciones', error);
      process.exit(1);
    }
  }
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://sistema-salud-frontend.onrender.com',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`App running on port ${port}`);
}
bootstrap();
