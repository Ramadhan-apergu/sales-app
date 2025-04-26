import ProcessFetch from "./processFetch"

export default class CustomerFetch extends ProcessFetch {
  static async get(offset = 0, limit = 10, status = '') {
    try {
      const response = await this.axios.get('/master/customers', {
        params: { offset, limit, status },
      })
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

  static async getById(id) {
    try {
      const response = await this.axios.get(`/master/customers/${id}`)
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

  static async add(payload) {
    try {
      const response = await this.axios.post('/master/customers', payload)
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

  static async update(id, payload) {
    try {
      const response = await this.axios.put(`/master/customers/${id}`, payload)
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }

  static async delete(id) {
    try {
      const response = await this.axios.delete(`/master/customers/${id}`)
      return new this().processResponse(response)
    } catch (error) {
      return new this().processError(error)
    }
  }
}
