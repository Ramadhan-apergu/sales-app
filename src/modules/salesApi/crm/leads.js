import ProcessFetch from "../processFetch";

export default class LeadsFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = "") {
    try {
      const response = await this.axios.get("/crm/lead", {
        params: { offset, limit, status },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async create(payload) {
    try {
      const response = await this.axios.post(`/crm/lead`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/crm/lead/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/crm/lead/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async delete(id) {
    try {
      const response = await this.axios.delete(`/crm/lead/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async convert(id) {
    try {
      const response = await this.axios.post(`/crm/lead/convert`, {
        lead: id,
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getStages() {
    try {
      const response = await this.axios.get("/crm/stage");
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
