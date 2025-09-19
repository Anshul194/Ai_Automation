import app from './app.js';
import { connectToDatabase } from './db/connect.js';
import { ServerConfig } from './config/server.config.js';
import { initRedis } from './config/redisClient.js';

app.listen(ServerConfig.port, async () => {
  try {
    await connectToDatabase();       
    await initRedis();                 
    console.log(`🚀 Server is running on http://localhost:${ServerConfig.port}`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
});

