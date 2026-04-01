import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./src/routes/authRoute.js";
import jobRouter from "./src/routes/jobRoute.js";
import proposalRouter from "./src/routes/proposalRoute.js";
import contractRouter from "./src/routes/contractRoute.js";
import paymentRouter from "./src/routes/paymentRoute.js";
import webhookRouter from "./src/routes/webhookRoute.js";
import {startAutoReleaseScheduler,stopAutoReleaseScheduler} from "./src/jobs/autoReleaseScheduler.js";
import notificationRouter from "./src/routes/notificationRoute.js";
import reviewRouter from "./src/routes/reviewRoute.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true
}));
app.use("/webhook", webhookRouter);


app.use(express.json());

app.use("/api/auth", authRouter );
app.use("/api/jobs", jobRouter);
app.use("/api/proposals", proposalRouter);
app.use("/api/contracts", contractRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/notifications",notificationRouter);
app.use("/api/reviews", reviewRouter);

app.listen(PORT, ()=>{
    console.log(`=========================================`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`=========================================`);
    startAutoReleaseScheduler();
})