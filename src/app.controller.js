import path from "node:path";
import * as dotenv from "dotenv";
// dotenv.config({ path: path.join("./src/config/.env.dev") });
dotenv.config({});
import connectDB from "./DB/connection.db.js";
import userController from "./modules/user/user.controller.js";
import authController from "./modules/auth/auth.controller.js";
import messageController from "./modules/message/message.controller.js";
import { globalErrorHandling } from "./utils/response.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import chalk from "chalk";
import { rateLimit } from "express-rate-limit";

const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT || 5000;

  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));

  const limiter = rateLimit({
    windowMs: 15* 60 * 1000, // 15 min
    limit:100,
    message: {error: "too many requests try again after 1 min"} ,
    statusCode: 400 ,
    handler:(req,res,next,options)=>{
      return res.status(500).json(options.message)
    },
    legacyHeaders:false,
    standardHeaders:'draft-8'
  });
  app.use(limiter)

  // db
  await connectDB();
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  //   converting buffer data
  app.use(express.json());
  //   app-routing
  app.get("/", (req, res) => {
    res.json("welcome to blog app 🧡");
  });
  app.use("/auth", authController);
  app.use("/user", userController);
  app.use("/message", messageController);
  app.all("{/*dummy}", (req, res) => {
    res.status(404).json("invalid app routing");
  });

  app.use(globalErrorHandling);

  return app.listen(port, () => {
    console.log(chalk.bgGreen(chalk.black(`Server running on port ${port}`)));
  });
};

export default bootstrap;
