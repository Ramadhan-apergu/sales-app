import ProcessFetch from "./processFetch";

export default class RmaFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    status = "",
    customer = "",
    startdate = "",
    enddate = "",
  ) {
    try {
      const response = await this.axios.get("/trx/rma", {
        params: { offset, limit, status, customer, startdate, enddate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/rma/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async create(payload) {
    try {
      const response = await this.axios.post(`/trx/rma`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/trx/rma/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async updateReceive(id) {
    try {
      const response = await this.axios.put(`/trx/rma-receive/${id}`, {});
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getInvoiceCustomer(id) {
    try {
      const response = await this.axios.get(`trx/sources-list/invoice/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getInvoiceCustomerItem(id) {
    try {
      const response = await this.axios.get(`trx/sources-item/invoice/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
