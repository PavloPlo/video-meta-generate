#!/bin/bash

# Local development setup script

set -e

echo "🚀 Setting up local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local file..."
  cat > .env.local << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"
EOF
  echo "✅ Created .env.local"
else
  echo "✅ .env.local already exists"
fi

# Start Docker Compose
echo "🐳 Starting PostgreSQL database..."
docker compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 3

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run db:generate

# Run migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

echo ""
echo "✅ Setup complete! You can now run:"
echo "   npm run dev"
echo ""
echo "📊 To view the database:"
echo "   npm run db:studio"
echo ""
echo "🛑 To stop the database:"
echo "   docker compose down"

