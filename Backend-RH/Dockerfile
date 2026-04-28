# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and POM first to leverage Docker layer caching for dependencies
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline --no-transfer-progress -B

# Copy source and build the JAR
COPY src/ src/
RUN ./mvnw package -DskipTests --no-transfer-progress -B && \
    mv target/*.jar target/app.jar

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /build/target/app.jar app.jar

# Create directories for file storage and set ownership
RUN mkdir -p /app/uploads /app/stored-cvs /app/uploads/cv && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD nc -z localhost 8090 || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
