import ProcessFetch from "../processFetch";

export default class DashboardCrmFetch extends ProcessFetch {
  static async getLead(
    offset = 0,
    limit = 10,
    startdate = "",
    enddate = "",
    stage = "",
    owner = ""
  ) {
    try {
      const response = await this.axios.get("/crm/dashboard/lead", {
        params: { offset, limit, startdate, enddate, stage, owner },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }

  static async getFunnel(
    offset = 0,
    limit = 10,
    startdate = "",
    enddate = "",
    owner = ""
  ) {
    try {
      const response = await this.axios.get("/crm/dashboard/funnel", {
        params: { offset, limit, startdate, enddate, owner },
      });
      return new this().processResponse(response);
    } catch (error) {
      return new this().processError(error);
    }
  }
}
