import instance from "../axios";

export default class CustomerFetch {
    static async get(offset, limit, status) {
        try {
            const response = await instance.get(`/master/customers?offset=${offset}&limit=${limit}&status=${status}`)
            return response
        } catch (error) {
            throw error
        }
    }

    static async getById(id) {
        try {
            const response = await instance.get(`/master/customers/${id}`)
            return response
        } catch (error) {
            throw error
        }
    }
}