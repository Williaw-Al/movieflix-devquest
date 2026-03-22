import express from "express";
import { log } from "node:console";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

import { movieRouter } from "./routes/movieRoutes";
import { genreRouter } from "./routes/genreRoutes";

const port = 3000;
const app = express();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/movies", movieRouter);
app.use("/genres", genreRouter);

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
