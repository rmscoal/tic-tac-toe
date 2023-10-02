import { Router } from 'express';
import { v1 } from './v1';

const controllers = Router();

// V1 Controller
controllers.use('/api/v1', v1);

export { controllers };
