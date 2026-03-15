import express from "express";
import { PrismaClient } from "@prisma/client";
import { log } from "node:console";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
    } catch (err) {
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
    } catch (error) {
        return res
            .status(500)
            .send({ message: "Falha ao tentar atualizar o Filme" });
    }

    res.status(200).send();
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
    } catch (error) {
        return res
            .status(500)
            .send({ message: "Falha ao tentar remover o Filme" });
    }

    res.status(200).send({ message: "Filme removido com sucesso" });
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
    } catch (error) {
        return res
            .status(500)
            .send({ message: "Falha ao tentar filtrar Filmes por Gênero" });
    }
});

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
