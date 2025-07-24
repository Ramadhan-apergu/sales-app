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
    console.log(error);
    return this.constructor.extractData(
      error.response || { status: 500, errors: ["Network error"] }
    );
  }
}
