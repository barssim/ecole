# secretary-office

Spring Boot microservice for ECOLE attestations.

## Endpoints

- `GET /api/attestations?userId=5`
- `GET /api/attestationsproduction?userId=5`
- `GET /api/attestations/{id}`
- `GET /api/attestations/{id}/view`
- `GET /api/attestations/{id}/download`

## Local build

```bash
mvn test
mvn package
```

