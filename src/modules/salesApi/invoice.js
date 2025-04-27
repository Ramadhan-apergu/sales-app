import ProcessFetch from "./processFetch"

export default class InvoiceFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = '') {
    try {
      const response = await this.axios.get('/trx/invoices', {
        params: { offset, limit, status},
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/invoices/${id}`)
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }
}