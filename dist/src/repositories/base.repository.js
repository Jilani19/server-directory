"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) { this.model = model; }
    async findById(id) { return this.model.findUnique({ where: { id } }); }
    async findAll() { return this.model.findMany(); }
    async create(data) { return this.model.create({ data }); }
    async update(id, data) { return this.model.update({ where: { id }, data }); }
    async delete(id) { return this.model.delete({ where: { id } }); }
}
exports.BaseRepository = BaseRepository;
