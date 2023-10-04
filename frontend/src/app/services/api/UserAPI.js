export default class UserAPI {
  #axios;

  constructor(axios) {
    this.#axios = axios;
  }

  async login(data) {
    try {
      const resp = await this.#axios.post('/users/login', data);
      return resp;
    } catch (err) {
      throw err;
    }
  }
}
