import ProcessFetch from "./processFetch";

export default class ItemFetch extends ProcessFetch {
  static async get(
    offset,
    limit,
    displayname = "",
    itemid = "",
    itemprocessfamily = ""
  ) {
    try {
      const params = {};

      // helper untuk validasi angka string/number yang >= 0
      const parseIfValidNumber = (value) => {
        if (value === null || value === undefined || value === "") return null;

        const num = Number(value); // bisa convert "10" ke 10
        if (isNaN(num)) return null; // reject "abc"
        if (num < 0) return null; // reject negative

        return num;
      };

      const parsedOffset = parseIfValidNumber(offset);
      const parsedLimit = parseIfValidNumber(limit);

      if (parsedOffset !== null) params.offset = parsedOffset;
      if (parsedLimit !== null) params.limit = parsedLimit;

      // string params
      if (displayname) params.displayname = displayname;
      if (itemid) params.itemid = itemid;
      if (itemprocessfamily) params.itemprocessfamily = itemprocessfamily;

      const response = await this.axios.get("/master/items", { params });

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
