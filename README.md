# bakeMAnia Web Application

This is a full-stack web application built with Node.js (backend) and React + Vite (frontend). The application uses JSON files for data storage instead of a traditional database.

## Project Structure

- `/bakemania-spa` - Frontend React application
- `/server` - Backend Node.js application
- `/db` - JSON files for data storage
- `/.github/workflows` - GitHub Actions configuration for CI/CD

## Local Development Setup

### Prerequisites

- Node.js (latest LTS version)
- npm (comes with Node.js)
- Docker (for production-like environment)
- Check local IP: run `npm run dev`, then terminate process. Local IP is logged to terminal (ex. 192.168.183.252). Copy the IP to clipboard.

### Backend Setup

0. Create local certifiactes: (This step is probably no longer necessary). To check local IP, just run `npm run dev` in frontend directory. Local IP will be logged to terminal. Terminate frontend process and copy IP to clipboard (ex. 192.168.183.252). Now you can create local certs:
```bash
mkcert -key-file key.pem -cert-file cert.pem localhost {your IP}
```

1. Install dependencies:
```bash
npm install
```

2. Start TypeScript compiler in watch mode (in a separate terminal):
```bash
npm run dev-watch
```

3. Start the backend server with nodemon (in another terminal):
```bash
npm run dev-run
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd bakemania-spa
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `https://{your-local-ip}:3000` and will automatically proxy API requests to the backend at `https://{your-local-ip}:4040`.

## Production Deployment

The application is deployed on OVH servers using Docker containers. There are two environments:

### Staging Environment

- Deployed automatically when changes are merged to the `develop` branch
- Accessible at port 3001
- Uses the `staging-bakemania-app` Docker image

To manually deploy to staging: (through ssh)
```bash
make build-staging
make start-staging
```

### Production Environment

- Deployed automatically when changes are merged to the `master` branch
- Accessible at port 3000
- Uses the `bakemania-app` Docker image

To manually deploy to production: (through ssh)
```bash
make build
make start
```

## Docker Commands

### View Logs
```bash
# Production
make see-logs

# Staging
make see-logs-staging

# Local
make see-logs-local
```

### Access Container Shell
```bash
# Production
make get-in

# Staging
make get-in-staging

# Local
make get-in-local
```

## Database Management

The application uses JSON files stored in the `/db` directory instead of a traditional database. To reset the database to its initial state:

```bash
npm run reset-db
```

To create an admin user:
```bash
npm run create-admin
```

## Development Workflow

1. Create a new branch from `develop`
2. Make your changes
3. Create a pull request to `develop` for staging deployment
4. After testing in staging, create a pull request from `develop` to `master` for production deployment

## Environment Variables

The application uses environment variables for configuration. Make sure to create a `.env` file in the root directory with the necessary variables.

1. Backend envs:
JWT_SECRET= string
PORT= string|number
KEY_PATH= string, path to local certs. Default shoudl be: ./key.pem (this path is used for command earlier in this guide)
CERT_PATH= string, path to local certs. Default shoudl be: ./cert.pem (this path is used for command earlier in this guide)
CAPTCHA_SECRET_KEY= string, for local development use dummy key: 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
EMAIL_USER= google email address for email services
EMAIL_APP_PASSWORD= string, created for google email
DOMAIN= string, use localhost for local development
EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME= should use: 10m
AUTH_TOKEN_EXPIRATION_TIME= should use: 365d

2. Frontend envs (defaults for local development)
VITE_CAPTCHA_SECRET_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
VITE_APP_RUNTIME=development

## Troubleshooting

If you encounter any issues:

1. Check the logs using the appropriate `make see-logs` command
2. Ensure all environment variables are properly set
3. Verify that all required ports are available
4. Check if Docker containers are running properly