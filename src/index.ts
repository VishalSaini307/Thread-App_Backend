import express, { Application, Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClient } from './lib/db';

async function init() {
  const app: Application = express();
  const PORT = process.env.PORT || 8000;

  app.use(express.json());

  // Apollo Server setup
  const gqlServer = new ApolloServer({
    typeDefs: `
      type Query {
        hello: String
        say(name: String): String
      }
      type Mutation {
        createUser( firstName : String! , lastName : String! ,email : String!, password : String!): Boolean
      }
    `,
    resolvers: {
      Query: {
        hello: () => 'Hello World',
        say: (_, { name}) => `Hello ${name}`,
      },
      Mutation :{
        createUser : async (__,
           {firstName , lastName ,email , password} : 
           {firstName: string; lastName : string; email :string ; password : string;}) =>{
                await prismaClient.user.create({
                 data: {
                  email,
                  firstName,
                  lastName,
                  password,
                  salt: 'random_salt',
                 },
                });
                return true;
        }
      }
    },
  });

  await gqlServer.start();

  // Root route
  app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Server is running' });
  });

  // Apollo GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(gqlServer, {
      context: async ({ req }) => ({ token: req.headers.authorization || null }),
    }) as unknown as express.RequestHandler // Resolve type conflict
  );

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on: ${PORT}`);
  });
}

// Initialize the app
init().catch((error) => {
  console.error('Error starting the server:', error);
});
