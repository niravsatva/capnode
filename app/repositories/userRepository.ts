import { PrismaClient } from '@prisma/client';
import { UserInfo } from '../interfaces';

const prisma = new PrismaClient();

class UserRepository {
  async getAll() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (err) {
      throw err;
    }
  }

  async getById(id: number) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  async create(userData: UserInfo) {
    try {
      const user = await prisma.user.create({
        data: userData,
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  async update(userData: UserInfo) {
    try {
      const user = await prisma.user.update({
        data: userData,
        where: { id: userData?.id },
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  async delete(id: number) {
    try {
      const user = await prisma.user.delete({
        where: { id: id },
      });
      return user;
    } catch (err) {
      throw err;
    }
  }
}

export default new UserRepository();
