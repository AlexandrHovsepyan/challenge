import * as bcrypt from "bcrypt";

export const comparePassword = async (password: string, currentPassword: string): Promise<any> => {
    return bcrypt.compare(password, currentPassword);
};

export const generatePassword = async (password: string): Promise<any> => {
    return bcrypt.hash(password, 10);
};