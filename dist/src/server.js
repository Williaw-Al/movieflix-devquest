"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const movieRoutes_1 = require("./routes/movieRoutes");
const genreRoutes_1 = require("./routes/genreRoutes");
const port = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.use("/movies", movieRoutes_1.movieRouter);
app.use("/genres", genreRoutes_1.genreRouter);
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
