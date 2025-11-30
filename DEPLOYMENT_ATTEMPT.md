# Deployment Attempt Notes

This file documents the manual deployment attempts performed during Sprint 1 and the current status.

Date: November 30, 2025

## Goal
Attempt to deploy the Password Health Tracker application to Google Cloud (Cloud Run / GCR) as a manual proof-of-concept.

## What was done
1. Prepared Docker images locally for the backend and frontend using `docker-compose build` and `docker-compose up --build`.
2. Verified the app works locally:
   - Frontend: http://localhost:3001
   - Backend: http://localhost:5001
   - MongoDB: localhost:27017
3. Created Kubernetes manifests under `deployment/k8s-deployment.yaml` and Terraform scaffolding under `deployment/terraform.tf`.
4. Created a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) to build and (optionally) push images to Google Container Registry (GCR) and deploy to Cloud Run.

## What worked
- Local Docker images build and run successfully using the provided Dockerfiles and `docker-compose.yml`.
- GitHub repository pushes trigger CI (scaffolded) and builds images.

## Partial / Broken steps
- Cloud deploy was not fully automated during Sprint 1; the CI pipeline is scaffolded but real secrets (GCP credentials, service account keys) were not added to GitHub Secrets.
- Manual deployment requires:
  - A GCP project and service account with `roles/run.admin`, `roles/storage.admin`, and `roles/iam.serviceAccountUser`.
  - `gcloud` configured locally and service account JSON available or proper CI secrets.
- The Terraform scripts are scaffolding; they require user-specific variables in `terraform.tfvars` and a configured GCP backend to fully provision resources.

## Next steps to complete deployment
1. Create a GCP project (or use an existing one).
2. Create a service account and grant appropriate roles.
3. Add service account JSON to GitHub Secrets (`GCP_SA_KEY`) and set up other secrets (e.g., `OPENAI_API_KEY`, `HIBP_API_KEY`, `JWT_SECRET_KEY`).
4. Update GitHub Actions workflow to use `GCP_SA_KEY` and run the build/push/deploy steps.
5. Configure Cloud Run services (backend and frontend) with environment variables and connect to a managed MongoDB (Atlas) or Cloud-hosted MongoDB instance.
6. Optionally, create a Cloud SQL (if using SQL), HTTPS certificates, DNS records, and load balancing if serving via a custom domain.

## Known caveats
- The current setup stores secrets in `.env` for local dev — do not commit production secrets.
- MongoDB running locally is fine for dev; production should use a managed DB with secure networking.
- Rate limiting and WAF should be added before public deployment.

## Helpful commands (manual deploy)

Build and push backend image locally to GCR (example):

```bash
# Authenticate gcloud
gcloud auth activate-service-account --key-file=path/to/service-account.json
gcloud config set project YOUR_GCP_PROJECT_ID

# Build and push (example)
docker build -t gcr.io/YOUR_GCP_PROJECT_ID/password-health-backend:latest -f Dockerfile.backend .
docker push gcr.io/YOUR_GCP_PROJECT_ID/password-health-backend:latest

# Deploy to Cloud Run
gcloud run deploy password-health-backend \
  --image gcr.io/YOUR_GCP_PROJECT_ID/password-health-backend:latest \
  --region us-central1 --platform managed --allow-unauthenticated \
  --set-env-vars JWT_SECRET_KEY=your-secret,OPENAI_API_KEY=...
```

Repeat similar steps for frontend (or serve static frontend via Cloud Storage + Cloud CDN).

## Status
- Local: ✅ working
- CI: ✅ scaffolded (needs secrets)
- Cloud Run: ❌ not yet deployed (manual steps and secrets required)

