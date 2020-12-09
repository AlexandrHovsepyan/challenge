import * as jwt from "jsonwebtoken";

export const generateToken = (userEmail: string): string => {
     const token = jwt.sign({ userEmail }, process.env.JWT_SECRET, {
         expiresIn: '10d'
     });
     return token;
};

export const isTokenValid = (token: string): string | boolean => {
    try {
        const signedToken = token.split(' ')[1];
        let { userEmail } = jwt.verify(signedToken, process.env.JWT_SECRET);
        return userEmail;
    } catch (e) {
        return false;
    }
}