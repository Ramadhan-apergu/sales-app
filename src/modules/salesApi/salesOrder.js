import ProcessFetch from "./processFetch"

export default class SalesOrderFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = '') {
    try {
      const response = await this.axios.get('/trx/sales-order', {
        params: { offset, limit, status},
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/sales-order/${id}`)
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }
}