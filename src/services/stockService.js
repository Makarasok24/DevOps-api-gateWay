const axios = require('axios');

// Service URLs
const SERVICES = {
  products: process.env.PRODUCT_SERVICE_URL,
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8000'
};

/**
 * Add stock to inventory and update product service
 */
async function addStock(productId, quantity) {
  try {
    console.log(`[Stock] Adding ${quantity} units to product ${productId}`);
    
    // 1. Add to inventory service
    const inventoryResponse = await axios.put(
      `${SERVICES.inventory}/inventory/${productId}/add`,
      { quantity },
      { timeout: 30000 }
    );
    
    // 2. Update product service stock
    const productResponse = await axios.put(
      `${SERVICES.products}/api/v1/products/${productId}`,
      { stock: inventoryResponse.data.new_quantity || inventoryResponse.new_quantity} ,
      { timeout: 30000 }
    );
    
    console.log(`[Stock] Successfully added stock for product ${productId}`);
    
    return {
      success: true,
      product_id: productId,
      quantity_added: quantity,
      inventory: inventoryResponse.data,
      product: productResponse.data
    };
  } catch (error) {
    console.error(`[Stock Error] Failed to add stock:`, error.message);
    throw error;
  }
}

/**
 * Remove stock from inventory and update product service
 */
async function removeStock(productId, quantity) {
  try {
    console.log(`[Stock] Removing ${quantity} units from product ${productId}`);
    
    // 1. Remove from inventory service
    const inventoryResponse = await axios.put(
      `${SERVICES.inventory}/inventory/${productId}/deduct`,
      { quantity },
      { timeout: 30000 }
    );
    
    // 2. Update product service stock
    const productResponse = await axios.put(
      `${SERVICES.products}/api/v1/products/${productId}`,
      { stock: inventoryResponse.data.new_quantity || inventoryResponse.new_quantity },
      { timeout: 30000 }
    );
    
    console.log(`[Stock] Successfully removed stock for product ${productId}`);
    
    return {
      success: true,
      product_id: productId,
      quantity_removed: quantity,
      inventory: inventoryResponse.data,
      product: productResponse.data
    };
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
    const response = await axios.get(
      `${SERVICES.inventory}/inventory/${productId}`,
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
      `${SERVICES.inventory}/inventory/low-stock`,
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
    console.log(`[Stock] Syncing stock for product ${productId}`);
    
    // Get current stock from inventory
    const inventoryStock = await getStock(productId);
    
    // Update product service
    await axios.patch(
      `${SERVICES.products}/api/v1/products/${productId}`,
      { stock: inventoryStock.quantity || inventoryStock.stock },
      { timeout: 30000 }
    );
    
    console.log(`[Stock] Stock synced for product ${productId}`);
    
    return {
      success: true,
      product_id: productId,
      stock: inventoryStock.quantity || inventoryStock.stock
    };
  } catch (error) {
    console.error(`[Stock Error] Failed to sync stock:`, error.message);
    throw error;
  }
}

module.exports = {
  addStock,
  removeStock,
  getStock,
  syncStock,
  getLowStock
};
