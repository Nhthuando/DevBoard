import { runAutoReleaseJob } from "../services/autoReleaseService.js"
let intervalId = null;
let isRunning = false;

export const startAutoReleaseScheduler = () => {
    if(process.env.AUTO_RELEASE_JOB_ENABLED !== "true"){
        console.log("[AutoRelease] Job bị tắt !");
        return;
    }
    const interval = Number(process.env.AUTO_RELEASE_INTERVAL_MS) || 15 * 60 * 1000;
    const run = async () => {
        if(isRunning) {
            console.log("[AutoRelease] Job đang chạy");
            return;
        }
        isRunning = true;
        try {
            await runAutoReleaseJob();
        } catch(error) {
            console.error("[AutoRelease] Job bị lỗi:", error.message);
        } finally {
            isRunning = false; 
        }
    }
    run();
    intervalId = setInterval(run,interval);
}

export const stopAutoReleaseScheduler = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("[AutoRelease] Job đã dừng");
    }
}