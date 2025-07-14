import ProcessFetch from "./processFetch"

export default class ProfileFetch extends ProcessFetch {
  static async get() {
    try {
      const response = await this.axios.get('/m/users/profile', {
        params: {},
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }
}