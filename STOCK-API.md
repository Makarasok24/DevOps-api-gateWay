# Stock Management API

## Endpoints

### 1. Add Stock
**Endpoint:** `POST /api/stock/:productId/add`

**Description:** Add stock to inventory and sync with product service

**Request:**
```bash
POST {{gatewayURL}}/api/stock/LAPTOP001/add
Content-Type: application/json

{
  "quantity": 30
}
```

**Response:**
```json
{
  "message": "Stock added successfully",
  "success": true,
  "product_id": "LAPTOP001",
  "quantity_added": 30,
  "inventory": {
    "product_id": "LAPTOP001",
    "new_stock": 130
  },
  "product": {
    "id": "LAPTOP001",
    "name": "Gaming Laptop",
    "stock": 130
  }
}
```

### 2. Remove Stock
**Endpoint:** `POST /api/stock/:productId/remove`

**Description:** Remove stock from inventory and sync with product service

**Request:**
```bash
POST {{gatewayURL}}/api/stock/LAPTOP001/remove
Content-Type: application/json

{
  "quantity": 10
}
```

**Response:**
```json
{
  "message": "Stock removed successfully",
  "success": true,
  "product_id": "LAPTOP001",
  "quantity_removed": 10,
  "inventory": {
    "product_id": "LAPTOP001",
    "new_stock": 120
  },
  "product": {
    "id": "LAPTOP001",
    "name": "Gaming Laptop",
    "stock": 120
  }
}
```

### 3. Get Stock Level
**Endpoint:** `GET /api/stock/:productId`

**Description:** Get current stock level from inventory service

**Request:**
```bash
GET {{gatewayURL}}/api/stock/LAPTOP001
```

**Response:**
```json
{
  "product_id": "LAPTOP001",
  "quantity": 120,
  "warehouse": "Main Warehouse"
}
```

### 4. Sync Stock
**Endpoint:** `POST /api/stock/:productId/sync`

**Description:** Synchronize stock between inventory and product services

**Request:**
```bash
POST {{gatewayURL}}/api/stock/LAPTOP001/sync
```

**Response:**
```json
{
  "message": "Stock synchronized successfully",
  "success": true,
  "product_id": "LAPTOP001",
  "stock": 120
}
```

## How It Works

### Flow Diagram
```
Client Request
     ↓
API Gateway (/api/stock/:productId/add)
     ↓
Stock Service (Gateway)
     ├→ 1. Call Inventory Service → Add stock
     │   └→ POST /inventory/:productId/add
     │
     └→ 2. Call Product Service → Update stock
         └→ PATCH /api/v1/products/:productId
              Body: { stock: new_stock_value }
```

### Example with Real Product ID

Using your product ID from the response: `1229df1d-8d87-46ea-b595-631290f7e9ed`

**Add 50 Coca Cola:**
```bash
POST http://your-gateway.railway.app/api/stock/1229df1d-8d87-46ea-b595-631290f7e9ed/add
Content-Type: application/json

{
  "quantity": 50
}
```

**Remove 10 Coca Cola:**
```bash
POST http://your-gateway.railway.app/api/stock/1229df1d-8d87-46ea-b595-631290f7e9ed/remove
Content-Type: application/json

{
  "quantity": 10
}
```

**Check Coca Cola stock:**
```bash
GET http://your-gateway.railway.app/api/stock/1229df1d-8d87-46ea-b595-631290f7e9ed
```

## Environment Variables

Make sure these are set:
```env
PRODUCT_SERVICE_URL=http://wgss0wws0osco4o48soo4kko.34.87.12.222.sslip.io
INVENTORY_SERVICE_URL=http://your-inventory-service-url.com
```

## Error Handling

**Invalid Quantity:**
```json
{
  "error": "Invalid quantity",
  "message": "Quantity must be a positive number"
}
```

**Service Unavailable:**
```json
{
  "error": "Failed to add stock",
  "message": "Inventory service unavailable",
  "timestamp": "2025-12-25T10:00:00.000Z"
}
```

## Testing

```bash
# Test locally
npm run dev

# Add stock
curl -X POST http://localhost:3000/api/stock/1229df1d-8d87-46ea-b595-631290f7e9ed/add \
  -H "Content-Type: application/json" \
  -d '{"quantity": 30}'

# Remove stock
curl -X POST http://localhost:3000/api/stock/1229df1d-8d87-46ea-b595-631290f7e9ed/remove \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10}'

# Get stock
curl http://localhost:3000/api/stock/1229df1d-8d87-46ea-b595-631290f7e9ed

# Sync stock
curl -X POST http://localhost:3000/api/stock/1229df1d-8d87-46ea-b595-631290f7e9ed/sync
```
