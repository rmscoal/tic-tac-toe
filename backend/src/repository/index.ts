import { prisma } from './prisma';
import { mongo } from './mongo';
import { UserRepository } from './user.repository';
import { FriendsRepository } from './friends.repository';
import { MatchRepository } from './matches.repository';

const userRepository = new UserRepository(prisma);
const friendsRepository = new FriendsRepository(prisma);
const matchRepository = new MatchRepository(prisma, mongo);

export { userRepository, friendsRepository, matchRepository };
