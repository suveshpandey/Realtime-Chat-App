"use strict";
// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import path from "path";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import authRoute from "./routes/auth.route";
// import messageRoute from "./routes/message.route";
// import { connectDB } from "./lib/db";
// import {app, server} from "./lib/socket";
// dotenv.config();
// const PORT = process.env.PORT;
// const __dirname = path.resolve();
// // app.use(express.json());
// app.use(express.json({ limit: "10mb" })); // Increase JSON payload size limit
// app.use(express.urlencoded({ limit: "10mb", extended: true }));
// app.use(cookieParser());
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }));
// app.use('/api/auth', authRoute);
// app.use('/api/messages', messageRoute);
// if(process.env.NODE_ENV === "production"){
//     app.use(express.static(path.join(__dirname, ".../frontend/dist")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.join(__dirname, ".../frontend", "dist", "index.html"));
//     })
// }
// server.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}...`);
//         connectDB()
//     }
// );
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
// Fix __dirname for ES modules
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// Routes and DB
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const db_1 = require("./lib/db");
const socket_1 = require("./lib/socket");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
// Middlewares
socket_1.app.use(express_1.default.json({ limit: "10mb" }));
socket_1.app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
socket_1.app.use((0, cookie_parser_1.default)());
socket_1.app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? "https://talkify-by-sp.vercel.app"
        : "http://localhost:5173",
    credentials: true
}));
// Routes
socket_1.app.use('/api/auth', auth_route_1.default);
socket_1.app.use('/api/messages', message_route_1.default);
// Static files (fix path)
if (process.env.NODE_ENV === "production") {
    const FRONTEND_PATH = path_1.default.join(__dirname, "../../frontend/dist");
    socket_1.app.use(express_1.default.static(FRONTEND_PATH));
    socket_1.app.get("*", (req, res) => {
        res.sendFile(path_1.default.join(FRONTEND_PATH, "index.html"));
    });
}
// Start server
socket_1.server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
    (0, db_1.connectDB)();
});
