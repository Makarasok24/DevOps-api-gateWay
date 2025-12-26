# Order Service Integration

## Overview

The API Gateway provides two ways to interact with the Order Service:

1. **Direct Proxy** (`/api/orders`) - Simple pass-through to the order service
2. **Managed Orders** (`/api/orders/managed`) - Orders with inventory validation and coordination

## Endpoints

### 1. Create Order with Inventory Management (Recommended)

**Endpoint:** `POST /api/orders/managed/create`

**Description:** Creates an order with automatic inventory validation and stock reduction.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "New York",
  "zipCode": "10001",
  "items": [
    {
      "productId": "PROD-001",
      "quantity": 1,
      "price": 99.99
    },
    {
      "productId": "PROD-009",
      "quantity": 2,
      "price": 49.99
    }
  ]
}
```

**Success Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "ORD-123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "items": [...],
    "total": 199.97,
    "status": "pending"
  },
  "inventoryUpdated": true,
  "inventoryUpdates": [
    {
      "productId": "PROD-001",
      "previousQuantity": 50,
      "newQuantity": 49,
      "reduced": 1
    },
    {
      "productId": "PROD-009",
      "previousQuantity": 100,
      "newQuantity": 98,
      "reduced": 2
    }
  ],
  "validation": [
    {
      "productId": "PROD-001",
      "name": "Product Name",
      "requestedQuantity": 1,
      "availableStock": 50,
      "price": 99.99,
      "valid": true
    }
  ]
}
```

**Error Response (400):**
```json
{
  "error": "Order validation failed",
  "message": "Order validation failed",
  "errors": [
    {
      "productId": "PROD-001",
      "message": "Insufficient stock. Available: 0, Requested: 1"
    }
  ]
}
```

**Flow:**
1. Validates all items have sufficient stock
2. Checks product existence and prices
3. Creates order in order service
4. Reduces inventory quantities
5. Returns comprehensive result

---

### 2. Validate Order Items

**Endpoint:** `POST /api/orders/managed/validate`

**Description:** Validates order items without creating an order. Useful for cart validation.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "PROD-001",
      "quantity": 1,
      "price": 99.99
    }
  ]
}
```

**Success Response (200):**
```json
{
  "valid": true,
  "items": [
    {
      "productId": "PROD-001",
      "name": "Product Name",
      "requestedQuantity": 1,
      "availableStock": 50,
      "price": 99.99,
      "valid": true
    }
  ],
  "errors": [],
  "timestamp": "2025-12-26T10:30:00.000Z"
}
```

**Use Cases:**
- Shopping cart validation
- Pre-checkout stock verification
- Price consistency checks

---

### 3. Get Order with Product Details

**Endpoint:** `GET /api/orders/managed/:orderId`

**Description:** Retrieves order details enriched with current product information.

**Success Response (200):**
```json
{
  "id": "ORD-123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "items": [
    {
      "productId": "PROD-001",
      "quantity": 1,
      "price": 99.99,
      "productDetails": {
        "id": "PROD-001",
        "name": "Product Name",
        "description": "Product description",
        "currentPrice": 99.99,
        "stock": 49
      }
    }
  ],
  "total": 99.99,
  "status": "pending"
}
```

---

### 4. Cancel Order with Inventory Restore

**Endpoint:** `DELETE /api/orders/managed/:orderId/cancel`

**Description:** Cancels an order and restores inventory quantities.

**Success Response (200):**
```json
{
  "message": "Order cancelled successfully",
  "orderId": "ORD-123",
  "cancelled": true,
  "inventoryRestored": [
    {
      "productId": "PROD-001",
      "restored": 1,
      "newQuantity": 50
    },
    {
      "productId": "PROD-009",
      "restored": 2,
      "newQuantity": 100
    }
  ],
  "timestamp": "2025-12-26T10:30:00.000Z"
}
```

**Flow:**
1. Retrieves order details
2. Restores inventory for each item
3. Deletes the order
4. Returns restoration results

---

### 5. Direct Order Service Proxy

**Endpoint:** `POST /api/orders`

**Description:** Direct pass-through to the order service without inventory coordination.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "New York",
  "zipCode": "10001",
  "items": [
    {
      "productId": "PROD-001",
      "quantity": 1,
      "price": 99.99
    }
  ]
}
```

**Use Case:** When you want to manage inventory separately or the order service handles it internally.

---

## Service Configuration

### Environment Variables

```env
ORDER_SERVICE_URL=http://localhost:4000
PRODUCT_SERVICE_URL=http://wgss0wws0osco4o48soo4kko.34.87.12.222.sslip.io
INVENTORY_SERVICE_URL=https://api.soksothy.me
```

### Service Integration

The order service integrates with:
- **Product Service**: Validates product existence and prices
- **Inventory Service**: Checks stock availability and updates quantities
- **Order Service**: Creates and manages orders

---

## Testing Examples

### Test 1: Create Order with Managed Inventory

```bash
curl -X POST http://localhost:3000/api/orders/managed/create \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Prod Test",
    "email": "prod@test.com",
    "address": "123 St",
    "city": "City",
    "zipCode": "12345",
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 1,
        "price": 99.99
      },
      {
        "productId": "PROD-009",
        "quantity": 2,
        "price": 99.99
      }
    ]
  }'
```

### Test 2: Validate Items Before Ordering

```bash
curl -X POST http://localhost:3000/api/orders/managed/validate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 1,
        "price": 99.99
      }
    ]
  }'
```

### Test 3: Get Order Details

```bash
curl http://localhost:3000/api/orders/managed/ORD-123
```

### Test 4: Cancel Order

```bash
curl -X DELETE http://localhost:3000/api/orders/managed/ORD-123/cancel
```

### Test 5: Direct Order Creation (No Inventory Coordination)

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Prod Test",
    "email": "prod@test.com",
    "address": "123 St",
    "city": "City",
    "zipCode": "12345",
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 1,
        "price": 99.99
      }
    ]
  }'
```

---

## Error Handling

### Common Error Scenarios

1. **Insufficient Stock (400)**
   - Product doesn't have enough inventory
   - Returns which products have insufficient stock

2. **Product Not Found (400/404)**
   - ProductId doesn't exist in product service
   - Returns validation errors for invalid products

3. **Inventory Service Unavailable (503)**
   - Cannot reach inventory service
   - Order creation will fail

4. **Order Service Unavailable (503)**
   - Cannot reach order service
   - Returns service unavailable error

5. **Partial Failure (500)**
   - Order created but inventory update failed
   - Requires manual intervention
   - Returns warning with created order details

---

## Architecture

```
Client Request
     │
     ├──► POST /api/orders/managed/create
     │    
     ├──► Order Routes (routes/order.js)
     │    • Validate request format
     │    • Required fields check
     │    
     ├──► Order Service (services/orderService.js)
     │    
     │    Step 1: Validate Items
     │    ├─── Check Product Service (existence, price)
     │    └─── Check Inventory Service (stock availability)
     │    
     │    Step 2: Create Order
     │    └─── POST to Order Service
     │    
     │    Step 3: Update Inventory
     │    └─── Reduce stock in Inventory Service
     │    
     └──► Return Complete Result
          • Order details
          • Inventory updates
          • Validation results
```

---

## Best Practices

1. **Use Managed Endpoints** for e-commerce flows requiring inventory control
2. **Validate First** using `/validate` endpoint before showing checkout
3. **Handle Partial Failures** - Order may be created even if inventory update fails
4. **Monitor Inventory** - Implement alerts for inventory sync failures
5. **Idempotency** - Consider adding order ID generation for retry safety
6. **Transaction Logging** - All operations are logged for audit trail

---

## Future Enhancements

- [ ] Add order status updates with inventory adjustments
- [ ] Implement compensation transactions for failed inventory updates
- [ ] Add payment integration hooks
- [ ] Support for order modifications (add/remove items)
- [ ] Batch order processing
- [ ] Real-time inventory reservation during checkout
- [ ] Order history with product snapshots
