import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import ApiError from "../utils/ApiErrors";
import {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService
} from "../services/user.service";

import { RegisterDTO, RegisterInput, LoginDTO, LoginInput } from "../dtos/user.dto";

// Register Controller
 const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = RegisterDTO.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid registration data");

  const data: RegisterInput = parsed.data;
  await registerUserService(data);

  return res.status(201).json(new ApiResponse(201, {}, "Registered Successfully"));
});

// Login Controller
 const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = LoginDTO.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid login data");

  const data: LoginInput = parsed.data;
  const { user, accessToken, refreshToken } = await loginUserService(data);

  const options = { httpOnly: true, secure: true };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200)
    .json(
      new ApiResponse(200, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      }, "Login successful")
    );
});

// Refresh Access Token Controller
 const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessTokenService(refreshToken);

  const options = { httpOnly: true, secure: true };

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .status(200)
    .json(
      new ApiResponse(200, {
        accessToken,
        refreshToken: newRefreshToken,
      }, "Access Token refreshed successfully")
    );
});

// Logout Controller
 const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  await logoutUserService(req.user.id);

  const options = { httpOnly: true, secure: true };

  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
};