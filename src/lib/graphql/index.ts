import { ApolloServer } from "@apollo/server";
import gql from "graphql-tag";
import { User } from "./user";

async function createApolloGraphqlServer() {
  

  const typeDefs = gql`
    type Query {
       hello:String
    }
    type Mutation {
      ${User.mutations}
    }
  `;

  const resolvers = {
    Query: { ...User.resolvers.queries },
    Mutation: { ...User.resolvers.mutations },
  };

  const gqlServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await gqlServer.start();

  return gqlServer;
}

export default createApolloGraphqlServer;
