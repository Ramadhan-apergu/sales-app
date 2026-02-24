import ProcessFetch from "./processFetch";

export default class CustomerRefundFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    customer = "",
    startdate = "",
    enddate = "",
    tranid = "",
  ) {
    try {
      const response = await this.axios.get("/trx/customer-refund", {
        params: { offset, limit, customer, startdate, enddate, tranid },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getCreditMemo(
    offset = 0,
    limit = 10,
    customer = "",
    status = "unapplied",
    startdate = "",
    enddate = "",
    tranid = "",
  ) {
    try {
      const response = await this.axios.get("/trx/credit-memo-refund", {
        params: { offset, limit, status, customer, startdate, enddate, tranid },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async create(payload) {
    try {
      const response = await this.axios.post(`/trx/customer-refund`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/customer-refund/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(
        `/trx/customer-refund/${id}`,
        payload,
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
