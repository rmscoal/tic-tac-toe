import { FriendsInvitation, User } from "@prisma/client"
import { IncomingInvitationResponse, SignupResponse, UsersResponse } from "./response"
import { CredentialResult } from "../../../usecase/users/dto";


export function mapUsersModelToResponse(users: User[]): UsersResponse[] {
  return users.map((user) => ({
    id: user.id,
    username: user.username,
  }))
}

export function mapUserModelToSignupResponse(credentials: CredentialResult): SignupResponse {
  return {
    accessToken: credentials.accessToken,
    id: credentials.user.id,
    username: credentials.user.username,
  };
}

export function mapIncomingInvitationsToResponse(invitations: FriendsInvitation[]): IncomingInvitationResponse[] {
  return invitations.map((invitation: any) => ({
    id: invitation.id,
    status: invitation.status,
    requesteeID: invitation.requesteeId,
    requesteeUsername: invitation.requestee?.username,
  }))
}
