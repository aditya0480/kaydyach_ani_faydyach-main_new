# Load Testing with k6

This directory contains load test scripts for the application using [k6](https://k6.io/).

## Prerequisites

You need to have `k6` installed on your machine.

**MacOS:**
```bash
brew install k6
```

**Windows:**
```powershell
winget install k6
```

## Running Tests

### Homepage Soak Test
Simulates 20 concurrent users accessing the homepage.
```bash
k6 run load-tests/homepage.js
```

### Order Flow Test
Testing the order creation API.
**Note:** Ensure your local server is running on `http://localhost:2222`.
```bash
k6 run load-tests/order-flow.js
```
