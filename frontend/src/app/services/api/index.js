import UserAPI from './UserAPI';
import { ax } from './axios';

const userAPI = new UserAPI(ax);

export { userAPI };
