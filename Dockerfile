FROM node:21

ENV PORT=3000

WORKDIR /inventory-frontend
COPY package.json .
RUN npm install
COPY . .
RUN npm run build


FROM nginx:1.22.1-alpine as prod-stage
COPY --from=build-stage /inventory-frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]