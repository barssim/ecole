FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy the Spring Boot jar file into the container
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Expose the default Spring Boot port
EXPOSE 8761
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]