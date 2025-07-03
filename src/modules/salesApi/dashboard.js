import ProcessFetch from "./processFetch"

export default class DashboardFetch extends ProcessFetch {
  static async get(years = null, startdate_so = null, enddate_so = null, startdate_penjualan=null, enddate_penjualan=null) {
    try {
      const response = await this.axios.get('/dashboard/sales', {
        params: { years, startdate_so, enddate_so, startdate_penjualan, enddate_penjualan },
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

}
