import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoute from "./routes/auth.route";
import messageRoute from "./routes/message.route";
import { connectDB } from "./lib/db";
import {app, server} from "./lib/socket";


dotenv.config();
const PORT = process.env.PORT;
const __dirname = path.resolve();

// app.use(express.json());
app.use(express.json({ limit: "10mb" })); // Increase JSON payload size limit
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.use(cors({
    origin: [
        'https://talkify-by-sp.vercel.app', // Production frontend
        'http://localhost:5173' // Development
    ],
    credentials: true
}));


app.use('/api/auth', authRoute);
app.use('/api/messages', messageRoute);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, ".../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, ".../frontend", "dist", "index.html"));
    })
}

server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...`);
        connectDB()
    }
);