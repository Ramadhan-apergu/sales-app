import ProcessFetch from "./processFetch"

export default class SalesOutdoorDashboardFetch extends ProcessFetch {
  static async get(years = null) {
    try {
      const response = await this.axios.get('/dashboard/sales-outdoor', {
        params: { years },
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }
}
