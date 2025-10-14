import ProcessFetch from "../processFetch";

export default class ReportSo extends ProcessFetch {
  static async getSo(
    offset = 0,
    limit = 10,
    customerid = "",
    startdate = "",
    enddate = "",
    status = "",
    itemprocessfamily = "",
    salesrep = "",
    displayname = ""
  ) {
    try {
      const response = await this.axios.get("/report/sales-order", {
        params: {
          offset,
          limit,
          customerid,
          startdate,
          enddate,
          status,
          itemprocessfamily,
          salesrep,
          displayname,
        },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getSales(
    offset = 0,
    limit = 10,
    customerid = "",
    startdate = "",
    enddate = "",
    itemprocessfamily = "",
    salesrep = "",
    displayname = ""
  ) {
    try {
      const response = await this.axios.get("/report/penjualan", {
        params: {
          offset,
          limit,
          customerid,
          startdate,
          enddate,
          itemprocessfamily,
          salesrep,
          displayname,
        },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getProduct(
    offset = 0,
    limit = 10,
    startdate = "",
    enddate = ""
  ) {
    try {
      const response = await this.axios.get("/report/produksi", {
        params: { offset, limit, startdate, enddate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
