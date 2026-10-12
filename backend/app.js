import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import OpenApiValidator from "express-openapi-validator";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiSpecPath = path.join(__dirname, "swagger.yaml");

const app = express();

// parse JSON bodies before OpenAPI validation
app.use(express.json());

// load OpenAPI spec
const apiSpecRaw = fs.readFileSync(apiSpecPath, "utf8");
const swaggerDocument = yaml.load(apiSpecRaw);

const prod = process.env.NODE_ENV === "production";

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

const allowCredentials = process.env.CORS_CREDENTIALS === "true";

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes("*")) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (prod && allowedOrigins.length > 0) {
      return callback(new Error("CORS blocked"));
    }

    callback(null, true);
  },
  credentials: allowCredentials,
  allowedHeaders: ["Content-Type", "Authorization", "shop"],
  methods: ["GET", "POST", "OPTIONS"],
};

app.use(cors(corsOptions));

// Serve Swagger UI outside the API spec's request validation.
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpecPath,
    validateRequests: true,
    validateResponses: true,
  }),
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running successfully",
  });
});

export default app;
