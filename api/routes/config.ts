import express, { type Request, type Response } from 'express';
import { getBootstrapConfig } from '../services/configService.js';

const router = express.Router();

router.get('/bootstrap', async (req: Request, res: Response) => {
  const data = await getBootstrapConfig();
  res.json({ code: 1, msg: 'success', data });
});

export default router;
