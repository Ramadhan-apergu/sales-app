import ProcessFetch from "./processFetch";

export default class PaymentFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    status = "",
    customer = "",
    startdate = "",
    enddate = "",
    paymentoption = ""
  ) {
    try {
      const response = await this.axios.get("/trx/payment", {
        params: {
          offset,
          limit,
          status,
          customer,
          startdate,
          enddate,
          paymentoption,
        },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/payment/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async create(payload) {
    try {
      const response = await this.axios.post(`/trx/payment`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getInvoiceCustomer(id) {
    try {
      const response = await this.axios.get(`/glob/invoice-customer/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/trx/payment/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async bulkUpdateStatus(payload) {
    try {
      const response = await this.axios.put(
        `/trx/bulk-payment-status`,
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
