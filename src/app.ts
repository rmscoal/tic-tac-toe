import express from "express";
import cors from 'cors';
import helmet from "helmet";
import morgan from "morgan";

import { controllers } from "./controllers";

const app = express();

// Middlewares
app.disable("x-powered-by")
app.use(cors());
app.use(express.json());
app.use(helmet({ xPoweredBy: false }))
app.use(morgan('dev'))

// App Controller
app.use(controllers)

export { app };
