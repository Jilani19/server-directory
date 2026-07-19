"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    prisma;
    constructor(prismaClient) {
        this.prisma = prismaClient;
    }
}
exports.BaseRepository = BaseRepository;
