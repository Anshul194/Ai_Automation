import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRITICAL: Import your passport configuration BEFORE using passport
// This registers the JWT strategy with passport


import './config/jwt-authenticate.js'; // Add this line - adjust path as needed

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Debug: Check if JWT strategy is registered (remove after fixing)
console.log("Registered Passport strategies:", Object.keys(passport._strategies || {}));

// Routes
app.use('/', routes);

export default app;