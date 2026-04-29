import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { main as seed } from "../prisma/seed";

async function bootstrap() {
  await seed();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend on :${process.env.PORT ?? 3000}`);
}
bootstrap();
