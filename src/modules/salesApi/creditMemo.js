import ProcessFetch from "./processFetch";

export default class CreditMemoFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    status = "",
    customer = "",
    startdate = "",
    enddate = "",
  ) {
    try {
      const response = await this.axios.get("/trx/credit-memo", {
        params: { offset, limit, status, customer, startdate, enddate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/credit-memo/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async create(payload) {
    try {
      const response = await this.axios.post(`/trx/credit-memo`, payload);
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
      const response = await this.axios.put(`/trx/credit-memo/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getInvoiceCustomerItem(id) {
    try {
      const response = await this.axios.get(`/glob/item-customer/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getSourceByCustomer(source = "invoice", custid) {
    try {
      const response = await this.axios.get(
        `/trx/sources-list/${source}/${custid}`,
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getSourceItemBySourceId(source, sourceid) {
    try {
      const response = await this.axios.get(`/trx/sources-item/${source}/${sourceid}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
