import ProcessFetch from "./processFetch";

export default class AgreementFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = "", agreementname = "") {
    try {
      const response = await this.axios.get("/master/agreement", {
        params: { offset, limit, status, agreementname },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/master/agreement/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async add(payload) {
    try {
      const response = await this.axios.post("/master/agreement", payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/master/agreement/${id}`, payload);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async delete(id) {
    try {
      const response = await this.axios.delete(`/master/agreement/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getAgreementApply(offset = 0, limit = 10, customerid = "") {
    try {
      const response = await this.axios.get("/master/agreement-apply", {
        params: { offset, limit, customerid },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getAgreementApplyByCustomerCode(customercode) {
    try {
      const response = await this.axios.get(
        `/master/agreement-apply/cust/${customercode}`
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async addAgreementApply(payload) {
    try {
      const response = await this.axios.post(
        "/master/agreement-apply",
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getByCustCode(code) {
    try {
      const response = await this.axios.get(
        `/master/agreement-apply/cust/${code}`
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async updateApplyAgreement(id, payload) {
    try {
      const response = await this.axios.put(
        `/master/agreement-apply/${id}`,
        payload
      );
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async deleteApplyAgreement(id) {
    try {
      const response = await this.axios.delete(`/master/agreement-apply/${id}`);
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
