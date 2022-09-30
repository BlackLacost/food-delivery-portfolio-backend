devu:
	docker-compose --env-file .env.dev -f docker-compose.yml up

devd:
	docker-compose --env-file .env.dev -f docker-compose.yml down

testu:
	docker-compose --env-file .env.test -f docker-compose.test.yml up

testd:
	docker-compose --env-file .env.test -f docker-compose.test.yml down