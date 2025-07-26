import User from "../schemas/User.mjs";
import { generateAccessToken } from "../utils/jwt.mjs";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    if (!["fan", "player"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'fan' or 'player'",
      });
    }

    const existingUser = await User.findOne({ email }).select("_id").lean();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "User registration failed",
      });
    }

    const token = generateAccessToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const passwordMatched = await user.comparePassword(password);
    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateAccessToken(user);

    const data = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: token,
      data,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
