import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import QRCode from "qrcode";

interface QRCodeRequest {
  productId: string;
  productUrl: string;
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  res.json({ message: "Live Sales Platform API" });
}

// Generate QR code for a product
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const body = req.body as QRCodeRequest;
    const { productId, productUrl } = body;
    
    if (!productId || !productUrl) {
      return res.status(400).json({ 
        error: "productId and productUrl are required" 
      });
    }

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(productUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });

    res.json({
      success: true,
      productId,
      qrCode: qrCodeDataUrl,
      productUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("QR Code generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate QR code",
      details: error.message 
    });
  }
}
