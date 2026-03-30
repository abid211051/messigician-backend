import {
  createMessService,
  messJoinRequestService,
} from "./onboard.services.js";
import { setAccessToken, setRefreshToken } from "../../utils/jwtToken.js";

const messCreationCtrl = async (req, res, next) => {
  try {
    const file = req.file;
    const { fname } = req.body;
    const user_id = req.user.id;
    const response = await createMessService({ file, fname, user_id });
    setAccessToken({
      payload: response,
      res,
    });
    setRefreshToken({
      payload: response,
      res,
    });
    return res.status(201).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

const messJoinRequestCtrl = async (req, res, next) => {
  try {
    const { mess_id, sub_mess_id } = req.body;
    const user_id = req.user.id;
    const response = await messJoinRequestService({
      user_id,
      mess_id,
      sub_mess_id,
    });
    return res.status(201).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export { messCreationCtrl, messJoinRequestCtrl };
