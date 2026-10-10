# 域名部署

本项目是有 Node.js 后端的全端交互 Demo。静态托管/GitHub Pages 不提供数据保存和 API；需要支持 Node.js 或 Docker 的服务器。外部 AI、发布和眼镜硬件仍为模拟。

## Docker（推荐）

```sh
git clone https://github.com/cicicrystal2026/ciliFeiYi.git
cd ciliFeiYi
cp .env.example .env
# 编辑 .env，设置自己的 DEMO_USER 和 DEMO_PASSWORD，勿提交真实口令。
docker compose up -d --build
docker compose logs --tail=50
```

应用监听服务器本地 8769 端口。使用域名的 A 记录指向服务器公网 IP，在 Nginx/宝塔等面板中将该域名反向代理到 `http://127.0.0.1:8769`，并启用 HTTPS 证书。可参考 `deploy/nginx.conf.example`；SSE 实时同步需关闭代理缓冲并保留长连接。手机直接打开 `https://你的域名/#mobile/124`。

`DEMO_USER`、`DEMO_PASSWORD` 同时设置时，所有网页/API 均要求 HTTP Basic 登录。请通过 HTTPS 访问。该口令是演示站点的访问保护；界面内角色选择仍为模拟身份，不能替代生产权限认证。全部内容使用演示数据。

Docker 命名卷 `demo-data` 保存状态。更新时执行 `git pull` 和 `docker compose up -d --build`。`docker compose down` 保留数据；不要添加 `-v`，否则会删除持久数据。

## 直接运行 Node.js

Node.js 20 以上，零运行依赖：

```sh
HOST=127.0.0.1 PORT=8769 DATA_DIR=/your/persistent/data DEMO_USER=demo DEMO_PASSWORD='你的口令' node server.js
```

通过进程管理工具保持服务运行，反向代理同上。仅运行一个实例：Demo 采用本地 JSON 存储，不支持多副本并发写入。托管平台需要挂载可写持久磁盘并设置 `DATA_DIR`；对外监听时设置 `HOST=0.0.0.0`，端口遵循平台注入的 `PORT`。

## 自查

```sh
npm run check
npm test
curl -u demo:你的口令 http://127.0.0.1:8769/api/health
```

健康接口返回 `ok: true`、`pages: 185`。浏览器打开首页，通过顶部“演示流程”验证业务闭环。域名、服务器、证书未在本次源码推送中配置。
