import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  size?: string;
  color?: string;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // For now, return empty products array
  // In a real implementation, this would fetch from database
  res.json({
    success: true,
    products: []
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as ProductRequest;
    const { name, description, price, stock, size, color } = body;
    
    // Validate required fields
    if (!name || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, stock"
      });
    }
    
    // Create a mock product (in real implementation, save to database)
    const mockProduct = {
      id: `prod_${Date.now()}`,
      name,
      description: description || "",
      price: parseFloat(price.toString()),
      stock: parseInt(stock.toString()),
      size: size || "",
      color: color || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: "Product created successfully",
      product: mockProduct
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product"
    });
  }
}
