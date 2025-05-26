import ProcessFetch from "./processFetch"

export default class DeliveryOrderFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = '', customer = '', startdate = '', enddate = '') {
    try {
      const response = await this.axios.get('/report/delivery-status', {
        params: { offset, limit, status, customer, startdate, enddate},
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/report/delivery-status/${id}`)
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }
}