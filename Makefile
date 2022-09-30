devu:
	docker-compose --env-file .env.dev up

devd:
	docker-compose --env-file .env.dev down

testu:
	docker-compose --env-file .env.test up

testd:
	docker-compose --env-file .env.test down
