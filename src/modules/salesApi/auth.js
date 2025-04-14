import instance from "../axios";

export default class AuthFetch {
    static async login(data) {
        try {
            const { username, password } = data
            const response = await instance.post(`/auth/login`, {
                username,
                password
            })
            return response
        } catch (error) {
            throw error
        }
    }
}