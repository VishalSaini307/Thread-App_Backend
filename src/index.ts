import express, { Application, Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import createApolloGraphqlServer from './lib/graphql';
import dotenv from 'dotenv';
import UserService from './services/user';

dotenv.config();

async function init() {
  const app = express();
  const PORT = process.env.PORT || 8000;

  app.use(express.json());

  // Apollo Server setup
  const gqlServer = await createApolloGraphqlServer();

  // Start the Apollo Server
  await gqlServer.start();

  // Root route
  app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Server is running' });
  });

  
  // Middleware setup for GraphQL endpoint
  app.use(
    '/graphql',
    express.json(), // Ensure express.json() middleware is included before GraphQL middleware
    expressMiddleware(gqlServer, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
  
        // If no authorization header, return null user
        if (!authHeader) {
          return { user: null };
        }
  
        // Extract token from 'Bearer <token>'
        const token = authHeader.split(' ')[1];
        if (!token) {
          return { user: null };
        }
  
        try {
          // Decode token to retrieve user information
          const user = UserService.decodeJWTToken(token);
          return { user }; // Return the user in the context
        } catch (error: any) {
          // Handle error if decoding fails
          console.error('Error decoding token:', error.message);
          return { user: null }; // Return null user if decoding fails
        }
      },
    }) as unknown as express.RequestHandler // Type assertion to resolve type conflict
  );
  

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

init();