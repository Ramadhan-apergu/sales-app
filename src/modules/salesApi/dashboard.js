import ProcessFetch from "./processFetch"

export default class DashboardFetch extends ProcessFetch {
  static async get(years = null, startdate_so = null, enddate_so = null, years_penjualan = null) {
    try {
      const response = await this.axios.get('/dashboard/sales', {
        params: { years, startdate_so, enddate_so, years_penjualan },
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

}
