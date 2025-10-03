import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
  getCurrentUser,
} from "@getmocha/users-service/backend";
import { Env } from "./types";
import { getSiteConfig, updateSiteConfig } from "./config";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors());

// OAuth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const mochaUser = c.get("user");
  if (!mochaUser) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  const db = c.env.DB;
  
  // Check if user exists in our local database
  let localUser = await db.prepare(`
    SELECT * FROM users WHERE mocha_user_id = ?
  `).bind(mochaUser.id).first();
  
  // Create local user if doesn't exist
  if (!localUser) {
    const result = await db.prepare(`
      INSERT INTO users (mocha_user_id, username, email, full_name)
      VALUES (?, ?, ?, ?)
    `).bind(
      mochaUser.id,
      mochaUser.google_user_data?.name || mochaUser.email.split('@')[0],
      mochaUser.email,
      mochaUser.google_user_data?.name || mochaUser.email
    ).run();
    
    if (result.success) {
      localUser = await db.prepare(`
        SELECT * FROM users WHERE id = ?
      `).bind(result.meta.last_row_id).first();
    }
  }
  
  return c.json({
    ...mochaUser,
    localUser
  });
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Admin authentication middleware
const adminAuthMiddleware = async (c: any, next: any) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
  
  if (!sessionToken) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const mochaUser = await getCurrentUser(sessionToken, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });
  
  if (!mochaUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // Check if user is admin using the unified users table
  const db = c.env.DB;
  const user = await db.prepare(`
    SELECT * FROM users WHERE mocha_user_id = ? AND is_admin = 1 AND is_active = 1
  `).bind(mochaUser.id).first();
  
  if (!user) {
    return c.json({ error: 'Admin access required' }, 403);
  }
  
  c.set('user', mochaUser);
  c.set('adminUser', user);
  await next();
};

// Homepage data endpoint (public)
app.get('/api/public/home', async (c) => {
  try {
    const db = c.env.DB;
    
    // Get site config first (with fast cache/file access)
    const config = await getSiteConfig(db, c.env);
    
    // Get banners
    const banners = await db.prepare(`
      SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order, created_at DESC
    `).all();
    
    // Get categories
    const categories = await db.prepare(`
      SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name_ar
    `).all();
    
    // Get featured products
    const featured_products = await db.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 
      ORDER BY p.created_at DESC 
      LIMIT 8
    `).all();
    
    const homeData = {
      banners: banners.results || [],
      categories: categories.results || [],
      featured_products: featured_products.results || [],
      announcement: config.announcement_text,
      site_name: config.site_name,
      site_name_en: config.site_name_en,
      site_logo_url: config.site_logo_url,
      primary_color: config.primary_color,
      secondary_color: config.secondary_color
    };
    
    return c.json(homeData);
  } catch (error) {
    console.error('Error fetching home data:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get categories endpoint (public)
app.get('/api/public/categories', async (c) => {
  try {
    const db = c.env.DB;
    const categories = await db.prepare(`
      SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name_ar
    `).all();
    
    return c.json(categories.results || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get products by category endpoint (public)
app.get('/api/public/categories/:id/products', async (c) => {
  try {
    const categoryId = c.req.param('id');
    const db = c.env.DB;
    
    const products = await db.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.is_active = 1
      ORDER BY p.created_at DESC
    `).bind(categoryId).all();
    
    return c.json(products.results || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get payment methods endpoint (public)
app.get('/api/public/payment-methods', async (c) => {
  try {
    const db = c.env.DB;
    const paymentMethods = await db.prepare(`
      SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY sort_order, name_ar
    `).all();
    
    return c.json(paymentMethods.results || []);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get payment method by ID endpoint (public)
app.get('/api/public/payment-methods/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    const paymentMethod = await db.prepare(`
      SELECT * FROM payment_methods WHERE id = ? AND is_active = 1
    `).bind(id).first();
    
    if (!paymentMethod) {
      return c.json({ error: 'Payment method not found' }, 404);
    }
    
    return c.json(paymentMethod);
  } catch (error) {
    console.error('Error fetching payment method:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get popups endpoint (public)
app.get('/api/public/popups', async (c) => {
  try {
    const db = c.env.DB;
    const popups = await db.prepare(`
      SELECT * FROM popups WHERE is_active = 1 ORDER BY created_at DESC
    `).all();
    
    return c.json(popups.results || []);
  } catch (error) {
    console.error('Error fetching popups:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user orders endpoint (protected)
app.get('/api/users/orders', authMiddleware, async (c) => {
  try {
    const mochaUser = c.get("user");
    if (!mochaUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const db = c.env.DB;
    
    // Get local user
    const localUser = await db.prepare(`
      SELECT * FROM users WHERE mocha_user_id = ?
    `).bind(mochaUser.id).first();
    
    if (!localUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const orders = await db.prepare(`
      SELECT o.*, p.name_ar as product_name_ar, p.name_en as product_name_en
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC 
      LIMIT 50
    `).bind(localUser.id).all();
    
    return c.json(orders.results || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get wallet transactions endpoint (protected)
app.get('/api/wallet/transactions', authMiddleware, async (c) => {
  try {
    const mochaUser = c.get("user");
    if (!mochaUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const db = c.env.DB;
    
    // Get local user
    const localUser = await db.prepare(`
      SELECT * FROM users WHERE mocha_user_id = ?
    `).bind(mochaUser.id).first();
    
    if (!localUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const transactions = await db.prepare(`
      SELECT wt.*, pm.name_ar as payment_method_name
      FROM wallet_transactions wt
      LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.id
      WHERE wt.user_id = ? 
      ORDER BY wt.created_at DESC 
      LIMIT 50
    `).bind(localUser.id).all();
    
    return c.json(transactions.results || []);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Submit deposit request endpoint (protected)
app.post('/api/wallet/deposit', authMiddleware, async (c) => {
  try {
    const mochaUser = c.get("user");
    if (!mochaUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const db = c.env.DB;
    
    // Get local user
    const localUser = await db.prepare(`
      SELECT * FROM users WHERE mocha_user_id = ?
    `).bind(mochaUser.id).first();
    
    if (!localUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Parse form data (in production, handle file uploads properly)
    const body = await c.req.json();
    
    // Validate payment method
    const paymentMethod = await db.prepare(`
      SELECT * FROM payment_methods WHERE id = ? AND is_active = 1
    `).bind(body.payment_method_id).first();
    
    if (!paymentMethod) {
      return c.json({ error: 'Invalid payment method' }, 400);
    }
    
    // Validate amount limits
    const amount = parseFloat(body.amount);
    const minAmount = (paymentMethod as any).min_amount || 10;
    const maxAmount = (paymentMethod as any).max_amount || 1000;
    
    if (amount < minAmount || amount > maxAmount) {
      return c.json({ 
        error: `Amount must be between $${minAmount} and $${maxAmount}` 
      }, 400);
    }
    
    const result = await db.prepare(`
      INSERT INTO wallet_transactions (
        user_id, amount, transaction_type, payment_method_id, 
        transaction_id, receipt_image_url, admin_notes
      ) VALUES (?, ?, 'deposit', ?, ?, ?, ?)
    `).bind(
      (localUser as any).id, 
      amount, 
      body.payment_method_id,
      body.transaction_id || null,
      body.receipt_image_url || null,
      body.notes || null
    ).run();
    
    if (result.success) {
      return c.json({ 
        message: 'Deposit request submitted successfully',
        transaction_id: result.meta.last_row_id
      });
    } else {
      return c.json({ error: 'Failed to submit deposit request' }, 500);
    }
  } catch (error) {
    console.error('Error submitting deposit:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create first admin endpoint
app.post('/api/admin/create-first-admin', authMiddleware, async (c) => {
  try {
    const mochaUser = c.get("user");
    if (!mochaUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const db = c.env.DB;
    
    // Check if any admin exists
    const existingAdmin = await db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE is_admin = 1
    `).first();
    
    if (existingAdmin && (existingAdmin as any).count > 0) {
      return c.json({ error: 'Admin already exists' }, 400);
    }
    
    // Get or create local user
    let localUser = await db.prepare(`
      SELECT * FROM users WHERE mocha_user_id = ?
    `).bind(mochaUser.id).first();
    
    if (!localUser) {
      const result = await db.prepare(`
        INSERT INTO users (mocha_user_id, username, email, full_name, is_admin)
        VALUES (?, ?, ?, ?, 1)
      `).bind(
        mochaUser.id,
        mochaUser.google_user_data?.name || mochaUser.email.split('@')[0],
        mochaUser.email,
        mochaUser.google_user_data?.name || mochaUser.email
      ).run();
      
      if (!result.success) {
        return c.json({ error: 'Failed to create admin user' }, 500);
      }
    } else {
      // Make existing user admin
      await db.prepare(`
        UPDATE users SET is_admin = 1, updated_at = CURRENT_TIMESTAMP
        WHERE mocha_user_id = ?
      `).bind(mochaUser.id).run();
    }
    
    return c.json({ message: 'First admin created successfully' });
  } catch (error) {
    console.error('Error creating first admin:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Check if any admin exists endpoint
app.get('/api/admin/check', authMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    // Check if any admin exists
    const adminCount = await db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE is_admin = 1
    `).first();
    
    if (!adminCount || (adminCount as any).count === 0) {
      return c.json({ hasAdmin: false }, 404);
    }
    
    return c.json({ hasAdmin: true });
  } catch (error) {
    console.error('Error checking admin:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin routes
app.get('/api/admin/dashboard', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    // Get basic stats
    const totalUsers = await db.prepare('SELECT COUNT(*) as count FROM users').first();
    const totalOrders = await db.prepare('SELECT COUNT(*) as count FROM orders').first();
    const totalRevenue = await db.prepare('SELECT SUM(amount) as total FROM wallet_transactions WHERE transaction_type = "deposit" AND status = "completed"').first();
    const pendingTransactions = await db.prepare('SELECT COUNT(*) as count FROM wallet_transactions WHERE status = "pending"').first();
    
    // Get today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();
    
    const todayUsers = await db.prepare('SELECT COUNT(*) as count FROM users WHERE created_at >= ?').bind(todayISO).first();
    const todayOrders = await db.prepare('SELECT COUNT(*) as count FROM orders WHERE created_at >= ?').bind(todayISO).first();
    const todayRevenue = await db.prepare('SELECT SUM(amount) as total FROM wallet_transactions WHERE transaction_type = "deposit" AND status = "completed" AND created_at >= ?').bind(todayISO).first();
    
    // Get yesterday's stats for growth calculation
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);
    const yesterdayStartISO = yesterdayStart.toISOString();
    const yesterdayEndISO = yesterdayEnd.toISOString();
    
    const yesterdayUsers = await db.prepare('SELECT COUNT(*) as count FROM users WHERE created_at >= ? AND created_at < ?').bind(yesterdayStartISO, yesterdayEndISO).first();
    const yesterdayOrders = await db.prepare('SELECT COUNT(*) as count FROM orders WHERE created_at >= ? AND created_at < ?').bind(yesterdayStartISO, yesterdayEndISO).first();
    const yesterdayRevenue = await db.prepare('SELECT SUM(amount) as total FROM wallet_transactions WHERE transaction_type = "deposit" AND status = "completed" AND created_at >= ? AND created_at < ?').bind(yesterdayStartISO, yesterdayEndISO).first();
    
    // Calculate growth percentages
    const calculateGrowth = (today: number, yesterday: number) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return Math.round(((today - yesterday) / yesterday) * 100);
    };
    
    const todayUsersCount = (todayUsers as any)?.count || 0;
    const todayOrdersCount = (todayOrders as any)?.count || 0;
    const todayRevenueAmount = Number((todayRevenue as any)?.total || 0);
    
    const yesterdayUsersCount = (yesterdayUsers as any)?.count || 0;
    const yesterdayOrdersCount = (yesterdayOrders as any)?.count || 0;
    const yesterdayRevenueAmount = Number((yesterdayRevenue as any)?.total || 0);
    
    // Get recent activity (real data)
    const recentUsers = await db.prepare('SELECT username, created_at FROM users ORDER BY created_at DESC LIMIT 2').all();
    const recentOrders = await db.prepare('SELECT o.*, u.username, p.name_ar FROM orders o LEFT JOIN users u ON o.user_id = u.id LEFT JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC LIMIT 2').all();
    const recentTransactions = await db.prepare('SELECT wt.*, u.username FROM wallet_transactions wt LEFT JOIN users u ON wt.user_id = u.id WHERE wt.status = "pending" ORDER BY wt.created_at DESC LIMIT 2').all();
    
    const recentActivity = [];
    
    // Add recent users
    for (const user of (recentUsers.results || [])) {
      const timeAgo = getTimeAgo((user as any).created_at);
      recentActivity.push({
        id: `user_${(user as any).username}`,
        type: 'user',
        message: `مستخدم جديد انضم: ${(user as any).username}`,
        time: timeAgo,
        icon: 'user'
      });
    }
    
    // Add recent orders
    for (const order of (recentOrders.results || [])) {
      const timeAgo = getTimeAgo((order as any).created_at);
      recentActivity.push({
        id: `order_${(order as any).id}`,
        type: 'order',
        message: `طلب جديد: ${(order as any).name_ar} - $${Number((order as any).price).toFixed(2)}`,
        time: timeAgo,
        icon: 'cart'
      });
    }
    
    // Add recent pending transactions
    for (const transaction of (recentTransactions.results || [])) {
      const timeAgo = getTimeAgo((transaction as any).created_at);
      recentActivity.push({
        id: `transaction_${(transaction as any).id}`,
        type: 'payment',
        message: `معاملة مالية تحتاج مراجعة: $${Number((transaction as any).amount).toFixed(2)} - ${(transaction as any).username}`,
        time: timeAgo,
        icon: 'dollar'
      });
    }
    
    // Sort by time (newest first)
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    const stats = {
      totalUsers: (totalUsers as any)?.count || 0,
      totalOrders: (totalOrders as any)?.count || 0,
      totalRevenue: Number((totalRevenue as any)?.total || 0),
      pendingTransactions: (pendingTransactions as any)?.count || 0,
      todayStats: {
        newUsers: todayUsersCount,
        newOrders: todayOrdersCount,
        todayRevenue: todayRevenueAmount
      },
      recentActivity: recentActivity.slice(0, 5),
      growthMetrics: {
        usersGrowth: calculateGrowth(todayUsersCount, yesterdayUsersCount),
        ordersGrowth: calculateGrowth(todayOrdersCount, yesterdayOrdersCount),
        revenueGrowth: calculateGrowth(todayRevenueAmount, yesterdayRevenueAmount)
      }
    };
    
    return c.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Helper function to calculate time ago
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `منذ ${diffInSeconds} ثانية`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} دقيقة`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ساعة`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} يوم`;
  }
}

app.get('/api/admin/users', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    
    const users = await db.prepare(`
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    const total = await db.prepare('SELECT COUNT(*) as count FROM users').first();
    
    return c.json({
      users: users.results || [],
      total: total?.count || 0,
      page,
      totalPages: Math.ceil(Number(total?.count || 0) / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin user management endpoints
app.patch('/api/admin/users/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { is_active, is_vip, is_admin } = await c.req.json();
    const db = c.env.DB;
    
    await db.prepare(`
      UPDATE users 
      SET is_active = ?, is_vip = ?, is_admin = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(is_active ? 1 : 0, is_vip ? 1 : 0, is_admin ? 1 : 0, id).run();
    
    return c.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/users/:id/add-balance', adminAuthMiddleware, async (c) => {
  try {
    const userId = c.req.param('id');
    const { amount, notes } = await c.req.json();
    const db = c.env.DB;
    
    if (amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }
    
    // Add balance to user
    await db.prepare(`
      UPDATE users 
      SET balance = COALESCE(CAST(balance AS REAL), 0.0) + CAST(? AS REAL), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(amount, userId).run();
    
    // Record transaction
    await db.prepare(`
      INSERT INTO wallet_transactions (user_id, amount, transaction_type, status, admin_notes)
      VALUES (?, ?, 'admin_credit', 'completed', ?)
    `).bind(userId, amount, notes || 'Admin balance addition').run();
    
    return c.json({ message: 'Balance added successfully' });
  } catch (error) {
    console.error('Error adding balance:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/admin/users/export', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const users = await db.prepare(`
      SELECT id, username, email, full_name, balance, is_admin, is_vip, is_active, created_at
      FROM users 
      ORDER BY created_at DESC
    `).all();
    
    // Create CSV content
    const csvHeader = 'ID,Username,Email,Full Name,Balance,Is Admin,Is VIP,Is Active,Created At\n';
    const csvContent = users.results.map((user: any) => 
      `${user.id},"${user.username}","${user.email}","${user.full_name}",${user.balance},${user.is_admin ? 'Yes' : 'No'},${user.is_vip ? 'Yes' : 'No'},${user.is_active ? 'Yes' : 'No'},${user.created_at}`
    ).join('\n');
    
    const csv = csvHeader + csvContent;
    
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/admin/products', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const products = await db.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `).all();
    
    return c.json(products.results || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/admin/categories', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const categories = await db.prepare(`
      SELECT * FROM categories ORDER BY level, sort_order, name_ar
    `).all();
    
    return c.json(categories.results || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Service Providers endpoints
app.get('/api/admin/providers', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const providers = await db.prepare(`
      SELECT * FROM service_providers ORDER BY created_at DESC
    `).all();
    
    return c.json(providers.results || []);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/providers', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { name, api_url, api_token, is_active } = await c.req.json();
    
    const result = await db.prepare(`
      INSERT INTO service_providers (name, api_url, api_token, is_active)
      VALUES (?, ?, ?, ?)
    `).bind(name, api_url, api_token, is_active ? 1 : 0).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Provider created successfully' });
  } catch (error) {
    console.error('Error creating provider:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/admin/providers/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const { name, api_url, api_token, is_active } = await c.req.json();
    
    await db.prepare(`
      UPDATE service_providers 
      SET name = ?, api_url = ?, api_token = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name, api_url, api_token, is_active ? 1 : 0, id).run();
    
    return c.json({ message: 'Provider updated successfully' });
  } catch (error) {
    console.error('Error updating provider:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/admin/providers/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    // Check if provider has products
    const productCount = await db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE provider_id = ?
    `).bind(id).first();
    
    if (productCount && (productCount as any).count > 0) {
      return c.json({ error: 'Cannot delete provider with existing products' }, 400);
    }
    
    await db.prepare(`DELETE FROM service_providers WHERE id = ?`).bind(id).run();
    
    return c.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/providers/test', adminAuthMiddleware, async (c) => {
  try {
    const { id } = await c.req.json();
    const db = c.env.DB;
    
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(id).first();
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404);
    }
    
    // Test API connection
    const response = await fetch((provider as any).api_url + '/client/api/products', {
      headers: {
        'api-token': (provider as any).api_token
      }
    });
    
    if (response.ok) {
      return c.json({ success: true, message: 'Connection successful' });
    } else {
      return c.json({ success: false, error: 'Connection failed' });
    }
  } catch (error) {
    console.error('Error testing provider:', error);
    return c.json({ success: false, error: 'Connection error' });
  }
});

app.post('/api/admin/providers/balance', adminAuthMiddleware, async (c) => {
  try {
    const { id } = await c.req.json();
    const db = c.env.DB;
    
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(id).first();
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404);
    }
    
    // Get balance from provider API
    const response = await fetch((provider as any).api_url + '/client/api/profile', {
      headers: {
        'api-token': (provider as any).api_token
      }
    });
    
    if (response.ok) {
      const data: any = await response.json();
      return c.json({ 
        success: true, 
        balance: data.balance,
        email: data.email 
      });
    } else {
      return c.json({ success: false, error: 'Failed to fetch balance' });
    }
  } catch (error) {
    console.error('Error fetching provider balance:', error);
    return c.json({ success: false, error: 'Balance fetch error' });
  }
});

app.post('/api/admin/providers/fetch-categories', adminAuthMiddleware, async (c) => {
  try {
    const { providerId } = await c.req.json();
    const db = c.env.DB;
    
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404);
    }
    
    const response = await fetch((provider as any).api_url + '/client/api/content/0', {
      headers: {
        'api-token': (provider as any).api_token
      }
    });
    
    if (response.ok) {
      const data: any = await response.json();
      return c.json(data.categories || []);
    } else {
      return c.json({ error: 'Failed to fetch categories' }, 400);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Error fetching categories' }, 500);
  }
});

// Fetch category content (subcategories and products)
app.post('/api/admin/providers/fetch-category-content', adminAuthMiddleware, async (c) => {
  try {
    const { providerId, categoryId } = await c.req.json();
    const db = c.env.DB;
    
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404);
    }
    
    const response = await fetch((provider as any).api_url + '/client/api/content/' + categoryId, {
      headers: {
        'api-token': (provider as any).api_token
      }
    });
    
    if (response.ok) {
      const data: any = await response.json();
      return c.json({
        categories: data.categories || [],
        products: data.products || []
      });
    } else {
      return c.json({ error: 'Failed to fetch category content' }, 400);
    }
  } catch (error) {
    console.error('Error fetching category content:', error);
    return c.json({ error: 'Error fetching category content' }, 500);
  }
});

// Import category tree
app.post('/api/admin/providers/import-tree', adminAuthMiddleware, async (c) => {
  try {
    const { providerId, categoryTree } = await c.req.json();
    const db = c.env.DB;
    
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404);
    }
    
    let importedCategories = 0;
    let importedProducts = 0;
    
    // Import the category tree recursively
    const importCategory = async (category: any, parentId: number | null = null) => {
      // Check if category already exists
      const existing = await db.prepare(`
        SELECT id FROM categories WHERE name_ar = ? OR name_en = ?
      `).bind(category.name, category.name).first();
      
      let categoryId;
      if (!existing) {
        // Calculate level and full path
        let level = 0;
        let full_path = category.name;
        
        if (parentId) {
          const parent = await db.prepare(`SELECT level, full_path FROM categories WHERE id = ?`).bind(parentId).first();
          if (parent) {
            level = (parent as any).level + 1;
            full_path = `${(parent as any).full_path} > ${category.name}`;
          }
        }
        
        const result = await db.prepare(`
          INSERT INTO categories (name_ar, name_en, description, parent_id, level, full_path, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `).bind(category.name, category.name, category.description || null, parentId, level, full_path).run();
        
        categoryId = result.meta.last_row_id;
        importedCategories++;
      } else {
        categoryId = (existing as any).id;
      }
      
      // Import products
      if (category.products && category.products.length > 0) {
        for (const product of category.products) {
          const existingProduct = await db.prepare(`
            SELECT id FROM products WHERE external_id = ? AND provider_id = ?
          `).bind(product.id, providerId).first();
          
          if (!existingProduct) {
            await db.prepare(`
              INSERT INTO products (
                provider_id, external_id, category_id, name_ar, name_en, 
                description, price, base_price, product_type, status,
                qty_values, params, available, is_active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'automatic', 'accept', ?, ?, 1, 1)
            `).bind(
              providerId, product.id, categoryId, product.name, product.name,
              product.description || null, product.price, product.price,
              product.qty_values || null, product.params || null
            ).run();
            importedProducts++;
          }
        }
      }
      
      // Import subcategories
      if (category.children && category.children.length > 0) {
        for (const subCategory of category.children) {
          await importCategory(subCategory, categoryId);
        }
      }
    };
    
    // Start importing from root category
    await importCategory(categoryTree);
    
    // Update last sync time
    await db.prepare(`
      UPDATE service_providers SET last_sync_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(providerId).run();
    
    return c.json({
      message: 'Tree imported successfully',
      imported: {
        categories: importedCategories,
        products: importedProducts
      }
    });
  } catch (error) {
    console.error('Error importing tree:', error);
    return c.json({ error: 'Error importing tree' }, 500);
  }
});

app.post('/api/admin/providers/fetch-products', adminAuthMiddleware, async (c) => {
  try {
    const { providerId } = await c.req.json();
    const db = c.env.DB;
    
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404);
    }
    
    const response = await fetch((provider as any).api_url + '/client/api/products', {
      headers: {
        'api-token': (provider as any).api_token
      }
    });
    
    if (response.ok) {
      const data: any = await response.json();
      return c.json(data.products || data || []);
    } else {
      return c.json({ error: 'Failed to fetch products' }, 400);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Error fetching products' }, 500);
  }
});

app.post('/api/admin/providers/import', adminAuthMiddleware, async (c) => {
  try {
    const { providerId, selectedCategories, selectedProducts } = await c.req.json();
    const db = c.env.DB;
    
    const provider = await db.prepare(`
      SELECT * FROM service_providers WHERE id = ?
    `).bind(providerId).first();
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404);
    }
    
    let importedCategories = 0;
    let importedProducts = 0;
    
    // Import categories
    if (selectedCategories && selectedCategories.length > 0) {
      const categoriesResponse = await fetch((provider as any).api_url + '/client/api/content/0', {
        headers: {
          'api-token': (provider as any).api_token
        }
      });
      
      if (categoriesResponse.ok) {
        const categoriesData: any = await categoriesResponse.json();
        const categories = categoriesData.categories || [];
        
        for (const categoryId of selectedCategories) {
          const category = categories.find((c: any) => c.id === categoryId);
          if (category) {
            // Check if category already exists
            const existing = await db.prepare(`
              SELECT id FROM categories WHERE name_ar = ? OR name_en = ?
            `).bind(category.name, category.name).first();
            
            if (!existing) {
              await db.prepare(`
                INSERT INTO categories (name_ar, name_en, description, is_active)
                VALUES (?, ?, ?, 1)
              `).bind(category.name, category.name, category.description || null).run();
              importedCategories++;
            }
          }
        }
      }
    }
    
    // Import products
    if (selectedProducts && selectedProducts.length > 0) {
      const productsResponse = await fetch((provider as any).api_url + '/client/api/products', {
        headers: {
          'api-token': (provider as any).api_token
        }
      });
      
      if (productsResponse.ok) {
        const productsData: any = await productsResponse.json();
        const products = productsData.products || productsData || [];
        
        for (const productId of selectedProducts) {
          const product = products.find((p: any) => p.id === productId);
          if (product) {
            // Check if product already exists
            const existing = await db.prepare(`
              SELECT id FROM products WHERE external_id = ? AND provider_id = ?
            `).bind(product.id, providerId).first();
            
            if (!existing) {
              // Find matching category
              let categoryId = null;
              if (product.category_id) {
                const category = await db.prepare(`
                  SELECT id FROM categories WHERE name_ar = ? OR name_en = ?
                `).bind(product.category_name || '', product.category_name || '').first();
                if (category) {
                  categoryId = (category as any).id;
                }
              }
              
              await db.prepare(`
                INSERT INTO products (
                  provider_id, external_id, category_id, name_ar, name_en, 
                  description, price, base_price, product_type, status,
                  qty_values, params, available, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'automatic', 'wait', ?, ?, 1, 1)
              `).bind(
                providerId, product.id, categoryId, product.name, product.name,
                product.description || null, product.price, product.price,
                product.qty_values || null, product.params || null
              ).run();
              importedProducts++;
            }
          }
        }
      }
    }
    
    // Update last sync time
    await db.prepare(`
      UPDATE service_providers SET last_sync_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(providerId).run();
    
    return c.json({
      message: 'Import completed successfully',
      imported: {
        categories: importedCategories,
        products: importedProducts
      }
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return c.json({ error: 'Error importing data' }, 500);
  }
});

// Product move endpoint
app.patch('/api/admin/products/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    
    if (body.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(body.category_id);
    }
    
    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    
    if (body.product_type !== undefined) {
      updates.push('product_type = ?');
      values.push(body.product_type);
    }
    
    if (body.price !== undefined) {
      updates.push('price = ?');
      values.push(body.price);
    }
    
    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(body.is_active ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await db.prepare(`
      UPDATE products SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();
    
    return c.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/admin/payment-methods', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const paymentMethods = await db.prepare(`
      SELECT * FROM payment_methods ORDER BY sort_order, name_ar
    `).all();
    
    return c.json(paymentMethods.results || []);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/payment-methods', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { 
      name_ar, name_en, image_url, description_ar, description_en,
      instructions_ar, instructions_en, requires_receipt, requires_transaction_id,
      custom_fields, min_amount, max_amount, is_active, sort_order 
    } = await c.req.json();
    
    const result = await db.prepare(`
      INSERT INTO payment_methods (
        name_ar, name_en, image_url, description_ar, description_en,
        instructions_ar, instructions_en, requires_receipt, requires_transaction_id,
        custom_fields, min_amount, max_amount, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name_ar, name_en, image_url, description_ar, description_en,
      instructions_ar, instructions_en, requires_receipt ? 1 : 0, requires_transaction_id ? 1 : 0,
      custom_fields, min_amount || 10, max_amount || 1000, is_active ? 1 : 0, sort_order || 0
    ).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Payment method created successfully' });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/admin/payment-methods/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const { 
      name_ar, name_en, image_url, description_ar, description_en,
      instructions_ar, instructions_en, requires_receipt, requires_transaction_id,
      custom_fields, min_amount, max_amount, is_active, sort_order 
    } = await c.req.json();
    
    await db.prepare(`
      UPDATE payment_methods 
      SET name_ar = ?, name_en = ?, image_url = ?, description_ar = ?, description_en = ?,
          instructions_ar = ?, instructions_en = ?, requires_receipt = ?, requires_transaction_id = ?,
          custom_fields = ?, min_amount = ?, max_amount = ?, is_active = ?, sort_order = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name_ar, name_en, image_url, description_ar, description_en,
      instructions_ar, instructions_en, requires_receipt ? 1 : 0, requires_transaction_id ? 1 : 0,
      custom_fields, min_amount || 10, max_amount || 1000, is_active ? 1 : 0, sort_order || 0, id
    ).run();
    
    return c.json({ message: 'Payment method updated successfully' });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/admin/payment-methods/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    // Check if payment method has transactions
    const transactionCount = await db.prepare(`
      SELECT COUNT(*) as count FROM wallet_transactions WHERE payment_method_id = ?
    `).bind(id).first();
    
    if (transactionCount && (transactionCount as any).count > 0) {
      // Don't delete, just deactivate
      await db.prepare(`
        UPDATE payment_methods SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(id).run();
      
      return c.json({ message: 'Payment method deactivated (has existing transactions)' });
    }
    
    await db.prepare(`DELETE FROM payment_methods WHERE id = ?`).bind(id).run();
    
    return c.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/admin/orders', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const orders = await db.prepare(`
      SELECT o.*, u.username, u.email, p.name_ar as product_name_ar
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `).all();
    
    return c.json(orders.results || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/admin/transactions', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const transactions = await db.prepare(`
      SELECT wt.*, u.username, u.email, pm.name_ar as payment_method_name
      FROM wallet_transactions wt
      LEFT JOIN users u ON wt.user_id = u.id
      LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.id
      ORDER BY wt.created_at DESC
    `).all();
    
    return c.json(transactions.results || []);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin transaction approval
app.patch('/api/admin/transactions/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { status, admin_notes } = await c.req.json();
    const db = c.env.DB;
    
    const transaction = await db.prepare(`
      SELECT * FROM wallet_transactions WHERE id = ?
    `).bind(id).first();
    
    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }
    
    // Update transaction
    await db.prepare(`
      UPDATE wallet_transactions 
      SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, admin_notes, id).run();
    
    // If approved, add to user balance
    if (status === 'completed' && (transaction as any).transaction_type === 'deposit') {
      const amount = parseFloat((transaction as any).amount.toString());
      await db.prepare(`
        UPDATE users 
        SET balance = COALESCE(CAST(balance AS REAL), 0.0) + CAST(? AS REAL), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(amount, (transaction as any).user_id).run();
    }
    
    // If rejected and was previously completed, deduct from user balance
    if (status === 'rejected' && (transaction as any).status === 'completed' && (transaction as any).transaction_type === 'deposit') {
      const amount = parseFloat((transaction as any).amount.toString());
      await db.prepare(`
        UPDATE users 
        SET balance = COALESCE(CAST(balance AS REAL), 0.0) - CAST(? AS REAL), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(amount, (transaction as any).user_id).run();
    }
    
    return c.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin settings endpoints
app.get('/api/admin/settings', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const config = await getSiteConfig(db, c.env);
    return c.json(config);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/settings', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const settings = await c.req.json();
    
    // Update settings using config system with file storage
    await updateSiteConfig(db, settings, c.env);
    
    return c.json({ 
      message: 'Settings updated successfully',
      config: await getSiteConfig(db, c.env)
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin management endpoints
app.get('/api/admin/admins', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    // Get all admin users with their permissions
    const admins = await db.prepare(`
      SELECT u.id, u.username, u.email, u.full_name, u.is_admin, u.is_active, u.created_at
      FROM users u
      WHERE u.is_admin = 1
      ORDER BY u.created_at DESC
    `).all();
    
    // Get permissions for each admin
    const adminsWithPermissions = await Promise.all(
      (admins.results || []).map(async (admin: any) => {
        const permissions = await db.prepare(`
          SELECT permission_key, permission_value
          FROM admin_permissions
          WHERE user_id = ?
        `).bind(admin.id).all();
        
        const permissionsMap = (permissions.results || []).reduce((acc: any, perm: any) => {
          acc[perm.permission_key] = perm.permission_value === 1;
          return acc;
        }, {});
        
        return {
          ...admin,
          permissions: permissionsMap
        };
      })
    );
    
    return c.json(adminsWithPermissions);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/admins', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { email, permissions } = await c.req.json();
    
    // Find user by email
    const user = await db.prepare(`
      SELECT * FROM users WHERE email = ? AND is_active = 1
    `).bind(email).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Make user admin
    await db.prepare(`
      UPDATE users SET is_admin = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind((user as any).id).run();
    
    // Set permissions
    for (const [key, value] of Object.entries(permissions)) {
      await db.prepare(`
        INSERT OR REPLACE INTO admin_permissions (user_id, permission_key, permission_value, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind((user as any).id, key, value ? 1 : 0).run();
    }
    
    return c.json({ message: 'Admin added successfully' });
  } catch (error) {
    console.error('Error adding admin:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/admin/admins/:id/permissions', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const permissions = await c.req.json();
    const db = c.env.DB;
    
    // Update permissions
    for (const [key, value] of Object.entries(permissions)) {
      await db.prepare(`
        INSERT OR REPLACE INTO admin_permissions (user_id, permission_key, permission_value, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(id, key, value ? 1 : 0).run();
    }
    
    return c.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/admin/admins/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    // Remove admin privileges
    await db.prepare(`
      UPDATE users SET is_admin = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();
    
    // Remove permissions
    await db.prepare(`
      DELETE FROM admin_permissions WHERE user_id = ?
    `).bind(id).run();
    
    return c.json({ message: 'Admin privileges removed successfully' });
  } catch (error) {
    console.error('Error removing admin:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin categories endpoints
app.post('/api/admin/categories', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { name_ar, name_en, description, image_url, parent_id, sort_order, is_active } = await c.req.json();
    
    // Calculate level and full path
    let level = 0;
    let full_path = name_ar;
    
    if (parent_id) {
      const parent = await db.prepare(`SELECT level, full_path FROM categories WHERE id = ?`).bind(parent_id).first();
      if (parent) {
        level = (parent as any).level + 1;
        full_path = `${(parent as any).full_path} > ${name_ar}`;
      }
    }
    
    const result = await db.prepare(`
      INSERT INTO categories (name_ar, name_en, description, image_url, parent_id, level, full_path, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(name_ar, name_en, description, image_url, parent_id, level, full_path, sort_order || 0, is_active ? 1 : 0).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/admin/categories/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const { name_ar, name_en, description, image_url, parent_id, sort_order, is_active } = await c.req.json();
    
    // Calculate level and full path
    let level = 0;
    let full_path = name_ar;
    
    if (parent_id) {
      const parent = await db.prepare(`SELECT level, full_path FROM categories WHERE id = ?`).bind(parent_id).first();
      if (parent) {
        level = (parent as any).level + 1;
        full_path = `${(parent as any).full_path} > ${name_ar}`;
      }
    }
    
    await db.prepare(`
      UPDATE categories 
      SET name_ar = ?, name_en = ?, description = ?, image_url = ?, parent_id = ?, level = ?, full_path = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name_ar, name_en, description, image_url, parent_id, level, full_path, sort_order || 0, is_active ? 1 : 0, id).run();
    
    // Update child categories' paths if this category's name changed
    const children = await db.prepare(`SELECT * FROM categories WHERE parent_id = ?`).bind(id).all();
    for (const child of (children.results || [])) {
      const childData = child as any;
      const newChildPath = `${full_path} > ${childData.name_ar}`;
      await db.prepare(`
        UPDATE categories SET full_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(newChildPath, childData.id).run();
    }
    
    return c.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/admin/categories/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    // Check if category has products
    const productCount = await db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE category_id = ?
    `).bind(id).first();
    
    if (productCount && (productCount as any).count > 0) {
      return c.json({ error: 'Cannot delete category with products' }, 400);
    }
    
    await db.prepare(`DELETE FROM categories WHERE id = ?`).bind(id).run();
    
    return c.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin products endpoints
app.post('/api/admin/products', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { 
      category_id, name_ar, name_en, description, price, image_url, 
      service_type, min_quantity, max_quantity, is_active 
    } = await c.req.json();
    
    const result = await db.prepare(`
      INSERT INTO products (
        category_id, name_ar, name_en, description, price, image_url,
        service_type, min_quantity, max_quantity, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      category_id || null, name_ar, name_en, description, price, image_url,
      service_type || 'package', min_quantity || 1, max_quantity || 1000, is_active ? 1 : 0
    ).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/admin/products/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const { 
      category_id, name_ar, name_en, description, price, image_url, 
      service_type, min_quantity, max_quantity, is_active 
    } = await c.req.json();
    
    await db.prepare(`
      UPDATE products 
      SET category_id = ?, name_ar = ?, name_en = ?, description = ?, price = ?, image_url = ?,
          service_type = ?, min_quantity = ?, max_quantity = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      category_id || null, name_ar, name_en, description, price, image_url,
      service_type || 'package', min_quantity || 1, max_quantity || 1000, is_active ? 1 : 0, id
    ).run();
    
    return c.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/admin/products/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    // Check if product has orders
    const orderCount = await db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE product_id = ?
    `).bind(id).first();
    
    if (orderCount && (orderCount as any).count > 0) {
      // Don't delete, just deactivate
      await db.prepare(`
        UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(id).run();
      
      return c.json({ message: 'Product deactivated (has existing orders)' });
    }
    
    await db.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run();
    
    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin banners endpoints
app.get('/api/admin/banners', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const banners = await db.prepare(`
      SELECT * FROM banners ORDER BY sort_order, created_at DESC
    `).all();
    
    return c.json(banners.results || []);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/banners', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { title, image_url, link_url, sort_order, is_active } = await c.req.json();
    
    const result = await db.prepare(`
      INSERT INTO banners (title, image_url, link_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).bind(title, image_url, link_url, sort_order || 0, is_active ? 1 : 0).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Banner created successfully' });
  } catch (error) {
    console.error('Error creating banner:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/admin/banners/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const { title, image_url, link_url, sort_order, is_active } = await c.req.json();
    
    await db.prepare(`
      UPDATE banners 
      SET title = ?, image_url = ?, link_url = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, image_url, link_url, sort_order || 0, is_active ? 1 : 0, id).run();
    
    return c.json({ message: 'Banner updated successfully' });
  } catch (error) {
    console.error('Error updating banner:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/admin/banners/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    await db.prepare(`DELETE FROM banners WHERE id = ?`).bind(id).run();
    
    return c.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin popups endpoints
app.get('/api/admin/popups', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const popups = await db.prepare(`
      SELECT * FROM popups ORDER BY created_at DESC
    `).all();
    
    return c.json(popups.results || []);
  } catch (error) {
    console.error('Error fetching popups:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/admin/popups', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const { 
      title, content, image_url, button_text, button_url, button_color,
      popup_width, popup_height, image_width, image_height, button_position,
      background_color, text_color, border_radius, show_on_pages, is_active,
      show_once_per_session, delay_seconds 
    } = await c.req.json();
    
    const result = await db.prepare(`
      INSERT INTO popups (
        title, content, image_url, button_text, button_url, button_color,
        popup_width, popup_height, image_width, image_height, button_position,
        background_color, text_color, border_radius, show_on_pages, is_active,
        show_once_per_session, delay_seconds
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title, content, image_url, button_text, button_url, button_color || '#dc2626',
      popup_width || 500, popup_height || 400, image_width || 200, image_height || 150,
      button_position || 'center', background_color || '#ffffff', text_color || '#000000',
      border_radius || 12, show_on_pages || 'all', is_active ? 1 : 0,
      show_once_per_session ? 1 : 0, delay_seconds || 2
    ).run();
    
    return c.json({ id: result.meta.last_row_id, message: 'Popup created successfully' });
  } catch (error) {
    console.error('Error creating popup:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/admin/popups/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    const { 
      title, content, image_url, button_text, button_url, button_color,
      popup_width, popup_height, image_width, image_height, button_position,
      background_color, text_color, border_radius, show_on_pages, is_active,
      show_once_per_session, delay_seconds 
    } = await c.req.json();
    
    await db.prepare(`
      UPDATE popups 
      SET title = ?, content = ?, image_url = ?, button_text = ?, button_url = ?, button_color = ?,
          popup_width = ?, popup_height = ?, image_width = ?, image_height = ?, button_position = ?,
          background_color = ?, text_color = ?, border_radius = ?, show_on_pages = ?, is_active = ?,
          show_once_per_session = ?, delay_seconds = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title, content, image_url, button_text, button_url, button_color || '#dc2626',
      popup_width || 500, popup_height || 400, image_width || 200, image_height || 150,
      button_position || 'center', background_color || '#ffffff', text_color || '#000000',
      border_radius || 12, show_on_pages || 'all', is_active ? 1 : 0,
      show_once_per_session ? 1 : 0, delay_seconds || 2, id
    ).run();
    
    return c.json({ message: 'Popup updated successfully' });
  } catch (error) {
    console.error('Error updating popup:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/admin/popups/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;
    
    await db.prepare(`DELETE FROM popups WHERE id = ?`).bind(id).run();
    
    return c.json({ message: 'Popup deleted successfully' });
  } catch (error) {
    console.error('Error deleting popup:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Reset popup sessions for all users
app.post('/api/admin/popups/:id/reset-sessions', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // This will clear the session storage for this popup across all clients
    // We return a special flag that tells the frontend to broadcast this reset
    return c.json({ 
      message: 'Popup sessions reset successfully',
      popupId: id,
      shouldBroadcast: true
    });
  } catch (error) {
    console.error('Error resetting popup sessions:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin order status update
app.patch('/api/admin/orders/:id', adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    const db = c.env.DB;
    
    await db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, id).run();
    
    return c.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Export transactions endpoint
app.get('/api/admin/transactions/export', adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    
    const transactions = await db.prepare(`
      SELECT wt.*, u.username, u.email, pm.name_ar as payment_method_name
      FROM wallet_transactions wt
      LEFT JOIN users u ON wt.user_id = u.id
      LEFT JOIN payment_methods pm ON wt.payment_method_id = pm.id
      ORDER BY wt.created_at DESC
    `).all();
    
    // Create CSV content
    const csvHeader = 'ID,User,Email,Amount,Type,Status,Payment Method,Transaction ID,Admin Notes,Created At\n';
    const csvContent = transactions.results.map((transaction: any) => 
      `${transaction.id},"${transaction.username}","${transaction.email}",${transaction.amount},"${transaction.transaction_type}","${transaction.status}","${transaction.payment_method_name || ''}","${transaction.transaction_id || ''}","${transaction.admin_notes || ''}",${transaction.created_at}`
    ).join('\n');
    
    const csv = csvHeader + csvContent;
    
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transactions_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
