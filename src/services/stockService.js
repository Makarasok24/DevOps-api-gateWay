const axios = require('axios');

// Service URLs
const SERVICES = {
  products: process.env.PRODUCT_SERVICE_URL || 'http://wgss0wws0osco4o48soo4kko.34.87.12.222.sslip.io',
  inventory: process.env.INVENTORY_SERVICE_URL || 'https://api.soksothy.me'
};

console.log('📦 Stock Service initialized with:', JSON.stringify(SERVICES, null, 2));

/**
 * Resolve product ID between services
 * Both services will use the same ID (product numeric ID as string)
 */
async function resolveProductId(productId) {
  // Just convert to string and return
  return String(productId);
}

/**
 * Get product details from product service
 */
async function getProduct(productId) {
  try {
    const response = await axios.get(
      `${SERVICES.products}/api/products/${productId}`,
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    console.error(`[Stock Error] Failed to get product ${productId}:`, error.message);
    throw error;
  }
}

/**
 * Update product stock in product service
 */
async function updateProductStock(productId, newStock) {
  try {
    const response = await axios.patch(
      `${SERVICES.products}/api/products/${productId}`,
      { stock: newStock },
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    console.error(`[Stock Error] Failed to update product ${productId}:`, error.message);
    throw error;
  }
}

/**
 * Create inventory item in inventory service
 */
async function createInventoryItem(productId, quantity, warehouseLocation = 'WH-A1') {
  try {
    const payload = {
      product_id: productId,
      quantity: quantity || 0,
      warehouse_location: warehouseLocation
    };
    
    console.log(`[Stock] Creating inventory item:`, payload);
    
    const response = await axios.post(
      `${SERVICES.inventory}/api/v1/inventory/items`,
      payload,
      { timeout: 30000 }
    );
    
    console.log(`[Stock] Inventory item created for product ${productId}`);
    return response.data;
  } catch (error) {
    console.error(`[Stock Error] Failed to create inventory item:`, error.message);
    throw error;
  }
}

/**
 * Create product with automatic inventory sync
 */
async function createProductWithInventory(productData, warehouseLocation = 'WH-A1') {
  let productCreated = null;
  
  try {
    console.log(`[Stock] Creating product with inventory sync`);
    
    // 1. Create product in product service
    const productResponse = await axios.post(
      `${SERVICES.products}/api/products`,
      productData,
      { timeout: 30000 }
    );
    
    productCreated = productResponse?.data;
    console.log(`[Stock] Product created:`, productCreated);
    
    // Use product numeric ID for inventory (as string)
    const productId = productCreated?.id;
    
    if (!productId) {
      throw new Error('Product created but no ID found in response');
    }
    
    console.log(`[Stock] Using product ID "${productId}" for inventory creation`);
    
    // 2. Create corresponding inventory item using product ID
    try {
      const inventoryResponse = await createInventoryItem(
        String(productId),  // Convert to string for inventory
        productData.stock || 0,
        warehouseLocation
      );
      
      console.log(`[Stock] Product and inventory created successfully for ID ${productId}`);
      
      return {
        success: true,
        product: productCreated,
        inventory: inventoryResponse
      };
    } catch (inventoryError) {
      console.error(`[Stock Error] Inventory creation failed, rolling back product:`, inventoryError.message);
      
      // Rollback: delete the created product
      try {
        await axios.delete(
          `${SERVICES.products}/api/products/${productId}`,
          { timeout: 30000 }
        );
        console.log(`[Stock] Rollback successful: Product ${productId} deleted`);
      } catch (rollbackError) {
        console.error(`[Stock Error] Rollback failed:`, rollbackError.message);
        // Product exists but inventory doesn't - manual cleanup needed
        throw new Error(
          `Product created but inventory sync failed. Manual cleanup required for product ${productId}. ` +
          `Original error: ${inventoryError.message}`
        );
      }
      
      throw new Error(`Failed to create inventory: ${inventoryError.message}`);
    }
  } catch (error) {
    console.error(`[Stock Error] Failed to create product with inventory:`, error.message);
    throw error;
  }
}

/**
 * Add stock to inventory and update product service
 */
async function addStock(productId, quantity) {
  let inventoryUpdated = false;
  let previousQuantity = null;
  
  try {
    const resolvedId = await resolveProductId(productId);
    const url = `${SERVICES.inventory}/api/v1/inventory/items/${resolvedId}/adjust`;
    const payload = { quantity, reason: 'Stock added via API Gateway' };
    
    console.log(`[Stock] Adding ${quantity} units to product ${resolvedId}`);
    console.log(`[Stock] URL: ${url}`);
    console.log(`[Stock] Payload:`, JSON.stringify(payload));
    
    // Get current inventory quantity for rollback
    try {
      const currentInventory = await getStock(resolvedId);
      previousQuantity = currentInventory.quantity;
    } catch (err) {
      console.warn(`[Stock] Could not get previous quantity for rollback:`, err.message);
    }
    
    // 1. Add to inventory service (source of truth)
    const inventoryResponse = await axios.post(url, payload, { timeout: 30000 });
    inventoryUpdated = true;
    
    const newQuantity = inventoryResponse.data?.quantity || inventoryResponse.data?.new_quantity;
    if (!newQuantity && newQuantity !== 0) {
      throw new Error('Invalid inventory response: missing quantity field');
    }
    
    console.log(`[Stock] Inventory updated. New quantity: ${newQuantity}`);
    
    // 2. Update product service stock (denormalized cache)
    try {
      const productResponse = await updateProductStock(resolvedId, newQuantity);
      
      console.log(`[Stock] Successfully added stock for product ${resolvedId}`);
      
      return {
        success: true,
        product_id: resolvedId,
        quantity_added: quantity,
        new_quantity: newQuantity,
        inventory: inventoryResponse.data,
        product: productResponse
      };
    } catch (productError) {
      console.error(`[Stock Error] Product update failed, rolling back inventory:`, productError.message);
      
      // Rollback: revert inventory to previous quantity
      if (previousQuantity !== null) {
        try {
          await axios.post(url, {
            quantity: previousQuantity - newQuantity,
            reason: 'Rollback: Product service update failed'
          }, { timeout: 30000 });
          console.log(`[Stock] Rollback successful. Reverted to quantity: ${previousQuantity}`);
        } catch (rollbackError) {
          console.error(`[Stock Error] Rollback failed:`, rollbackError.message);
        }
      }
      
      throw new Error(`Failed to update product service: ${productError.message}`);
    }
  } catch (error) {
    console.error(`[Stock Error] Failed to add stock:`, error.message);
    throw error;
  }
}

/**
 * Remove stock from inventory and update product service
 */
async function removeStock(productId, quantity) {
  let inventoryUpdated = false;
  let previousQuantity = null;
  
  try {
    const resolvedId = await resolveProductId(productId);
    console.log(`[Stock] Removing ${quantity} units from product ${resolvedId}`);
    
    // Get current inventory quantity for rollback
    try {
      const currentInventory = await getStock(resolvedId);
      previousQuantity = currentInventory.quantity;
    } catch (err) {
      console.warn(`[Stock] Could not get previous quantity for rollback:`, err.message);
    }
    
    // 1. Remove from inventory service (use adjust with negative quantity)
    const inventoryResponse = await axios.post(
      `${SERVICES.inventory}/api/v1/inventory/items/${resolvedId}/adjust`,
      { quantity: -quantity, reason: 'Stock removed via API Gateway' },
      { timeout: 30000 }
    );
    inventoryUpdated = true;
    
    const newQuantity = inventoryResponse.data?.quantity || inventoryResponse.data?.new_quantity;
    if (!newQuantity && newQuantity !== 0) {
      throw new Error('Invalid inventory response: missing quantity field');
    }
    
    console.log(`[Stock] Inventory updated. New quantity: ${newQuantity}`);
    
    // 2. Update product service stock
    try {
      const productResponse = await updateProductStock(resolvedId, newQuantity);
      
      console.log(`[Stock] Successfully removed stock for product ${resolvedId}`);
      
      return {
        success: true,
        product_id: resolvedId,
        quantity_removed: quantity,
        new_quantity: newQuantity,
        inventory: inventoryResponse.data,
        product: productResponse
      };
    } catch (productError) {
      console.error(`[Stock Error] Product update failed, rolling back inventory:`, productError.message);
      
      // Rollback: revert inventory to previous quantity
      if (previousQuantity !== null) {
        try {
          const url = `${SERVICES.inventory}/api/v1/inventory/items/${resolvedId}/adjust`;
          await axios.post(url, {
            quantity: previousQuantity - newQuantity,
            reason: 'Rollback: Product service update failed'
          }, { timeout: 30000 });
          console.log(`[Stock] Rollback successful. Reverted to quantity: ${previousQuantity}`);
        } catch (rollbackError) {
          console.error(`[Stock Error] Rollback failed:`, rollbackError.message);
        }
      }
      
      throw new Error(`Failed to update product service: ${productError.message}`);
    }
  } catch (error) {
    console.error(`[Stock Error] Failed to remove stock:`, error.message);
    throw error;
  }
}

/**
 * Get stock level from inventory service
 */
async function getStock(productId) {
  try {
    const resolvedId = await resolveProductId(productId);
    const response = await axios.get(
      `${SERVICES.inventory}/api/v1/inventory/items/${resolvedId}`,
      { timeout: 30000 }
    );
    
    return response.data;
  } catch (error) {
    console.error(`[Stock Error] Failed to get stock:`, error.message);
    throw error;
  }
}

async function getLowStock() {
  try {
    const response = await axios.get(
      `${SERVICES.inventory}/api/v1/inventory/items/low-stock`,
      { timeout: 30000 }
    );
    
    return response.data;
  } catch (error) {
    console.error(`[Stock Error] Failed to get stock:`, error.message);
    throw error;
  }
}
/**
 * Sync stock between inventory and product services
 */
async function syncStock(productId) {
  try {
    const resolvedId = await resolveProductId(productId);
    console.log(`[Stock] Syncing stock for product ${resolvedId}`);
    
    // Get current stock from inventory (source of truth)
    const inventoryStock = await getStock(resolvedId);
    const quantity = inventoryStock.quantity || inventoryStock.stock;
    
    if (quantity === undefined) {
      throw new Error('Invalid inventory response: missing quantity field');
    }
    
    // Update product service
    await updateProductStock(resolvedId, quantity);
    
    console.log(`[Stock] Stock synced for product ${resolvedId}: ${quantity}`);
    
    return {
      success: true,
      product_id: resolvedId,
      stock: quantity
    };
  } catch (error) {
    console.error(`[Stock Error] Failed to sync stock:`, error.message);
    throw error;
  }
}

/**
 * Sync all products from inventory to product service
 */
async function syncAllProducts() {
  const results = {
    synced: 0,
    failed: 0,
    errors: [],
    details: []
  };
  
  try {
    console.log('[Stock] Starting bulk sync from inventory to product service');
    
    // Fetch all inventory items (handle pagination)
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      try {
        const response = await axios.get(
          `${SERVICES.inventory}/api/v1/inventory/items?page=${currentPage}&per_page=50`,
          { timeout: 30000 }
        );
        
        const inventoryData = response.data;
        const items = inventoryData.data || [];
        
        console.log(`[Stock] Processing page ${currentPage}: ${items.length} items`);
        
        // Sync each inventory item to product service
        for (const item of items) {
          const productId = item.product_id;
          const quantity = item.quantity;
          
          try {
            await updateProductStock(productId, quantity);
            results.synced++;
            results.details.push({
              product_id: productId,
              quantity,
              status: 'success'
            });
            console.log(`[Stock] Synced ${productId}: ${quantity}`);
          } catch (error) {
            results.failed++;
            results.errors.push({
              product_id: productId,
              error: error.message
            });
            results.details.push({
              product_id: productId,
              quantity,
              status: 'failed',
              error: error.message
            });
            console.error(`[Stock] Failed to sync ${productId}:`, error.message);
          }
        }
        
        // Check if there are more pages
        hasMorePages = inventoryData.current_page < inventoryData.last_page;
        currentPage++;
        
      } catch (pageError) {
        console.error(`[Stock] Failed to fetch inventory page ${currentPage}:`, pageError.message);
        hasMorePages = false;
      }
    }
    
    console.log(`[Stock] Bulk sync completed: ${results.synced} synced, ${results.failed} failed`);
    
    return results;
  } catch (error) {
    console.error('[Stock Error] Bulk sync failed:', error.message);
    throw error;
  }
}

module.exports = {
  addStock,
  removeStock,
  getStock,
  syncStock,
  syncAllProducts,
  getLowStock,
  getProduct,
  updateProductStock,
  createProductWithInventory,
  createInventoryItem
};
