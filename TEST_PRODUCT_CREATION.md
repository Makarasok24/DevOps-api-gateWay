# Product Creation with Inventory Sync - Testing Guide

## Implementation Complete ✅

The API Gateway now automatically creates inventory items when products are created!

## How It Works

1. **Client creates product** → POST `/api/stock/products`
2. **Gateway creates product** in Product Service
3. **Gateway extracts product ID** from response (id, sku, or product_id)
4. **Gateway creates inventory** in Inventory Service with:
   - `product_id` = extracted product ID
   - `quantity` = product.stock
   - `warehouse_location` = WH-A1 (default)
5. **If inventory fails** → Gateway automatically deletes product (rollback)

## Test Commands

### 1. Create Product with Inventory Sync

```bash
curl -X POST http://localhost:3000/api/stock/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coca Cola",
    "sku": "COCA-001",
    "description": "Soft drink",
    "price": 1.50,
    "stock": 100,
    "warehouse_location": "WH-A1"
  }'
```

**Expected Response:**
```json
{
  "message": "Product and inventory created successfully",
  "success": true,
  "product": {
    "id": 3,
    "name": "Coca Cola",
    "sku": "COCA-001",
    "description": "Soft drink",
    "price": 1.50,
    "stock": 100,
    "created_at": "2025-12-26T10:00:00.000000Z"
  },
  "inventory": {
    "product_id": "3",
    "quantity": 100,
    "warehouse_location": "WH-A1",
    "created_at": "2025-12-26T10:00:00.000000"
  }
}
```

### 2. Create Another Product

```bash
curl -X POST http://localhost:3000/api/stock/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pepsi",
    "sku": "PEPSI-001",
    "description": "Cola drink",
    "price": 1.45,
    "stock": 150
  }'
```

Note: `warehouse_location` defaults to "WH-A1" if not provided.

### 3. Add Stock to Existing Product

```bash
curl -X POST http://localhost:3000/api/stock/3/add \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50}'
```

This will:
- Add 50 units to inventory (quantity: 100 → 150)
- Update product stock field (stock: 100 → 150)

### 4. Remove Stock

```bash
curl -X POST http://localhost:3000/api/stock/3/remove \
  -H "Content-Type: application/json" \
  -d '{"quantity": 20}'
```

### 5. Sync All Products (Bulk)

```bash
curl -X POST http://localhost:3000/api/stock/sync-all
```

This will sync all inventory items to product service.

## Rebuild and Test

```bash
# Rebuild Docker container
docker-compose down
docker-compose up -d --build

# Check logs
docker logs -f api-gateway

# Test product creation
curl -X POST http://localhost:3000/api/stock/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "price": 9.99,
    "stock": 50
  }'
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stock/products` | Create product with inventory sync |
| POST | `/api/stock/:id/add` | Add stock |
| POST | `/api/stock/:id/remove` | Remove stock |
| GET | `/api/stock/:id` | Get stock level |
| POST | `/api/stock/:id/sync` | Sync single product |
| POST | `/api/stock/sync-all` | Sync all products |
| GET | `/api/stock/lowStock` | Get low stock items |

## Key Features

✅ **Automatic Inventory Creation**: Every product gets an inventory record  
✅ **Default Warehouse**: Uses "WH-A1" if not specified  
✅ **Rollback Protection**: Deletes product if inventory creation fails  
✅ **ID Mapping**: Handles id/sku/product_id variations  
✅ **Stock Synchronization**: Keeps product.stock and inventory.quantity in sync  

## Troubleshooting

**If product is created but inventory fails:**
- Check inventory service logs
- Gateway will automatically delete the product (rollback)
- Manual cleanup not needed

**If you see "Manual cleanup required":**
- Rollback failed - product exists without inventory
- Manually delete product or create inventory item

**Check environment variables:**
```bash
docker exec api-gateway env | grep SERVICE_URL
```

Should show:
- PRODUCT_SERVICE_URL=http://z4s008kc8kosc4sowoggsckc.34.87.12.222.sslip.io
- INVENTORY_SERVICE_URL=https://api.soksothy.me
