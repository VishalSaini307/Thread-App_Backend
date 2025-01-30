import express, { Application, Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClient } from './lib/db';
import createApolloGraphqlServer from './lib/graphql';
import dotenv from 'dotenv';

dotenv.config();

async function init() {
  const app: Application = express();
  const PORT = process.env.PORT || 8000;

  app.use(express.json());

  // Apollo Server setup
  



  // Root route
  app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Server is running' });
  });
  const gqlServer = await createApolloGraphqlServer();

  // Apollo GraphQL middleware
  app.use('/graphql',expressMiddleware(gqlServer, {
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
