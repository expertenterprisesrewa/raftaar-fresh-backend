const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, storeId: 1 },
        include: { items: { include: { product: true } } }
      });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/cart/add
exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'ProductId and positive quantity required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, storeId: product.storeId || 1 }
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: product.price
        }
      });
    }

    const updatedCart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/cart/remove/:id
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, cart: { userId } }
    });
    if (!cartItem) return res.status(404).json({ error: 'Item not found in your cart' });

    await prisma.cartItem.delete({ where: { id } });

    const updatedCart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/cart/update/:id
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, cart: { userId } }
    });
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    const updatedCart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};