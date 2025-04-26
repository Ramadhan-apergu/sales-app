export function createResponseHandler(response, notifyFn) {
    switch (response.status_code) {
      case 201:
      case 200:
        notifyFn('success', 'Successful');
        return response.data.id
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            notifyFn('error', response.message, err)
          );
        } else {
          notifyFn(
            'error',
            `Failed`,
            'Please try again!'
          );
        }
        return null
    }
}

export function updateResponseHandler(response, notifyFn) {
    switch (response.status_code) {
      case 201:
      case 200:
        notifyFn('success', 'Successful');
        return response.data.id
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            notifyFn('error', response.message, err)
          );
        } else {
          notifyFn(
            'error',
            `Failed`,
            'Please try again!'
          );
        }
        return null
    }
}

export function getByIdResponseHandler(response, notifyFn) {
    switch (response.status_code) {
      case 201:
      case 200:
        return response.data
      case 404:
      case 400:
        notifyFn('error', 'Failed', 'Data not found');
        return null
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            notifyFn('error', response.message, err)
          );
        } else {
          notifyFn(
            'error',
            `Failed`,
            'Please try again!'
          );
        }
        return null
    }
}

export function getResponseHandler(response, notifyFn) {
    switch (response.status_code) {
      case 201:
      case 200:
        return response.data
      case 404:
      case 400:
        notifyFn('error', 'Failed', 'Data not found');
        return null
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            notifyFn('error', response.message, err)
          );
        } else {
          notifyFn(
            'error',
            `Failed`,
            'Please try again!'
          );
        }
        return null
    }
}

export function deleteResponseHandler(response, notifyFn) {
    switch (response.status_code) {
      case 204:
        notifyFn('success', 'Successful');
        return true
      default:
        if (Array.isArray(response.errors)) {
          response.errors.forEach((err) =>
            notifyFn('error', response.message, err)
          );
        } else {
          notifyFn(
            'error',
            `Failed`,
            'Please try again!'
          );
        }
        return false
    }
}