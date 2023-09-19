import { Router } from 'express';
import { UserController } from './user.controller';
import { FriendsController } from './friends.controller';
import { MatchController } from './match.controller';
import { friendsUseCase, matchUseCase, userUseCase } from '../../usecase';
import { authMiddleware } from '../middlewares';

const v1 = Router();

// Registers endpoints
v1.use('/users', UserController.create(userUseCase));
v1.use('/friends', authMiddleware.authenticate, FriendsController.create(friendsUseCase))
v1.use('/matches', authMiddleware.authenticate, MatchController.create(matchUseCase))

export { v1 };
