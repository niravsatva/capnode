import { UserInfo } from '../interfaces';
import userRepository from '../repositories/userRepository';

class UserServices {
  async getAllUsers() {}

  async getUserById() {}

  async createUser(userData: UserInfo) {
    try {
      const data: UserInfo = {
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        email: userData?.email,
        password: userData?.password,
        phone: userData?.phone,
      };

      const user = await userRepository.create(data);
      return user;
    } catch (err) {
      throw err;
    }
  }

  async updateUser() {}

  async deleteUser() {}
}

export default new UserServices();
