import ProcessFetch from "../processFetch";

export default class InvoiceStatusFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    customer = "",
    startdate = "",
    enddate = "",
    doc_numb = "",
    status = ""
  ) {
    try {
      const response = await this.axios.get("/report/invoice-status", {
        params: { offset, limit, customer, startdate, enddate, doc_numb, status},
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
