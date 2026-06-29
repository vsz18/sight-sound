FROM nginx:alpine
ARG GH_TOKEN=
COPY index.html /usr/share/nginx/html/index.html
RUN sed -i "s|__GH_TOKEN__|${GH_TOKEN}|g" /usr/share/nginx/html/index.html
EXPOSE 80
