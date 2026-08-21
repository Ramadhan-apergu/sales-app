import ProcessFetch from "./processFetch";

export default class StockAdjustmentFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = "", customer = "") {
    try {
      const response = await this.axios.get("/trx/adjust-stock", {
        params: { offset, limit, status, customer },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async add(payload) {
    try {
      const response = await this.axios.post("/trx/adjust-stock", payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async addWithFile(formData) {
    try {
      const response = await this.axios.post(
        "/trx/adjust-stock-upload",
        formData,
        {
          isMultipart: true,
        }
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getStockStatus(
    offset = 0,
    limit = 10,
    itemid = "",
    displayname = "",
    itemprocessfamily = ""
  ) {
    try {
      const response = await this.axios.get("/report/stock-item", {
        params: { offset, limit, itemid, displayname, itemprocessfamily },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async validasiItem(payload) {
    try {
      const response = await this.axios.post(
        "/trx/validate-itemid-stock",
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/trx/adjust-stock/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
