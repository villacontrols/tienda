import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: true, // agrega aquí tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix("api")
  const config = new DocumentBuilder()
    .setTitle('mi tienda')
    .setDescription('Encontrarás una API que te permitirá realizar una compra. Para poder utilizarla, primero deberás autenticarte')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
