export default class FriendsAPI {
  #axios;

  constructor(axios) {
    this.#axios = axios;
  }

  async friendsList() {
    try {
      const resp = await this.#axios.get('/friends');
      return resp.data;
    } catch (err) {
      throw new Error(err.response.data.error.message);
    }
  }
}
