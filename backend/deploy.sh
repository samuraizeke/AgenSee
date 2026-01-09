#!/bin/bash
set -e

# Configuration
PROJECT_ID="agensee-app"
SERVICE_NAME="agensee-backend"
REGION="us-east5"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying AgenSee MS Backend to Cloud Run...${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo -e "${GREEN}Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs (if not already enabled)
echo -e "${GREEN}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com --quiet

# Build and deploy to Cloud Run
echo -e "${GREEN}Building and deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars="NODE_ENV=production"

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Set your environment variables:${NC}"
echo "gcloud run services update $SERVICE_NAME --region $REGION \\"
echo "  --set-env-vars=\"SUPABASE_URL=your-supabase-url\" \\"
echo "  --set-env-vars=\"SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\" \\"
echo "  --set-env-vars=\"CORS_ORIGIN=https://your-vercel-app.vercel.app\""
echo ""
echo -e "${YELLOW}Get your service URL:${NC}"
echo "gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'"
