"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express4_1 = require("@apollo/server/express4");
const graphql_1 = __importDefault(require("./lib/graphql"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./services/user"));
dotenv_1.default.config();
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const PORT = process.env.PORT || 8000;
        app.use(express_1.default.json());
        // Apollo Server setup
        const gqlServer = yield (0, graphql_1.default)();
        // Start the Apollo Server
        yield gqlServer.start();
        // Root route
        app.get('/', (req, res) => {
            res.json({ message: 'Server is running' });
        });
        // Middleware setup for GraphQL endpoint
        app.use('/graphql', express_1.default.json(), // Ensure express.json() middleware is included before GraphQL middleware
        (0, express4_1.expressMiddleware)(gqlServer, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req }) {
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
                    const user = user_1.default.decodeJWTToken(token);
                    return { user }; // Return the user in the context
                }
                catch (error) {
                    // Handle error if decoding fails
                    console.error('Error decoding token:', error.message);
                    return { user: null }; // Return null user if decoding fails
                }
            }),
        }) // Type assertion to resolve type conflict
        );
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}
init();
