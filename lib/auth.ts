import { SignJWT, jwtVerify } from "jose";
import ms from "ms";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const DEFAULT_ITERATIONS = Number(process.env.DEFAULT_ITERATIONS);

const SALT_LENGTH = 16; // 16 字节盐
const KEY_LENGTH = 256; // 256 位密钥
const HASH_LENGTH = 32; // SHA-256 生成 32 字节的哈希值

const getJwtSecretKey = () => {
  return new TextEncoder().encode(JWT_SECRET);
};

// 密码加密 (PBKDF2)
export async function hashPassword(
  password: string,
  iterations: number = DEFAULT_ITERATIONS
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    KEY_LENGTH
  );

  // 新格式：[salt (16B)] + [iterations (4B)] + [hash (32B)]
  const iterationsBytes = new Uint8Array(new Uint32Array([iterations]).buffer);
  const hashBytes = new Uint8Array(hashBuffer);
  const combined = new Uint8Array(
    salt.length + iterationsBytes.length + hashBytes.length
  );

  combined.set(salt);
  combined.set(iterationsBytes, salt.length);
  combined.set(hashBytes, salt.length + iterationsBytes.length);

  return Buffer.from(combined).toString("base64");
}

interface VerificationResult {
  isValid: boolean;
  needsUpdate?: boolean;
  storedIterations?: number; // 返回存储的迭代次数
}

// 密码验证
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<VerificationResult> {
  try {
    const decoded = Uint8Array.from(Buffer.from(hashedPassword, "base64"));
    const encoder = new TextEncoder();

    if (decoded.length === SALT_LENGTH + 4 + HASH_LENGTH) {
      const salt = decoded.slice(0, SALT_LENGTH);
      const iterations = new DataView(
        decoded.slice(SALT_LENGTH, SALT_LENGTH + 4).buffer
      ).getUint32(0, true);
      const storedHash = decoded.slice(SALT_LENGTH + 4);

      // 检查迭代次数是否需要升级（只要不等于当前配置就更新）
      const shouldUpgrade = iterations !== DEFAULT_ITERATIONS;

      const hashBuffer = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
        await crypto.subtle.importKey(
          "raw",
          encoder.encode(password),
          "PBKDF2",
          false,
          ["deriveBits"]
        ),
        KEY_LENGTH
      );

      return {
        isValid: timingSafeEqual(new Uint8Array(hashBuffer), storedHash),
        needsUpdate: shouldUpgrade,
        storedIterations: iterations,
      };
    }

    return { isValid: false };
  } catch (error) {
    console.error("Password verification error:", error);
    return { isValid: false };
  }
}

// 安全比较函数（时序安全）
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
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

  const expiresInSeconds = Math.floor(
    ms(JWT_EXPIRES_IN as ms.StringValue) / 1000
  );

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
      error:
        error instanceof Error ? error.message : "Token verification failed",
    };
  }
}

// 验证 token 并返回有效载荷或 null
export async function authenticateToken(
  token: string | undefined
): Promise<JwtPayload | null> {
  if (!token) return null;

  const tokenResult = await verifyToken(token);
  return tokenResult.success && tokenResult.payload
    ? tokenResult.payload
    : null;
}

// 获取 token 过期秒数
export function getTokenExpirationInSeconds(): number {
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  return Math.round(ms(expiresIn as ms.StringValue) / 1000);
}
