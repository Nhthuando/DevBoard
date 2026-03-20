import express from "express";
import cors from "cors";
import authRouter from "./src/routes/authRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        "http://localhost:5173"
    ],
    credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRouter );

app.listen(PORT, ()=>{
    console.log(`=========================================`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`=========================================`);
})