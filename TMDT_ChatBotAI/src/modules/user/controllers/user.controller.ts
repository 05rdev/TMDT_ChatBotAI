import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getProfile(req: Request, res: Response) {
    try {
      // Giả sử lấy userId từ token sau này (req.user)
      const userId = req.params.id;
      const user = await userService.findById(userId as string);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
