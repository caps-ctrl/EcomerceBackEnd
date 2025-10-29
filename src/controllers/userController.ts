import type { Request, Response } from "express";
import prisma from "../config/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface JwtUserPayload {
  userId: number;
  email: string;
}

export const getUsers = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.status(201).json({ message: "User Created", userId: user.id });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "1d" }
  );
  res.json({ token });
};

export const getMe = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Brak tokena" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Brak tokena" });

  try {
    const secret: string = process.env.JWT_SECRET ?? "supersecret";

    const decoded = jwt.verify(token, secret) as JwtUserPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user)
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });

    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Niepoprawny token" });
  }
};
