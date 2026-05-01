"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const seed_1 = require("../prisma/seed");
async function bootstrap() {
    await (0, seed_1.main)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true, // barcha domenlar
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Backend on :${process.env.PORT ?? 3000}`);
}
bootstrap();
