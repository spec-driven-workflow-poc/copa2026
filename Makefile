.PHONY: check format lint test install
install:
	npm install
check:
	npm run check
format:
	npm run format:write
lint:
	npm run lint
test:
	npm run test
