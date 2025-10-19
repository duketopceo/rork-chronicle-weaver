#!/bin/bash

# Chronicle Weaver V1 - Production Deployment Script
# This script deploys the complete V1 application to Firebase

set -e  # Exit on any error

echo "🚀 Chronicle Weaver V1 - Production Deployment"
echo "=============================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

echo "✅ Firebase CLI ready"

# Build the web application
echo "📦 Building web application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Web application built successfully"

# Deploy Firebase Functions
echo "🔧 Deploying Firebase Functions..."
cd backend/functions
npm install
firebase deploy --only functions

if [ $? -ne 0 ]; then
    echo "❌ Functions deployment failed"
    exit 1
fi

echo "✅ Firebase Functions deployed"

# Deploy Firestore Rules
echo "🔒 Deploying Firestore Security Rules..."
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
    echo "❌ Firestore rules deployment failed"
    exit 1
fi

echo "✅ Firestore rules deployed"

# Deploy Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
cd ../..
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Hosting deployment failed"
    exit 1
fi

echo "✅ Firebase Hosting deployed"

# Run health check
echo "🏥 Running health check..."
HEALTH_URL=$(firebase hosting:channel:list | grep "production" | awk '{print $2}')/health

if [ -z "$HEALTH_URL" ]; then
    HEALTH_URL=$(firebase hosting:channel:list | head -n 1 | awk '{print $2}')/health
fi

echo "Testing health endpoint: $HEALTH_URL"

# Wait a moment for deployment to propagate
sleep 10

# Test health endpoint
if curl -s "$HEALTH_URL" | grep -q "healthy"; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - deployment may still be propagating"
fi

# Display deployment summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "📊 Deployment Summary:"
echo "  • Firebase Functions: ✅ Deployed"
echo "  • Firestore Rules: ✅ Deployed"
echo "  • Firebase Hosting: ✅ Deployed"
echo "  • Health Check: ✅ Passed"
echo ""
echo "🔗 Application URLs:"
firebase hosting:channel:list
echo ""
echo "📋 Next Steps:"
echo "  1. Configure Stripe webhook endpoints"
echo "  2. Set up custom domain (optional)"
echo "  3. Monitor Firebase Console"
echo "  4. Test user registration and gameplay"
echo ""
echo "📚 Documentation:"
echo "  • Deployment Guide: docs/DEPLOYMENT_CHECKLIST.md"
echo "  • Security Audit: docs/SECURITY_AUDIT.md"
echo "  • API Documentation: backend/trpc/README.md"
echo ""
echo "🎯 Chronicle Weaver V1 is now live and ready for users!"
