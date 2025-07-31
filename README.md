# 个人主页

基于 Next.js + Tailwind CSS 构建的个人主页

[[在线预览]](https://ichiyo.in)

## 技术栈

- Next.js
- React
- Tailwind CSS
- TypeScript
- Prisma

## 部署

### 本地部署

```bash
git clone https://github.com/1Yie/ichiyo.in.git
cd ichiyo.in
# bun
bun install
bun dev
# npm
npm install
npm run dev
# yarn
yarn install
yarn dev
# pnpm
pnpm install
pnpm dev
```

**配置文件**

- `.env`
- `.env.local`
- `prisma/schema.prisma`

#### **.env**

```env
DATABASE_URL=""
JWT_SECRET=""
JWT_EXPIRES_IN=""
REGISTER_KEY=""
```

- `DATABASE_URL` 数据库地址
- `JWT_SECRET` JWT 加密密钥
- `JWT_EXPIRES_IN` JWT 过期时间
- `REGISTER_KEY` 注册密钥

#### **.env.local**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

- `NEXT_PUBLIC_API_BASE_URL` 接口地址

#### **prisma/schema.prisma**

**数据库迁移**

```bash
# bun
bun prisma migrate deploy
# npm
npm prisma migrate deploy
# yarn
yarn prisma migrate deploy
# pnpm
pnpm prisma migrate deploy
```

**生成数据库**

```bash
# bun
bunx prisma generate
# npm
npmx prisma generate
# yarn
yarnx prisma generate
# pnpm
pnpmx prisma generate
```

### 构建

```bash
# bun
bun run build
# npm
npm run build
# yarn
yarn build
# pnpm
pnpm build
```

### 启动

```bash
# bun
bun run start
# npm
npm run start
# yarn
yarn start
# pnpm
pnpm start
```

#### 使用 `pm2` 启动

**命令行**

```bash
# 安装 pm2
npm install -g pm2
# 启动项目
pm2 start npm --name "ichiyo.in" -- start
# 重启项目
pm2 restart "ichiyo.in"
# 停止项目
pm2 stop "ichiyo.in"
# 删除项目
pm2 delete "ichiyo.in"
```

**ecosystem.config.js**

```js
module.exports = {
  apps: [
    {
      name: "ichiyo.in",
      script: "npm",
      args: "start",
      cwd: "/opt/ichiyo.in",
      env: {
        // NODE_ENV: "production",
        DATABASE_URL: "file:./prod.db",
        PORT: "3000",
      },
    },
  ],
};
```

**加载**

```bash
# 加载配置文件
pm2 start ecosystem.config.js
```
