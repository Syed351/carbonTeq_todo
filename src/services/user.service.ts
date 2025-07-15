import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { User } from "../schema/user.schema";
import { Roles } from "../schema/roles.schema";
import ApiError from "../utils/ApiErrors";
import { generateTokens, generateAcessToken, generateRefreshToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../dtos/user.dto";


const registerUserService = async (input: RegisterInput) => {
  const { name, email, password, role } = input;

  const [existingUser] = await db.select().from(User).where(eq(User.email, email));
  if (existingUser) throw new ApiError(400, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const [userRole] = await db.select().from(Roles).where(eq(Roles.name, role));

  await db.insert(User).values({
    name,
    email,
    password: hashedPassword,
    roleId: userRole.id,
    refreshToken: "",
  });
};


const loginUserService = async (input: LoginInput) => {
  const { email, password } = input;

  const [user] = await db
    .select({
      id: User.id,
      name: User.name,
      email: User.email,
      password: User.password,
      role: Roles.name,
    })
    .from(User)
    .innerJoin(Roles, eq(User.roleId, Roles.id))
    .where(eq(User.email, email));

  if (!user) throw new ApiError(400, "User not found");
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new ApiError(400, "Invalid password");

  const tokens = generateTokens(user);

  await db.update(User).set({ refreshToken: tokens.refreshToken }).where(eq(User.id, user.id));

  return { user, ...tokens };
};


const refreshAccessTokenService = async (refreshToken: string) => {
  if (!refreshToken) throw new ApiError(401, "Refresh Token not found");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { id: string };
  } catch {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const [user] = await db.select().from(User).where(eq(User.id, decoded.id)).limit(1);
  if (!user) throw new ApiError(401, "User not found");
  if (user.refreshToken !== refreshToken) throw new ApiError(401, "Invalid Refresh Token");

  const newAccessToken = generateAcessToken(user.id, user.name, user.email);
  const newRefreshToken = generateRefreshToken(user.id);

  await db.update(User).set({ refreshToken: newRefreshToken }).where(eq(User.id, user.id));

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};


const logoutUserService = async (userId: string) => {
  await db.update(User).set({ refreshToken: "" }).where(eq(User.id, userId));
};


export{
registerUserService,
loginUserService,
refreshAccessTokenService,
logoutUserService
}