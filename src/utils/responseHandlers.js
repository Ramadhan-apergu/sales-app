import Cookies from "js-cookie";

function handleUnauthorized(notifyFn) {
  Cookies.remove("x_atkn", { path: "/" });
  Cookies.remove("u_ctx", { path: "/" });
  Cookies.remove("role", { path: "/" });

  callNotify(notifyFn, "error", "Session Expired", "Please log in again.");

  window.location.href = "/auth/login";
}

function callNotify(notifyFn, ...args) {
  if (typeof notifyFn === "function") {
    notifyFn(...args);
  }
}

export function createResponseHandler(response, notifyFn) {
  switch (response.status_code) {
    case 200:
    case 201:
      callNotify(notifyFn, "success", "Successful");
      return response.data.id;
    case 401:
    case 403:
      handleUnauthorized(notifyFn);
    default:
      if (Array.isArray(response.errors)) {
        response.errors.forEach((err) =>
          callNotify(notifyFn, "error", response.message, err)
        );
      } else {
        callNotify(notifyFn, "error", "Failed", "Please try again!");
      }
      return null;
  }
}

export function updateResponseHandler(response, notifyFn) {
  switch (response.status_code) {
    case 200:
    case 201:
      callNotify(notifyFn, "success", "Successful");
      return response.data.id;
    case 401:
    case 403:
      handleUnauthorized(notifyFn);
    default:
      if (Array.isArray(response.errors)) {
        response.errors.forEach((err) =>
          callNotify(notifyFn, "error", response.message, err)
        );
      } else {
        callNotify(notifyFn, "error", "Failed", "Please try again!");
      }
      return null;
  }
}

export function getByIdResponseHandler(response, notifyFn) {
  switch (response.status_code) {
    case 200:
    case 201:
      return response.data;
    case 400:
    case 404:
      callNotify(notifyFn, "error", "Failed", "Data not found");
      return null;
    case 401:
    case 403:
      handleUnauthorized(notifyFn);
    default:
      if (Array.isArray(response.errors)) {
        response.errors.forEach((err) =>
          callNotify(notifyFn, "error", response.message, err)
        );
      } else {
        callNotify(notifyFn, "error", "Failed", "Please try again!");
      }
      return null;
  }
}

export function getResponseHandler(response, notifyFn) {
  switch (response.status_code) {
    case 200:
    case 201:
      return response.data;
    case 400:
    case 404:
      callNotify(notifyFn, "error", "Failed", "Data not found");
      return null;
    case 401:
    case 403:
      handleUnauthorized(notifyFn);
    default:
      if (Array.isArray(response.errors)) {
        response.errors.forEach((err) =>
          callNotify(notifyFn, "error", response.message, err)
        );
      } else {
        callNotify(notifyFn, "error", "Failed", "Please try again!");
      }
      return null;
  }
}

export function deleteResponseHandler(response, notifyFn) {
  switch (response.status_code) {
    case 204:
      callNotify(notifyFn, "success", "Successful");
      return true;
    case 401:
    case 403:
      handleUnauthorized(notifyFn);
    default:
      if (Array.isArray(response.errors)) {
        response.errors.forEach((err) =>
          callNotify(notifyFn, "error", response.message, err)
        );
      } else {
        callNotify(notifyFn, "error", "Failed", "Please try again!");
      }
      return false;
  }
}
