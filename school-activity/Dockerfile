FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

ARG WAR_FILE=target/*.war
COPY ${WAR_FILE} app.war

EXPOSE 8099

ENTRYPOINT ["java", "-jar", "app.war"]

