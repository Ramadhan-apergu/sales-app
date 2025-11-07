import ProcessFetch from "./processFetch";

export default class ItemFetch extends ProcessFetch {
  static async get(
    offset = 0,
    limit = 10,
    displayname = "",
    itemid = "",
    itemprocessfamily = ""
  ) {
    try {
      const response = await this.axios.get("/master/items", {
        params: { offset, limit, displayname, itemid, itemprocessfamily },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/master/items/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async add(payload) {
    try {
      const response = await this.axios.post("/master/items", payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/master/items/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async delete(id) {
    try {
      const response = await this.axios.delete(`/master/items/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async updateUploadPrice(formData) {
    try {
      const response = await this.axios.post(
        "/master/items/price-upload",
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

  static async getItemFamily(id) {
    try {
      const response = await this.axios.get(`/master/itemprocessfamily`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async updatePrice(id, isDefault, payload) {
    try {
      const response = await this.axios.put(
        `/master/items/price-family/${isDefault}/${id}`,
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
