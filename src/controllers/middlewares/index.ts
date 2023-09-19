import { doorkeeperService } from '../../services/doorkeeper';
import { AuthMiddleware } from './auth.middleware';

const authMiddleware = AuthMiddleware.create(doorkeeperService);

export { authMiddleware };
