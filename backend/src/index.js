import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import process from "process";

import routes from "./routes/index.js";
import connectDB from "./config/database.js";
import errorHandler  from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const logFormat = process.env.NODE_ENV === "development" ? "dev" : "combined";
app.use(morgan(logFormat));

const whitelist = ["http://localhost:8080", "http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Routes
app.use("/api", routes);

// Health check
app.get("/", (req, res) => {
  res.send("Server is Working Fine.");
});

// HTTPS redirect (only in production)
app.use((req, res, next) => {
  if (req.protocol !== "https" && process.env.NODE_ENV === "production") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Global Error Handler — MUST be after all routes and middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

// Connect DB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server Running on Port: ${PORT}`));
  })
  .catch((error) => {
    console.error(`❌ Failed to start server: ${error.message}`);
  });
