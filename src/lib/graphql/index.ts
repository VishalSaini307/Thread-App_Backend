import { ApolloServer } from "@apollo/server";
import gql from "graphql-tag";
import { User } from "./user";

async function createApolloGraphqlServer() {
  // Define the typeDefs using the gql tag
  const typeDefs = gql`
    ${User.typeDefs}

    type Query {
      ${User.queries}
    }

    type Mutation {
      ${User.mutations}
    }
  `;

  // Define the resolvers
  const resolvers = {
    Query: { ...User.resolvers.queries },
    Mutation: { ...User.resolvers.mutations },
  };

  // Create the Apollo Server instance
  const gqlServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Return the Apollo Server instance
  return gqlServer;
}

export default createApolloGraphqlServer;