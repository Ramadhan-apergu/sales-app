import instance from "../axios";

export default class AgreementFetch {
    static async get(offset, limit) {
        try {
            const response = await instance.get(`/master/agreement?offset=${offset}&limit=${limit}`)
            return response
        } catch (error) {
            throw error
        }
    }
}