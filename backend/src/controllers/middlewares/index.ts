import { doorkeeperService } from '../../services/doorkeeper';
import { AuthMiddleware, AuthSocketMiddleware } from './auth.middleware';

const authMiddleware = AuthMiddleware.create(doorkeeperService);
const authSocketMiddleware = AuthSocketMiddleware.create(doorkeeperService);

export { authMiddleware, authSocketMiddleware };
