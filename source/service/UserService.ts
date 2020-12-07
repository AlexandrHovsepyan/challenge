import { Repository } from "typeorm";
import { User } from "../modules/users/model";
import { userSignUpSchema, userSignInSchema } from "../validators/user";
import { postgresManagerInstance } from "../db/PostgresManager";
import { generatePassword, comparePassword } from "../utils/bcrypt";

class UserService {
    private userRepository: Repository<User>

    public async create(requestBody): Promise<User> {
        const { error, value } = userSignUpSchema.validate(requestBody);
        if (error) throw error;
        this.userRepository = postgresManagerInstance.connection.getRepository(User);

        value.email = value.email.toLowerCase();
        const userInDb = await this.findOneByQuery({ email: value.email });

        if (userInDb) {
            throw new Error("User with this email already exists");
        }

        value.password = await generatePassword(value.password);
        const newUser = new User();
        newUser.first_name = value.first_name;
        newUser.second_name = value.second_name;
        newUser.email = value.email;
        newUser.password = value.password;
        return this.userRepository.save(newUser);
    }

    public async findOneByQuery(query): Promise<User> {
        return this.userRepository.findOne(query);
    }

    public async singIn(requestBody): Promise<User> {
        const { error, value } = userSignInSchema.validate(requestBody);
        if (error) throw error;
        this.userRepository = postgresManagerInstance.connection.getRepository(User);

        value.email = value.email.toLowerCase();
        const userInDb = await this.findOneByQuery({ email: value.email });

        if (!userInDb) {
            throw new Error("User with this email address doesn't exist");
        }

        const isValid  = await comparePassword(value.password, userInDb.password);
        if (isValid) {
            return userInDb;
        }

        throw new Error("Wrong email or password");
    }
}
export default new UserService();
