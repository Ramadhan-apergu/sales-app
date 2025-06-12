import ProcessFetch from "../processFetch";

export default class ReportSo extends ProcessFetch {
  static async getSo(
    offset = 0,
    limit = 10,
    customer = "",
    startdate = "",
    enddate = ""
  ) {
    try {
      const response = await this.axios.get("/report/sales-order", {
        params: { offset, limit, customer, startdate, enddate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

    static async getSales(
    offset = 0,
    limit = 10,
    customer = "",
    startdate = "",
    enddate = ""
  ) {
    try {
      const response = await this.axios.get("/report/penjualan", {
        params: { offset, limit, customer, startdate, enddate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
