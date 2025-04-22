import instance from "../axios";

export default class ItemFetch {
    static async get(offset, limit) {
        try {
            const response = await instance.get(`/master/items?offset=${offset}&limit=${limit}`)
            return response
        } catch (error) {
            throw error
        }
    }
}