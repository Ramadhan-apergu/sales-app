import ProcessFetch from "./processFetch";

export default class InvoiceFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    status = "",
    customer = "",
    startdate = "",
    enddate = ""
  ) {
    try {
      const response = await this.axios.get("/trx/invoices", {
        params: { offset, limit, status, customer, startdate, enddate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getdO(offset = 0, limit = 10, status = "", customer = "") {
    try {
      const response = await this.axios.get("/trx/item-fulfillment-invoice", {
        params: { offset, limit, status, customer },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getdOItemInv(id) {
    try {
      const response = await this.axios.get(
        `/trx/item-fulfillment-invoice/items/${id}`
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/invoices/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async create(payload) {
    try {
      const response = await this.axios.post(`/trx/invoices`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/trx/invoices/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async delete(id) {
    try {
      const response = await this.axios.delete(`/trx/invoices/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
