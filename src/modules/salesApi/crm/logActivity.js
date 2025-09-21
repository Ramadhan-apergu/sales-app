import ProcessFetch from "../processFetch";

export default class LogActivityFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, leadname = "", logtype = "") {
    try {
      const response = await this.axios.get("/crm/log-activity", {
        params: { offset, limit, leadname, logtype },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
