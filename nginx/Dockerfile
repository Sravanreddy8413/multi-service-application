FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=10s \
    --retries=3 \
    CMD wget --no-verbose \
        --tries=1 \
        --spider \
        http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
