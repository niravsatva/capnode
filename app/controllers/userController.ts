import e, { Request, Response, NextFunction } from 'express';
import { CommonResponse } from '../models/commonResponse';
import { registerValidator } from '../helpers/validators';
import userRepository from '../repositories/userRepository';
import userServices from '../services/userServices';

class UserController {
  // get all users controller
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const objResponse = new CommonResponse();

    try {
      const users = await userRepository.getAll();

      objResponse.message = 'Users fetched successfully';
      objResponse.responseStatus = 200;
      objResponse.data = users;

      return res.status(200).json(objResponse);
    } catch (err) {}
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    const objResponse = new CommonResponse();
    try {
      // check validation
      const error = registerValidator.validate(req.body);

      //   validation failed
      if (error.error) {
        console.log('Err: ', error.error);
        objResponse.message = error?.error?.details[0]?.message!;
        objResponse.responseStatus = 403;
        // objResponse.data = error?.error;
        return res.send(objResponse);
      }

      const user = await userServices.createUser(req.body);

      objResponse.data = user;
      objResponse.message = 'User created successfully';
      objResponse.responseStatus = 201;

      return res.status(201).json(objResponse);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
