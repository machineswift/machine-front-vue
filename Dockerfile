# 基础镜像
FROM nginx:1.29-otel

COPY dist/ /usr/share/nginx/html/