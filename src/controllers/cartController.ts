import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import { AuthRequest } from "../midleware/auth";

// 📦 Pobranie koszyka zalogowanego użytkownika
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Nieautoryzowany" });

    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    res.json(items);
  } catch (error) {
    console.error("Błąd przy pobieraniu koszyka:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// ➕ Dodawanie produktu do koszyka
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Nieautoryzowany" });

    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Nieprawidłowe dane" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      return res.status(404).json({ message: "Produkt nie istnieje" });

    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    let cartItem;

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
    }

    res.status(200).json(cartItem);
  } catch (error) {
    console.error("Błąd przy dodawaniu do koszyka:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// ➖ Zmniejszanie ilości produktu w koszyku
export const decreaseQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Nieautoryzowany" });

    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Nieprawidłowe dane" });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });
    if (!cartItem)
      return res
        .status(404)
        .json({ message: "Produkt nie istnieje w koszyku" });

    const newQuantity = cartItem.quantity - quantity;

    if (newQuantity > 0) {
      // aktualizujemy ilość
      const updatedItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
      res.status(200).json(updatedItem);
    } else {
      // jeśli ilość spadnie do 0 lub poniżej – usuwamy produkt
      await prisma.cartItem.delete({ where: { id: cartItem.id } });
      res.status(200).json({ productId, quantity: 0 }); // zwracamy informację, że produkt został usunięty
    }
  } catch (error) {
    console.error("Błąd przy zmniejszaniu ilości w koszyku:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const increaseQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Nieautoryzowany" });

    const { productId, quantity } = req.body;

    // Walidacja
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Nieprawidłowe dane" });
    }

    // Szukamy produktu w koszyku
    const cartItem = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Produkt nie istnieje w koszyku" });
    }

    // Zwiększamy ilość
    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + quantity },
      include: { product: true },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Błąd przy zwiększaniu ilości w koszyku:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Nieautoryzowany" });

    const productId = parseInt(req.params.productId as string);
    if (!productId)
      return res.status(400).json({ message: "Nieprawidłowe ID produktu" });

    const cartItem = await prisma.cartItem.findFirst({
      where: { productId },
    });
    if (!cartItem)
      return res
        .status(404)
        .json({ message: "Produkt nie istnieje w koszyku" });

    await prisma.cartItem.delete({ where: { id: cartItem.id } });

    res.status(200).json({ message: "Produkt usunięty z koszyka", productId });
  } catch (error) {
    console.error("Błąd przy usuwaniu z koszyka:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

export const deleteAll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Nieautoryzowany" });
    }

    // Usuń wszystkie produkty użytkownika z koszyka
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    res.status(200).json({ message: "Koszyk został wyczyszczony" });
  } catch (error) {
    console.error("Błąd przy czyszczeniu koszyka:", error);
    res.status(500).json({ message: "Błąd serwera przy czyszczeniu koszyka" });
  }
};
