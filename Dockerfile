# Stage 1: build the React frontend (output lands in backend/src/main/resources/static)
FROM node:20-alpine AS web
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN mkdir -p /app/backend/src/main/resources && npm run build

# Stage 2: build the Spring Boot jar with the frontend baked in
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app/backend
COPY backend/pom.xml ./
COPY backend/src ./src
COPY --from=web /app/backend/src/main/resources/static ./src/main/resources/static
RUN mvn -q -B -DskipTests -Dmaven.wagon.http.retryHandler.count=5 package

# Stage 3: small runtime image. Data lives in /data; mount a volume there to keep it.
# (Runs as root because most hosts mount volumes as root-owned.)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/target/portfolio-1.0.0.jar app.jar
RUN mkdir -p /data
ENV SPRING_DATASOURCE_URL=jdbc:h2:file:/data/portfolio
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "app.jar"]
