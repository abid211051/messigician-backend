import {
  addUserToSubmessService,
  getJoinRequestsService,
  rejectJoinRequestService,
} from "./join-request.services.js";

export const joinRequestAcceptCtrl = async (req, res, next) => {
  try {
    const { request_id, user_id, sub_mess_id } = req.body;

    const result = await addUserToSubmessService({
      request_id,
      user_id,
      sub_mess_id,
    });

    if (result.status === "already_in_mess") {
      return res.status(200).json({
        success: true,
        message: "User already belongs to a mess — request removed",
      });
    }
    return res.status(201).json({
      success: true,
      message: "User added to successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const joinRequestRejectCtrl = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    await rejectJoinRequestService({ request_id });

    return res.status(200).json({
      success: true,
      message: "Join request rejected",
    });
  } catch (error) {
    next(error);
  }
};

export const getJoinRequestsCtrl = async (req, res, next) => {
  try {
    const { mess_id } = req.params;

    const result = await getJoinRequestsService({ mess_id });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
