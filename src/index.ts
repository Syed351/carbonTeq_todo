import dotenv from 'dotenv';
dotenv.config({
  path: './.env',
});
import  {db}from './db';
import { app }from './app';
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
     db
    console.log("Database connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error){
    console.error("Failed to connect database !!!", error);
    throw error;
  }
};

startServer();