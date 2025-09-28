import ProcessFetch from "../processFetch";

export default class LeadActivityFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = "", channelname = "") {
    try {
      const response = await this.axios.get("/crm/lead-activity", {
        params: { offset, limit, status, channelname },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async create(payload) {
    try {
      const response = await this.axios.post(`/crm/lead-activity`, payload, {
        isMultipart: true,
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/crm/lead-activity/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(
        `/crm/lead-activity/${id}`,
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async delete(id) {
    try {
      const response = await this.axios.delete(`/crm/lead-activity/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
