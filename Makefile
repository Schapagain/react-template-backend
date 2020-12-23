install:
	docker-compose run --rm --no-deps web npm install

clean:
	docker-compose run --rm --no-deps web npm run clean

migrate:
	docker-compose run --rm web /bin/bash -c "./wait-for-it.sh \$$PGHOST:\$$PGPORT -s -t 30 -- npm run migrate"

admin:
	docker-compose run --rm web /bin/bash -c "./wait-for-it.sh \$$PGHOST:\$$PGPORT -s -t 30 -- npm run seed"

dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

server:
	docker-compose up -d --build

server-down:
	docker-compose down
