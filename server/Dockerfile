FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖（含 devDependencies 用于构建）
RUN npm install

# 复制源码
COPY tsconfig.json ./
COPY src ./src

# 构建 TypeScript → JavaScript
RUN npm run build

# === 生产阶段 ===
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制依赖文件
COPY package.json package-lock.json* ./

# 仅安装生产依赖
RUN npm ci --omit=dev

# 从构建阶段复制编译产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3001

# 启动
CMD ["node", "dist/index.js"]
