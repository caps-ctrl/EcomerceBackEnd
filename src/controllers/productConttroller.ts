import type { Request, Response } from "express";
import prisma from "../config/prismaClient";

export const getProducts = async (_: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, description, image, category } = req.body;
  const product = await prisma.product.create({
    data: { name, price, description, image, category },
  });
  res.json(product);
};
