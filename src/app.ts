import express from 'express';
import cookieParser from 'cookie-parser';
import documentRoutes from './routes/document.route';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

import userRoutes from './routes/user.route';

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/documents", documentRoutes);
export {app};
