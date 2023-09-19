export type SignupResponse = {
  accessToken: string;
  id: number;
  username: string;
};

export type UsersResponse = {
  id: number;
  username: string;
};

export type IncomingInvitationResponse = {
  id: number,
  status: string,
  requesteeID: number
  requesteeUsername: string
}
