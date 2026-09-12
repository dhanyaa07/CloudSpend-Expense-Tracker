import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cloudspendRouter from "./cloudspend";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cloudspendRouter);

export default router;
