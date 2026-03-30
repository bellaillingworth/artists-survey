import { Router, type IRouter } from "express";
import healthRouter from "./health";
import surveyRouter from "./survey";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/survey", surveyRouter);

export default router;
