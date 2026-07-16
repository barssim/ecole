FROM mysql:8

# Optional: copy init SQL scripts (Docker executes *.sql, *.sh in /docker-entrypoint-initdb.d/)
# COPY init.sql /docker-entrypoint-initdb.d/

# Set default environment (can be overridden by compose)
ENV MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-dev-pass}
ENV MYSQL_DATABASE=${MYSQL_DATABASE:-userDB}

