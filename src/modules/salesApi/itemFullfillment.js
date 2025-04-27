import ProcessFetch from "./processFetch"

export default class FullfillmentFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = '') {
    try {
      const response = await this.axios.get('/trx/item-fulfillment', {
        params: { offset, limit, status},
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/item-fulfillment/${id}`)
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }
}