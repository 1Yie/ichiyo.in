import { SignJWT, jwtVerify } from "jose";
import ms from "ms";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const getJwtSecretKey = () => {
  return new TextEncoder().encode(JWT_SECRET);
};

// 密码加密 (PBKDF2)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    data,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 10000,
      hash: "SHA-256",
    },
    key,
    256
  );

  const combined = new Uint8Array(salt.length + hashBuffer.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hashBuffer), salt.length);

  // 转成 base64 存储
  return Buffer.from(combined).toString("base64");
}

// 密码验证 (PBKDF2)
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const combined = Uint8Array.from(Buffer.from(hashedPassword, "base64"));

    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    const key = await crypto.subtle.importKey(
      "raw",
      passwordData,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 10000,
        hash: "SHA-256",
      },
      key,
      256
    );

    const computedHash = new Uint8Array(hashBuffer);
    if (computedHash.length !== storedHash.length) return false;

    for (let i = 0; i < computedHash.length; i++) {
      if (computedHash[i] !== storedHash[i]) return false;
    }

    return true;
  } catch (error) {
    console.error("PBKDF2 verify failed:", error);
    return false;
  }
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

// 生成 JWT
export async function generateToken(payload: JwtPayload): Promise<string> {
  const secretKey = getJwtSecretKey();

  const expiresInSeconds = Math.floor(ms(JWT_EXPIRES_IN as ms.StringValue) / 1000);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secretKey);
}

// 验证 JWT
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
      error: error instanceof Error ? error.message : "Token verification failed",
    };
  }
}

// 验证 token 并返回有效载荷或 null
export async function authenticateToken(token: string | undefined): Promise<JwtPayload | null> {
  if (!token) return null;

  const tokenResult = await verifyToken(token);
  return tokenResult.success && tokenResult.payload ? tokenResult.payload : null;
}

// 获取 token 过期秒数
export function getTokenExpirationInSeconds(): number {
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  return Math.round(ms(expiresIn as ms.StringValue) / 1000);
}
