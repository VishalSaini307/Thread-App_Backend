import { error } from "console";
import UserService, { CreateUserPayload } from "../../../services/user";

const queries = {
    getUserToken: async (_: any, payload: { email: string, password: string }) => {
        const result = await UserService.getUserToken({ email: payload.email, password: payload.password });
        if (result.token) {
            return result.token;
        } else {
            throw new Error(result.error || 'Token generation failed');
        }
    },
    getCurrentLoggedInUser: async(_: any , parameters : any ,context : any ) =>{
        if( context && context.user){
            const id= context.user.id;
            const user = await UserService.getUserById(id);
            return context.user;
        }
        throw new Error('I dont whow who are you');

    },
};

const mutations = {
    createUser: async (__: any, payload: CreateUserPayload) => {
        const res = await UserService.createUser(payload);
        if (res.user && res.user.id) {
            return res.user.id;
        } else {
            throw new Error(res.error || 'User creation failed');
        }
    },
};

export const resolvers = { queries, mutations };