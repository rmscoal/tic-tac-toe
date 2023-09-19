import { friendsRepository, matchRepository, userRepository } from '../repository';
import { doorkeeperService } from '../services/doorkeeper';
import { UserUseCase } from './users/user.usecase';
import { FriendsUseCase } from './friends/friends.usecase';
import { MatchUseCase } from './matches/matches.usecase';

const userUseCase = new UserUseCase(userRepository, doorkeeperService);
const friendsUseCase = new FriendsUseCase(userRepository, friendsRepository)
const matchUseCase = new MatchUseCase(userRepository, friendsRepository, matchRepository);

export { userUseCase, friendsUseCase, matchUseCase };
