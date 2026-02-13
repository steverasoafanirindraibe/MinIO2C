MinIO2C – MinIO Control Center CLI

A simple interactive CLI tool to manage MinIO users, buckets and policies using official mc commands.

Features

Automatic mc download

Alias configuration

List users

Create user

Delete user

List buckets

Create bucket

List policies

Attach policy to user

Windows executable support (.exe)

Requirements

Node.js 18+

Docker running MinIO

Run MinIO locally
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  minio/minio server /data --console-address ":9001"

Install & Run
npm install
npm start

Build Windows Executable
npm run build:win


Output:

dist/minio2c.exe

Why this project?

This tool simplifies MinIO administration for developers by wrapping official mc commands into an interactive CLI.

License

MIT