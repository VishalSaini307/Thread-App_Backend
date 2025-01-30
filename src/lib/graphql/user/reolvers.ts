const queries = {};

const mutations = {
    createUser : async(__: any, {}:{}) => {
        return "Hello World";
    },
};

export   const resolvers = { queries, mutations };