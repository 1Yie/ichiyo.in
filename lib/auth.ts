import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import ms from "ms";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const getJwtSecretKey = () => {
  const encoder = new TextEncoder();
  return encoder.encode(JWT_SECRET);
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

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
  [key: string]: unknown;
}

export type TokenResult = {
  success: boolean;
  payload?: JwtPayload;
  error?: string;
};

export async function generateToken(payload: JwtPayload): Promise<string> {
  const secretKey = getJwtSecretKey();

  const expiresInSeconds = Math.floor(
    ms(JWT_EXPIRES_IN as ms.StringValue) / 1000
  );

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenResult> {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.uid === "number" &&
      typeof payload.email === "string" &&
      typeof payload.id === "string"
    ) {
      return {
        success: true,
        payload: {
          uid: payload.uid,
          email: payload.email,
          id: payload.id,
        },
      };
    }

    return {
      success: false,
      error: "Token payload has invalid structure",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Token verification failed",
    };
  }
}

export async function authenticateToken(
  token: string | undefined
): Promise<JwtPayload | null> {
  if (!token) return null;

  const tokenResult = await verifyToken(token);
  if (tokenResult.success && tokenResult.payload) {
    return tokenResult.payload;
  }

  return null;
}

export function getTokenExpirationInSeconds(): number {
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  const milliseconds = ms(expiresIn as ms.StringValue);

  return Math.round(milliseconds / 1000);
}
