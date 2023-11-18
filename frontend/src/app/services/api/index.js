import FriendsAPI from './FriendsAPI';
import UserAPI from './UserAPI';
import { ax } from './axios';

const userAPI = new UserAPI(ax);
const friendsAPI = new FriendsAPI(ax);

export { userAPI, friendsAPI };
