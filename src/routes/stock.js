const express = require('express');
const router = express.Router();
const stockService = require('../services/stockService');

/**
 * Create product with inventory sync
 * POST /stock/products
 * Body: { name, sku, description, price, stock, warehouse_location? }
 */
router.post('/products', async (req, res) => {
  try {
    const { warehouse_location, ...productData } = req.body;
    
    if (!productData.name || !productData.sku) {
      return res.status(400).json({
        error: 'Invalid product data',
        message: 'Name and SKU are required'
      });
    }
    
    const result = await stockService.createProductWithInventory(
      productData,
      warehouse_location || 'WH-A1'
    );
    
    res.status(201).json({
      message: 'Product and inventory created successfully',
      ...result
    });
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to create product',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Add stock to a product
 * POST /stock/:productId/add
 * Body: { quantity: number }
 */
router.post('/:productId/add', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: 'Quantity must be a positive number'
      });
    }
    
    const result = await stockService.addStock(productId, quantity);
    
    res.status(200).json({
      message: 'Stock added successfully',
      ...result
    });
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to add stock',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Remove stock from a product
 * POST /stock/:productId/remove
 * Body: { quantity: number }
 */
router.post('/:productId/remove', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: 'Quantity must be a positive number'
      });
    }
    
    const result = await stockService.removeStock(productId, quantity);
    
    res.status(200).json({
      message: 'Stock removed successfully',
      ...result
    });
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to remove stock',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get stock level for a product
 * GET /stock/:productId
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await stockService.getStock(productId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get stock',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get low stock items
 * GET /stock/lowStock
 * Note: Must be defined before /:productId route to avoid conflicts
 */
router.get('/lowStock', async (req, res) => {
  try {
    const result = await stockService.getLowStock();
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get low stock',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Check stock availability for a single product
 * POST /stock/check-availability
 * Body: { product_id: string, required_quantity: number }
 * Note: Must be defined before /:productId route to avoid conflicts
 */
router.post('/check-availability', async (req, res) => {
  try {
    const { product_id, required_quantity } = req.body;
    
    if (!product_id || required_quantity === undefined) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'product_id and required_quantity are required'
      });
    }
    
    const result = await stockService.checkAvailability(product_id, required_quantity);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to check availability',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Check bulk stock availability for multiple products
 * POST /stock/check-availability/bulk
 * Body: { items: [{ product_id: string, required_quantity: number }] }
 * Note: Must be defined before /check-availability route to avoid conflicts
 */
router.post('/check-availability/bulk', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'items array is required and must not be empty'
      });
    }
    
    // Validate each item
    for (const item of items) {
      if (!item.product_id || item.required_quantity === undefined) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Each item must have product_id and required_quantity'
        });
      }
    }
    
    const result = await stockService.checkBulkAvailability(items);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to check bulk availability',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Sync all products from inventory to product service
 * POST /stock/sync-all
 * Note: Must be defined before /:productId route to avoid conflicts
 */
router.post('/sync-all', async (req, res) => {
  try {
    console.log('[Stock Route] Starting bulk sync...');
    const result = await stockService.syncAllProducts();
    
    res.status(200).json({
      message: 'Bulk sync completed',
      ...result
    });
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to sync all products',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Sync stock between inventory and product services
 * POST /stock/:productId/sync
 */
router.post('/:productId/sync', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await stockService.syncStock(productId);
    
    res.status(200).json({
      message: 'Stock synchronized successfully',
      ...result
    });
  } catch (error) {
    console.error('[Stock Route Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to sync stock',
      message: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
