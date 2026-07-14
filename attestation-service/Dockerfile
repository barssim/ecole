# Use a lightweight base image with JDK 17
FROM eclipse-temurin:17-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the Spring Boot war file into the container
ARG WAR_FILE=target/*.war
COPY ${WAR_FILE} app.war

# Expose the attestation-service port
EXPOSE 8092

# Run the application
ENTRYPOINT ["java", "-jar", "app.war"]
