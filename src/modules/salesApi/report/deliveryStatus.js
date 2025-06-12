import ProcessFetch from "../processFetch";

export default class DeliveryStatusFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    customer = "",
    startdate = "",
    enddate = "",
    so_numb = ""
  ) {
    try {
      const response = await this.axios.get("/report/delivery-status", {
        params: { offset, limit, customer, startdate, enddate, so_numb },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/report/delivery-status/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
