import { Repository } from "typeorm";
import { User } from "app/modules/users/model";
import { userSignUpSchema, userSignInSchema } from "app/validators/user";
import { postgresManagerInstance } from "app/db/PostgresManager";
import {FindOneOptions} from "typeorm/find-options/FindOneOptions";

class UserService {
    private userRepository: Repository<User>

    public async create(requestBody: Partial<Omit<User, 'id'>>): Promise<User> {
        const { error, value } = userSignUpSchema.validate(requestBody);
        if (error) throw error;
        this.userRepository = postgresManagerInstance.connection.getRepository(User);

        value.email = value.email.toLowerCase();
        const userInDb = await this.findOneByEmail(value.email);

        if (userInDb) {
            throw new Error("User with this email already exists");
        }

        const newUser = new User();
        newUser.firstName = value.firstName;
        newUser.secondName = value.secondName;
        newUser.email = value.email;
        newUser.password = value.password;
        return this.userRepository.save(newUser);
    }

    public async findOneByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { email }});
    }

    public async singIn(requestBody: Partial<Omit<User, 'id'>>): Promise<User> {
        const { error, value } = userSignInSchema.validate(requestBody);
        if (error) throw error;
        this.userRepository = postgresManagerInstance.connection.getRepository(User);

        value.email = value.email.toLowerCase();
        const userInDb = await this.findOneByEmail(value.email);

        if (!userInDb) {
            throw new Error("Wrong email or password");
        }

        const isValid  = await userInDb.comparePassword(value.password);
        if (isValid) {
            return userInDb;
        }

        throw new Error("Wrong email or password");
    }
}
export default new UserService();
