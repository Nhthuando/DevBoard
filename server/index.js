import express from "express";
import cors from "cors";
import authRouter from "./src/routes/authRoute.js";
import jobRouter from "./src/routes/jobRoute.js";
import proposalRouter from "./src/routes/proposalRoute.js";
import contractRouter from "./src/routes/contractRoute.js";

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
app.use("/api/jobs", jobRouter);
app.use("/api/proposals", proposalRouter);
app.use("/api/contracts", contractRouter);

app.listen(PORT, ()=>{
    console.log(`=========================================`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`=========================================`);
})