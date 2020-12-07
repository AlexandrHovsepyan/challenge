import UserService from "../../service/UserService";

class UserController {
    public async create(requestBody) {
        try {
            return await UserService.create(requestBody);
        } catch (error) {
            throw error;
        }
    }
}

export let userControllerInstance = new UserController();