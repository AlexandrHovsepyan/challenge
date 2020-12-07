import * as jwt from "jsonwebtoken";

export class AuthController {
    public static generateToken(userEmail: string): string {
        const token = jwt.sign({ userEmail }, process.env.JWT_SECRET, {
            expiresIn: '10d'
        });
        return token;
    }
}