// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'; // 指向上面创建的 auth.ts

// 这会自动处理 GET (用于 OAuth 回调) 和 POST (用于密码登录)
export const { GET, POST } = handlers;
