# Доставка еды (проект для портфолио)

```shell
docker buildx build -t eat-api .
```

```shell
# Backup db
docker compose exec db pg_dump -Fc -U postgres > ~/docker/eat-api/eat-db-$(date '+%Y-%m-%d').dump
# Restore db
docker compose exec -T db pg_restore -U postgres -d eat < ~/docker/eat-api/eat-db-20xx-xx-xx.dump
```
