"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genreRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../libs/prisma");
const genreRouter = (0, express_1.Router)();
exports.genreRouter = genreRouter;
genreRouter.get("/", async (_, res) => {
    try {
        const genreList = await prisma_1.prisma.genre.findMany({
            orderBy: {
                id: "asc",
            },
        });
        res.status(200).json(genreList);
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ message: "Erro interno ao listar gêneros." });
    }
});
genreRouter.post("/", async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res
            .status(400)
            .send({ message: "O nome do gênero é obrigatório." });
    }
    try {
        const genreExist = await prisma_1.prisma.genre.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });
        if (genreExist) {
            return res.status(409).json({
                message: "Já existe um gênero com esse nome",
                genreExist,
            });
        }
        const newGenre = await prisma_1.prisma.genre.create({
            data: { name },
        });
        res.status(201).json({
            message: "Gênero adicionado com sucesso.",
            newGenre,
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ message: "Erro interno ao adicionar gênero." });
    }
});
genreRouter.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res
            .status(400)
            .send({ message: "O nome do gênero é obrigatório" });
    }
    try {
        const genreId = await prisma_1.prisma.genre.findUnique({
            where: { id: Number(id) },
        });
        if (!genreId) {
            return res.status(404).send({ message: "Gênero não encontrado." });
        }
        const genreNameExist = await prisma_1.prisma.genre.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });
        if (genreNameExist) {
            return res.status(409).json({
                message: "Já existe um gênero com esse nome.",
                genreNameExist,
            });
        }
        const updatedGenre = await prisma_1.prisma.genre.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.status(200).json({
            message: "Gênero atualizado com sucesso.",
            updatedGenre,
        });
    }
    catch (err) {
        console.error(err);
        return res
            .status(500)
            .send({ message: "Falha ao tentar atualizar o gênero." });
    }
});
genreRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const genreExist = await prisma_1.prisma.genre.findUnique({
            where: { id: Number(id) },
        });
        if (!genreExist) {
            return res
                .status(404)
                .send({ message: "ID do gênero não encontrado" });
        }
        const deletedGenre = await prisma_1.prisma.genre.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({
            message: "Gênero removido com sucesso",
            deletedGenre,
        });
    }
    catch (err) {
        console.error(err);
        return res
            .status(500)
            .send({ message: "Falha ao tentar remover o gênero." });
    }
});
