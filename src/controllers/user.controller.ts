import { Request, Response } from "express";
import { container } from "tsyringe";
import { UserService } from "../services/user.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { matchRes } from "@carbonteq/fp";
import { IUserResponse } from "../interface/user.interface";

const userService = container.resolve(UserService);

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.registerUser(req.body);

  return matchRes(result, {
    Ok: (data: IUserResponse) =>
      res.status(201).json(new ApiResponse(201, data, "Registered successfully")),
    Err: (err) =>
      res.status(400).json(new ApiResponse(400, {}, err)),
  });
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.loginUser(req.body);

  return matchRes(result, {
    Ok: (data: IUserResponse) => {
      const options = { httpOnly: true, secure: true };

      return res
        .cookie("accessToken", data.accessToken, options)
        .cookie("refreshToken", data.refreshToken, options)
        .json(new ApiResponse(200, data, "Login successful"));
    },
    Err: (err) =>
      res.status(401).json(new ApiResponse(401, {}, err)),
  });
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const result = await userService.refreshAccessToken(token);

  return matchRes(result, {
    Ok: (data: IUserResponse) => {
      const options = { httpOnly: true, secure: true };

      return res
        .cookie("accessToken", data.accessToken, options)
        .cookie("refreshToken", data.refreshToken, options)
        .json(new ApiResponse(200, data, "Access token refreshed"));
    },
    Err: (err) =>
      res.status(401).json(new ApiResponse(401, {}, err)),
  });
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.logoutUser(req.user.id);

  const options = { httpOnly: true, secure: true };

  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
