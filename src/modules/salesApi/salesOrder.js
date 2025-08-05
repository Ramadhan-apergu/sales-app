import ProcessFetch from "./processFetch";

export default class SalesOrderFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    status = "",
    customer = "",
    startdate = "",
    enddate = ""
  ) {
    try {
      const response = await this.axios.get("/trx/sales-order", {
        params: { offset, limit, status, customer, startdate, enddate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/sales-order/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getByIdWithEncodeUri(id) {
    try {
      const response = await this.axios.get(
        `/trx/sales-order/${encodeURIComponent(id)}`
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getSoAgreement(
    item_id = "",
    cust_id = "",
    qty = 0,
    trandate = ""
  ) {
    try {
      const response = await this.axios.get("/trx/so/get-agreement", {
        params: { item_id, cust_id, qty, trandate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getSoAgreementGroup(
    item_categories = "",
    cust_id = "",
    qty = 0,
    trandate = ""
  ) {
    try {
      const response = await this.axios.get("/trx/so/get-agreement-group", {
        params: { item_categories, cust_id, qty, trandate },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async add(payload) {
    try {
      const response = await this.axios.post("/trx/sales-order", payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

    static async getCalDiscount(payload) {
    try {
      const response = await this.axios.post("/trx/so/get-diskon", payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/trx/sales-order/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async updateStatus(id, payload) {
    try {
      const response = await this.axios.put(`/trx/sales-order/status/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async approveSoPending(id, action) {
    try {
      const response = await this.axios.put(`/trx/so-update/approval/${id}`, {
        statusapprove: action,
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async checkSoVrify(id) {
    try {
      const response = await this.axios.post(
        `/trx/sales-order/verify/${id}`,
        {}
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
