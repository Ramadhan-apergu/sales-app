import ProcessFetch from "./processFetch";

export default class UserManageFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = "", role = "", name = "") {
    try {
      const response = await this.axios.get("/m/users", {
        params: { offset, limit, status, name, role },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/m/users/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getSales() {
    try {
      const response = await this.axios.get(`/m/sales`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/m/users/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async add(payload) {
    try {
      const response = await this.axios.post("/m/users", payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async delete(id) {
    try {
      const response = await this.axios.delete(`/m/users/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
