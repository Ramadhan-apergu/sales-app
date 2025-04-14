import axios from "axios"

export default class ApiAuth {
    static async validationRole(data) {
        try {
            const { token } = data
            const response = await axios.post(`/api/auth/validate-token-role`, {
                token
            })
            return response
        } catch (error) {
            throw error
        }
    }
}