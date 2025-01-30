import UserService, { CreateUserPayloads } from "../../../services/user";

const queries = {
    getUserToken: async (_: any, payload: { email: string, password: string }) => {
        const result = await UserService.getUserToken({ email: payload.email, password: payload.password });
        if (result.token) {
            return result.token;
        } else {
            throw new Error(result.error || 'Token generation failed');
        }
    }
};

const mutations = {
    createUser: async (__: any, payload: CreateUserPayloads) => {
        const res = await UserService.createUser(payload);
        if (res.user && res.user.id) {
            return res.user.id;
        } else {
            throw new Error(res.error || 'User creation failed');
        }
    },
};

export const resolvers = { queries, mutations };