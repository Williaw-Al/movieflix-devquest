"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const port = 3000;
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
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
app.get("/movies/:genreName", async (req, res) => {
    const genreName = req.params.genreName;
    try {
        const moviesFilteredbyGenreName = await prisma.movie.findMany({
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
app.post("/movies", async (req, res) => {
    //prettier-ignore
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    try {
        const movieSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive" } },
        });
        if (movieSameTitle) {
            return res.status(409).send({
                message: "Já existe um filme cadastrado com esse título",
            });
        }
        await prisma.movie.create({
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
app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }
        const data = { ...req.body };
        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined;
        await prisma.movie.update({
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
app.put("/genres/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res
            .status(400)
            .send({ message: "O nome do gênero é obrigatório" });
    }
    try {
        const genreId = await prisma.genre.findUnique({
            where: { id: Number(id) },
        });
        if (!genreId) {
            return res.status(404).send({ message: "Gênero não encontrado." });
        }
        const genreNameExist = await prisma.genre.findFirst({
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
        const updatedGenre = await prisma.genre.update({
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
app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movieExist = await prisma.movie.findUnique({ where: { id } });
        if (!movieExist) {
            return res
                .status(404)
                .send({ message: "O Filme não foi encontrado" });
        }
        await prisma.movie.delete({
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
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
