import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface Merchant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  password: string;
}

// In-memory store for demo (replace with database in production)
const merchants: Merchant[] = [];
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_key_for_live_sales_platform";

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { action } = req.query;
    
    if (action === "register") {
      return await handleRegister(req, res);
    } else if (action === "login") {
      return await handleLogin(req, res);
    } else {
      return res.status(400).json({ 
        error: "Invalid action. Use 'register' or 'login'" 
      });
    }
  } catch (error: any) {
    console.error("Auth error:", error);
    res.status(500).json({ 
      error: "Authentication failed",
      details: error.message 
    });
  }
}

async function handleRegister(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as RegisterRequest;
  const { firstName, lastName, email, password, confirmPassword, companyName } = body;

  // Validation
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ 
      error: "All fields are required" 
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ 
      error: "Passwords do not match" 
    });
  }

  // Check if merchant already exists
  const existingMerchant = merchants.find(m => m.email === email);
  if (existingMerchant) {
    return res.status(400).json({ 
      error: "Merchant with this email already exists" 
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create merchant
  const merchant: Merchant = {
    id: `merchant_${Date.now()}`,
    firstName,
    lastName,
    email,
    companyName,
    password: hashedPassword
  };

  merchants.push(merchant);

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: merchant.id, 
      email: merchant.email,
      type: "merchant" 
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Remove password from response
  const { password: _, ...merchantWithoutPassword } = merchant;

  res.json({
    success: true,
    message: "Merchant registered successfully",
    token,
    merchant: merchantWithoutPassword
  });
}

async function handleLogin(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as LoginRequest;
  const { email, password } = body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      error: "Email and password are required" 
    });
  }

  // Find merchant
  const merchant = merchants.find(m => m.email === email);
  if (!merchant) {
    return res.status(400).json({ 
      error: "Invalid email or password" 
    });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, merchant.password);
  if (!isValidPassword) {
    return res.status(400).json({ 
      error: "Invalid email or password" 
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: merchant.id, 
      email: merchant.email,
      type: "merchant" 
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Remove password from response
  const { password: _, ...merchantWithoutPassword } = merchant;

  res.json({
    success: true,
    message: "Login successful",
    token,
    merchant: merchantWithoutPassword
  });
}

// Get merchant profile (protected route)
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: "Authentication required" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Find merchant
    const merchant = merchants.find(m => m.id === decoded.id);
    if (!merchant) {
      return res.status(404).json({ 
        error: "Merchant not found" 
      });
    }

    // Remove password from response
    const { password: _, ...merchantWithoutPassword } = merchant;

    res.json({
      success: true,
      merchant: merchantWithoutPassword
    });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid token" 
      });
    }
    console.error("Profile error:", error);
    res.status(500).json({ 
      error: "Failed to get profile",
      details: error.message 
    });
  }
}
