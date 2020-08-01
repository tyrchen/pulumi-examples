up:
	docker run --rm -it \
    -e PULUMI_ACCESS_TOKEN \
    -e AWS_ACCESS_KEY_ID=$(AWS_KEY_ID) \
    -e AWS_SECRET_ACCESS_KEY=$(AWS_KEY_SECRET) \
    -e AWS_REGION=us-east-2 \
    -w /app \
    -v $(shell pwd):/app \
	-v /app/node_modules \
    --entrypoint bash \
    pulumi/pulumi \
    -c "npm install && pulumi up --stack dev"
