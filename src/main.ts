import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get(ConfigService);

  //swagger
  const config = new DocumentBuilder()
    .setTitle('KiesCompass API')
    .setDescription('KiesCompass Backend API with Onion Architecture')
    .setVersion('2.0')
    .addTag('auth')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //cors
  app.enableCors({
    origin: cfg.get('APP_URL'),
    credentials: true,
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type','Authorization'],
  });

  app.use('/api-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(document);
});
  
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true, // Enable automatic transformation
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert primitive types
      },
    })
  );




  await app.listen(process.env.PORT || 3001);
}
bootstrap();
