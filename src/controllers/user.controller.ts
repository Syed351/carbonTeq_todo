import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

// Inject repositories
import { DrizzleUserRepository } from "../imppl/userdrizzle.repository";
import { DrizzleRoleRepository } from "../imppl/drizzleRoleRepository";
import { UserService } from "../services/user.service";

// ✅ Create an instance of the service using DI
const userService = new UserService(new DrizzleUserRepository(), new DrizzleRoleRepository());

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.registerUser(req.body);
  return res.status(201).json(new ApiResponse(201, {}, "Registered successfully"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.loginUser(req.body);

  const options = { httpOnly: true, secure: true };

  return res
    .cookie("accessToken", result.accessToken, options)
    .cookie("refreshToken", result.refreshToken, options)
    .json(new ApiResponse(200, result, "Login successful"));
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const result = await userService.refreshAccessToken(token);

  const options = { httpOnly: true, secure: true };

  return res
    .cookie("accessToken", result.accessToken, options)
    .cookie("refreshToken", result.refreshToken, options)
    .json(new ApiResponse(200, result, "Access token refreshed"));
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.logoutUser(req.user.id);

  const options = { httpOnly: true, secure: true };

  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out"));
});
