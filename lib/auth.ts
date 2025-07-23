import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 验证密码
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export interface JwtPayload {
  uid: number;
  email: string;
  id: string;
}

// 生成 JWT
export function generateToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as ms.StringValue,
    algorithm: "HS256",
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
}

// 验证 JWT
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
