import axios from "axios";
import axiosInstance from "@/modules/axios";

export default class ProcessFetch {
  static axios = axiosInstance;

  static extractData(wrapper) {
    if (!wrapper) {
      return {
        status_code: 500,
        message: "No response wrapper",
        errors: ["Internal server error"],
      };
    }

    if (wrapper.status === 204) {
      return {
        status_code: 204,
        message: "Success",
      };
    }

    if (wrapper.data && typeof wrapper.data === "object") {
      return wrapper.data;
    }

    return {
      status_code: wrapper.status ?? 500,
      message: "Error",
      errors: Array.isArray(wrapper.errors)
        ? wrapper.errors
        : ["Internal server error"],
    };
  }

  processResponse(response) {
    return this.constructor.extractData(response);
  }

  processError(error) {
    // Request was aborted on purpose (e.g. superseded by a newer request).
    // Let it propagate instead of turning it into a fake "Network error"
    // response, so callers can tell an intentional cancel apart from a
    // real failure.
    if (axios.isCancel(error) || error?.code === "ERR_CANCELED") {
      throw error;
    }

    console.log(error);
    return this.constructor.extractData(
      error.response || { status: 500, errors: ["Network error"] }
    );
  }
}
