function callNotify(notifyFn, ...args) {
    if (typeof notifyFn === 'function') {
      notifyFn(...args);
    }
  }
  
  export function createResponseHandler(response, notifyFn) {
    switch (response.status_code) {
      case 200:
      case 201:
        callNotify(notifyFn, 'success', 'Successful');
        return response.data.id;
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            callNotify(notifyFn, 'error', response.message, err)
          );
        } else {
          callNotify(notifyFn, 'error', 'Failed', 'Please try again!');
        }
        return null;
    }
  }
  
  export function updateResponseHandler(response, notifyFn) {
    switch (response.status_code) {
      case 200:
      case 201:
        callNotify(notifyFn, 'success', 'Successful');
        return response.data.id;
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            callNotify(notifyFn, 'error', response.message, err)
          );
        } else {
          callNotify(notifyFn, 'error', 'Failed', 'Please try again!');
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
        callNotify(notifyFn, 'error', 'Failed', 'Data not found');
        return null;
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            callNotify(notifyFn, 'error', response.message, err)
          );
        } else {
          callNotify(notifyFn, 'error', 'Failed', 'Please try again!');
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
        callNotify(notifyFn, 'error', 'Failed', 'Data not found');
        return null;
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            callNotify(notifyFn, 'error', response.message, err)
          );
        } else {
          callNotify(notifyFn, 'error', 'Failed', 'Please try again!');
        }
        return null;
    }
  }
  
  export function deleteResponseHandler(response, notifyFn) {
    switch (response.status_code) {
      case 204:
        callNotify(notifyFn, 'success', 'Successful');
        return true;
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            callNotify(notifyFn, 'error', response.message, err)
          );
        } else {
          callNotify(notifyFn, 'error', 'Failed', 'Please try again!');
        }
        return false;
    }
  }
  