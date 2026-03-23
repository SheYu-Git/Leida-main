# 项目说明

这是从原始工作区拆分出的独立仓库副本。

## 常用命令

```bash
npm ci
npm run dev
npm run build
bash scripts/sync_server.sh
bash scripts/deploy_server.sh
bash scripts/check_server.sh
```

## 说明

- 本仓库已忽略 node_modules、dist、.env、数据库文件等
- 如需部署，请在云端执行构建并用进程守护工具启动服务

## 部署脚本

- `scripts/sync_server.sh`：本机增量同步到服务器
- `scripts/deploy_server.sh`：同步 + npm ci + pm2 启动/重启 + 健康检查
- `scripts/check_server.sh`：健康、同步状态、昨日报表、定时任务校验

可选环境变量：

- `LOCAL_DIR` 本地目录
- `REMOTE_USER` 服务器用户
- `REMOTE_HOST` 服务器地址
- `REMOTE_PORT` 服务器端口
- `REMOTE_DIR` 服务器目录
- `APP_NAME` pm2 进程名（deploy脚本）
- `WAIT_SECONDS` 定时校验等待秒数（check脚本）
