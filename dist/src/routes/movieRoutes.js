"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../libs/prisma");
const movieRouter = (0, express_1.Router)();
exports.movieRouter = movieRouter;
movieRouter.get("/", async (_, res) => {
    const movies = await prisma_1.prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
});
movieRouter.get("/:genreName", async (req, res) => {
    const genreName = req.params.genreName;
    try {
        const moviesFilteredbyGenreName = await prisma_1.prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: genreName,
                        mode: "insensitive",
                    },
                },
            },
        });
        res.status(200).send(moviesFilteredbyGenreName);
    }
    catch (error) {
        return res
            .status(500)
            .send({ message: "Falha ao tentar filtrar Filmes por Gênero" });
    }
});
movieRouter.post("/", async (req, res) => {
    //prettier-ignore
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    try {
        const movieSameTitle = await prisma_1.prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive" } },
        });
        if (movieSameTitle) {
            return res.status(409).send({
                message: "Já existe um filme cadastrado com esse título",
            });
        }
        await prisma_1.prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    }
    catch (err) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }
    res.status(201).send({ message: "Filme atualizado com sucesso" });
});
movieRouter.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma_1.prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }
        const data = { ...req.body };
        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined;
        await prisma_1.prisma.movie.update({
            where: { id },
            data,
        });
    }
    catch (error) {
        return res
            .status(500)
            .send({ message: "Falha ao tentar atualizar o Filme" });
    }
    res.status(200).send();
});
movieRouter.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movieExist = await prisma_1.prisma.movie.findUnique({ where: { id } });
        if (!movieExist) {
            return res
                .status(404)
                .send({ message: "O Filme não foi encontrado" });
        }
        await prisma_1.prisma.movie.delete({
            where: { id },
        });
    }
    catch (error) {
        return res
            .status(500)
            .send({ message: "Falha ao tentar remover o Filme" });
    }
    res.status(200).send({ message: "Filme removido com sucesso" });
});
