import { prismaClient } from "../lib/db";
import { createHmac, randomBytes } from "crypto";
import { sign } from "jsonwebtoken";

export interface CreateUserPayloads {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
}

export interface GetUserTokenPayload {
    email: string;
    password: string;
}

class UserService {
    private static hashPassword(password: string, salt: string): string {
        return createHmac("sha256", salt).update(password).digest("hex");
    }

    public static async createUser(payload: CreateUserPayloads): Promise<{ user?: any; error?: string }> {
        try {
            const { firstName, lastName, email, password } = payload;
            
            // Check if the user already exists
            const existingUser = await prismaClient.user.findUnique({ where: { email } });
            if (existingUser) return { error: "Email already exists" };

            // Generate password hash
            const salt = randomBytes(16).toString("hex");
            const hashedPassword = UserService.hashPassword(password, salt);

            // Create user
            const user = await prismaClient.user.create({
                data: {
                    firstName,
                    lastName: lastName ?? null,
                    email,
                    salt,
                    password: hashedPassword,
                },
            });

            return { user };
        } catch (error) {
            console.error("Error creating user:", error);
            return { error: "Internal server error" };
        }
    }

    public static async getUserByEmail(email: string) {
        return prismaClient.user.findUnique({ where: { email } });
    }

    public static async getUserToken(payload: GetUserTokenPayload): Promise<{ token?: string; error?: string }> {
        try {
            const { email, password } = payload;

            // Fetch user from DB
            const user = await UserService.getUserByEmail(email);
            if (!user) return { error: "User not found" };

            // Hash input password with stored salt
            const hashedPassword = UserService.hashPassword(password, user.salt);
            if (hashedPassword !== user.password) return { error: "Invalid password" };

            // Ensure JWT_SECRET is set
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is missing from environment variables");
            }

            // Generate JWT token
            const token = sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            return { token };
        } catch (error) {
            console.error("Error generating token:", error);
            return { error: "Internal server error" };
        }
    }
}

export default UserService;
