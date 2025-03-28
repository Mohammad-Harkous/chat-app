import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Chat App API')
  .setDescription('API documentation for the real-time chat backend')
  .setVersion('1.0')
  .addBearerAuth() // enables JWT token support in Swagger
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Serve at /api
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
