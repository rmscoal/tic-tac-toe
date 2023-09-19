import { prisma } from "./prisma";
import { UserRepository } from "./user.repository";
import { FriendsRepository } from "./friends.repository";
import { MatchRepository } from "./matches.repository";

const userRepository = new UserRepository(prisma);
const friendsRepository = new FriendsRepository(prisma);
const matchRepository = new MatchRepository(prisma);

export { userRepository, friendsRepository, matchRepository };
