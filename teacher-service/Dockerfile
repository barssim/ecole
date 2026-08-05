FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

ARG WAR_FILE=target/*.war
COPY ${WAR_FILE} app.war

EXPOSE 8096

ENTRYPOINT ["java", "-jar", "app.war"]

