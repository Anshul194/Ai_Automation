import dotenv from 'dotenv';
import express from 'express';
import connectDb from './db/connectDb.js';
import  {initRedis} from './db/redis.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());



app.get('/', (req, res) => {
    res.send('AI Automation Server is running');
});



const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDb();
        await initRedis();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

startServer();
