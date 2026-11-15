# Nginx 官方 Alpine 镜像
FROM nginx:1.31-alpine

WORKDIR /usr/share/nginx/html

# 复制前端构建产物，并设置静态文件所有者
COPY --chown=nginx:nginx dist/ ./

# HTTP 端口
EXPOSE 80

# 优雅停止 Nginx
STOPSIGNAL SIGQUIT

# 前台运行
CMD ["nginx", "-g", "daemon off;"]