# Recruit Connect - Bolna AI Voice Calling Demo

A demo recruiting application showcasing **Bolna AI voice calling integration** for automated candidate outreach.

## Features

- **Bolna AI Voice Calls**: Automated voice calls to candidates using AI agents
- **Candidate Management**: Add, view, and manage candidate information
- **Call Testing**: Direct API testing interface for Bolna integration
- **Mock Backend**: In-memory data storage for demonstration purposes

## Quick Start

### Prerequisites
- Node.js & npm installed

### Setup

1. **Clone and install dependencies**:
```sh
git clone <YOUR_GIT_URL>
cd recruit-connect
npm i
```

2. **Setup backend**:
```sh
cd backend
npm i
```

3. **Configure Bolna API**:
   - Get your API key from [Bolna.ai](https://www.bolna.ai)
   - Update `backend/.env` with your Bolna API key:
```
PORT=3001
BOLNA_API_KEY=your-bolna-api-key-here
```

4. **Start the application**:
```sh
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start frontend  
npm run dev
```

## Usage

1. **Test Bolna API**: Visit http://localhost:8080/test-call
   - Enter phone number in E.164 format (e.g., +918090990117)
   - Enter your Bolna agent ID
   - Click "Make Call" to test voice calling

2. **Manage Candidates**: Visit http://localhost:8080/candidates-new
   - Add candidate information
   - Make calls directly from candidate profiles

## Bolna API Integration

This demo follows the official [Bolna API documentation](https://www.bolna.ai/docs/api-reference/):

- **Endpoint**: `https://api.bolna.ai/call`
- **Authentication**: Bearer token with API key
- **Phone Format**: E.164 international format required
- **Payload**: `agent_id`, `recipient_phone_number`, optional `user_data`

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn-ui
- **Backend**: Node.js, Express
- **AI Voice**: Bolna AI API
- **Demo Data**: In-memory storage (no database required)

## Demo Limitations

- Uses mock data (no persistent database)
- Simplified authentication for testing
- Designed for demonstration purposes only

---

**Note**: This is a demonstration project showcasing Bolna AI voice calling capabilities in a recruiting context.