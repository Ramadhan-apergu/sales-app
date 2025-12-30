import ProcessFetch from "./processFetch";

export default class FullfillmentFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = "", customer = "") {
    try {
      const response = await this.axios.get("/trx/item-fulfillment", {
        params: { offset, limit, status, customer },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/item-fulfillment/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getSoItem(id) {
    try {
      const response = await this.axios.get(
        `/trx/item-fulfillment/items/${id}`
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async create(payload) {
    try {
      const response = await this.axios.post(`/trx/item-fulfillment`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(
        `/trx/item-fulfillment/${id}`,
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async delete(id) {
    try {
      const response = await this.axios.delete(
        `/trx/item-fulfillment/${id}`,
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async bulkUpdateStatus(payload) {
    try {
      const response = await this.axios.put(
        `/trx/bulk-fulfillment-status`,
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async updateCancel(id) {
    try {
      const response = await this.axios.put(
        `/trx/item-fulfillment-cancel/${id}`
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
