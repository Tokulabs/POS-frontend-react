FROM node:21

ENV PORT=3000

WORKDIR /inventory-frontend
COPY . /inventory-frontend
RUN npm run build
EXPOSE ${PORT}
CMD ["npm", "build"]


FROM nginx:1.22.1-alpine as prod-stage
COPY --from=build-stage /inventory-frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]