# Build Stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S boozer && adduser -S boozer -G boozer

COPY --from=builder /app/target/boozer-backend-1.0.0-SNAPSHOT.jar app.jar
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh && chown -R boozer:boozer /app

USER boozer

EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseSerialGC -Xss512k -XX:MaxRAMPercentage=65.0"

ENTRYPOINT ["./entrypoint.sh"]
