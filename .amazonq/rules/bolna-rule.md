# Bolna API Implementation Rule

## MANDATORY RULE FOR BOLNA API IMPLEMENTATION

**Every time I implement or modify Bolna API calls, I MUST:**

1. **Reference Official Documentation**: Always check https://www.bolna.ai/docs/api-reference/ for the correct:
   - API endpoints
   - Request payload structure
   - Required headers
   - Response format
   - Error codes

2. **Verify API Structure**: Before writing code, confirm:
   - Base URL: `https://api.bolna.ai` (NOT .dev)
   - Endpoint paths (e.g., `/call`, `/agents`, etc.)
   - Required vs optional parameters
   - Authentication format: `Bearer <token>`

3. **Use Exact Payload Format**: Match the documentation exactly:
   ```json
   {
     "agent_id": "string",
     "recipient_phone_number": "string", 
     "from_phone_number": "string (optional)",
     "user_data": "object (optional)"
   }
   ```

4. **Handle Errors Properly**: Check documentation for:
   - HTTP status codes
   - Error response format
   - Common error scenarios

5. **Test with Simple Implementation First**: Always create a minimal test before complex integration.

**NEVER assume API structure - ALWAYS verify with official docs first.**