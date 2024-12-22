import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';



export const registerController = async (req, res) => {
      const id = uuidv4();

  try {
    const { email, name, password } = req.body;

    const isEmail = await User.findOne({ email });
    if (isEmail) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = { name, password: hashedPassword, email , unquieId: id , authProvider: 'defaultUser'};
    const isSaved = await User.create(user);

    if (isSaved) {
      return res.status(201).json({
        status: true,
        message: "Successfully created",
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};


export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid email",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({
        status: false,
        message: "Invalid password",
      });
    }

    const payload = { id: user.unquieId, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      userDetail: user.name
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
