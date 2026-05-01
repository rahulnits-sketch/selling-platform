import crypto from "crypto";
import express from "express";
import pg from "pg";

const { Pool } = pg;

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "rahul#123";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "12345";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Create a PostgreSQL database before starting the backend.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("render.com")
    ? { rejectUnauthorized: false }
    : process.env.PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : false,
});

const defaultCars = [
  {
    id: "car-1",
    title: "2022 Honda Civic Sport",
    price: 22950,
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    ],
    brand: "Honda",
    year: 2022,
    mileage: "18,400 mi",
    fuel_type: "Petrol",
    transmission: "Automatic",
    location: "Austin, TX",
    description:
      "Single-owner Civic Sport with a clean title, regular service history, and a spotless interior. Great fuel economy and ready for daily driving.",
    phone: "+15125550123",
    is_featured: true,
    status: "available",
    created_date: "2026-03-30T10:00:00.000Z",
  },
  {
    id: "car-2",
    title: "2021 Tesla Model 3 Long Range",
    price: 31900,
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    ],
    brand: "Tesla",
    year: 2021,
    mileage: "27,900 mi",
    fuel_type: "Electric",
    transmission: "Automatic",
    location: "San Jose, CA",
    description:
      "Long Range AWD with premium interior, glass roof, and autopilot. Battery and drivetrain feel excellent.",
    phone: "+14155550123",
    is_featured: true,
    status: "available",
    created_date: "2026-03-28T09:30:00.000Z",
  },
  {
    id: "car-3",
    title: "2019 Toyota Fortuner 4x4",
    price: 27400,
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80",
    images: [],
    brand: "Toyota",
    year: 2019,
    mileage: "42,000 mi",
    fuel_type: "Diesel",
    transmission: "Manual",
    location: "Dallas, TX",
    description:
      "Well-maintained SUV with 4x4 capability, strong engine, and roomy cabin. Ideal for family trips and weekend adventures.",
    phone: "+12125550123",
    is_featured: false,
    status: "available",
    created_date: "2026-03-22T15:15:00.000Z",
  },
  {
    id: "car-4",
    title: "2018 BMW 320i Luxury Line",
    price: 18900,
    image:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
    images: [],
    brand: "BMW",
    year: 2018,
    mileage: "51,000 mi",
    fuel_type: "Petrol",
    transmission: "Automatic",
    location: "Chicago, IL",
    description:
      "Elegant sedan with premium leather seats, smooth automatic transmission, and recent brake and tire service.",
    phone: "+13125550123",
    is_featured: false,
    status: "sold",
    created_date: "2026-03-15T08:45:00.000Z",
  },
];

app.use(express.json({ limit: "15mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", CLIENT_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Car Dealer Backend is running",
    health: "/api/health",
  });
});

app.get("/api/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", time: new Date().toISOString() });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = {
    id: "admin",
    name: "Admin",
    username: ADMIN_USERNAME,
    role: "admin",
  };

  return res.json({
    token: signToken({ sub: user.id, username: user.username, role: user.role }),
    user,
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  return res.json({
    id: "admin",
    name: "Admin",
    username: req.user.username,
    role: req.user.role,
  });
});

app.get("/api/cars", async (req, res, next) => {
  try {
    const sort = req.query.sort === "created_date" ? "ASC" : "DESC";
    const values = [];
    let query = `
      SELECT id, title, price, image, images, brand, year, mileage, fuel_type,
             transmission, location, description, phone, is_featured, status, created_date
      FROM cars
      ORDER BY created_date ${sort}
    `;

    if (req.query.limit) {
      const parsedLimit = Number(req.query.limit);
      if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
        values.push(parsedLimit);
        query += ` LIMIT $${values.length}`;
      }
    }

    const result = await pool.query(query, values);
    return res.json(result.rows.map(mapCarRow));
  } catch (error) {
    return next(error);
  }
});

app.get("/api/cars/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, price, image, images, brand, year, mileage, fuel_type,
              transmission, location, description, phone, is_featured, status, created_date
       FROM cars
       WHERE id = $1`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Car not found" });
    }

    return res.json(mapCarRow(result.rows[0]));
  } catch (error) {
    return next(error);
  }
});

app.post("/api/cars", requireAuth, async (req, res, next) => {
  try {
    const payload = sanitizeCarPayload(req.body, false);
    const validationError = validateCarPayload(payload, false);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const car = {
      id: `car-${Date.now()}`,
      created_date: new Date().toISOString(),
      ...payload,
    };

    const result = await pool.query(
      `INSERT INTO cars (
        id, title, price, image, images, brand, year, mileage, fuel_type,
        transmission, location, description, phone, is_featured, status, created_date
      ) VALUES (
        $1, $2, $3, $4, $5::text[], $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING id, title, price, image, images, brand, year, mileage, fuel_type,
                transmission, location, description, phone, is_featured, status, created_date`,
      carParams(car)
    );

    return res.status(201).json(mapCarRow(result.rows[0]));
  } catch (error) {
    return next(error);
  }
});

app.put("/api/cars/:id", requireAuth, async (req, res, next) => {
  try {
    const existing = await pool.query("SELECT * FROM cars WHERE id = $1", [req.params.id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: "Car not found" });
    }

    const payload = sanitizeCarPayload(req.body, true);
    const validationError = validateCarPayload(payload, true);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const merged = mapCarRow({
      ...existing.rows[0],
      ...payload,
      images: payload.images !== undefined ? payload.images : existing.rows[0].images,
    });

    const result = await pool.query(
      `UPDATE cars
       SET title = $2,
           price = $3,
           image = $4,
           images = $5::text[],
           brand = $6,
           year = $7,
           mileage = $8,
           fuel_type = $9,
           transmission = $10,
           location = $11,
           description = $12,
           phone = $13,
           is_featured = $14,
           status = $15
       WHERE id = $1
       RETURNING id, title, price, image, images, brand, year, mileage, fuel_type,
                 transmission, location, description, phone, is_featured, status, created_date`,
      carParams(merged)
    );

    return res.json(mapCarRow(result.rows[0]));
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/cars/:id", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM cars WHERE id = $1", [req.params.id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: "Car not found" });
    }
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/contact", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT phone FROM admin_contact WHERE id = 1");
    if (!result.rows.length || !result.rows[0].phone) {
      return res.json(null);
    }
    return res.json({ phone: result.rows[0].phone });
  } catch (error) {
    return next(error);
  }
});

app.put("/api/admin/contact", requireAuth, async (req, res, next) => {
  try {
    const phone = String(req.body?.phone || "").trim();
    const result = await pool.query(
      `INSERT INTO admin_contact (id, phone)
       VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone
       RETURNING phone`,
      [phone]
    );
    return res.json({ phone: result.rows[0].phone });
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/admin/contact", requireAuth, async (req, res, next) => {
  try {
    await pool.query(
      `INSERT INTO admin_contact (id, phone)
       VALUES (1, '')
       ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone`
    );
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/uploads", requireAuth, (req, res) => {
  const { filename, contentType, data } = req.body || {};

  if (!filename || !data) {
    return res.status(400).json({ message: "filename and data are required" });
  }

  const mimeType = resolveMimeType(filename, contentType);
  if (!mimeType) {
    return res.status(400).json({ message: "Unsupported image format" });
  }

  const base64 = String(data).includes(",") ? String(data).split(",").pop() : String(data);
  return res.status(201).json({
    file_url: `data:${mimeType};base64,${base64}`,
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      image TEXT NOT NULL,
      images TEXT[] NOT NULL DEFAULT '{}',
      brand TEXT NOT NULL DEFAULT '',
      year INTEGER,
      mileage TEXT NOT NULL DEFAULT '',
      fuel_type TEXT NOT NULL DEFAULT '',
      transmission TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'available',
      created_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_contact (
      id INTEGER PRIMARY KEY,
      phone TEXT NOT NULL DEFAULT ''
    )
  `);

  await pool.query(
    `INSERT INTO admin_contact (id, phone)
     VALUES (1, $1)
     ON CONFLICT (id) DO NOTHING`,
    ["+15125550123"]
  );

  const existingCars = await pool.query("SELECT COUNT(*)::int AS count FROM cars");
  if (existingCars.rows[0].count > 0) {
    return;
  }

  for (const car of defaultCars) {
    await pool.query(
      `INSERT INTO cars (
        id, title, price, image, images, brand, year, mileage, fuel_type,
        transmission, location, description, phone, is_featured, status, created_date
      ) VALUES (
        $1, $2, $3, $4, $5::text[], $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )`,
      carParams(car)
    );
  }
}

function carParams(car) {
  return [
    car.id,
    car.title,
    car.price,
    car.image,
    car.images || [],
    car.brand || "",
    car.year,
    car.mileage || "",
    car.fuel_type || "",
    car.transmission || "",
    car.location || "",
    car.description || "",
    car.phone || "",
    Boolean(car.is_featured),
    car.status || "available",
    car.created_date,
  ];
}

function mapCarRow(row) {
  return {
    id: row.id,
    title: row.title,
    price: row.price === null ? null : Number(row.price),
    image: row.image,
    images: Array.isArray(row.images) ? row.images : [],
    brand: row.brand || "",
    year: row.year,
    mileage: row.mileage || "",
    fuel_type: row.fuel_type || "",
    transmission: row.transmission || "",
    location: row.location || "",
    description: row.description || "",
    phone: row.phone || "",
    is_featured: Boolean(row.is_featured),
    status: row.status || "available",
    created_date:
      row.created_date instanceof Date
        ? row.created_date.toISOString()
        : new Date(row.created_date).toISOString(),
  };
}

function signToken(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  const [encodedPayload, signature] = String(token || "").split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  return next();
}

function sanitizeCarPayload(payload, partial) {
  const source = payload && typeof payload === "object" ? payload : {};
  const result = {};

  const stringFields = [
    "title",
    "image",
    "brand",
    "mileage",
    "fuel_type",
    "transmission",
    "location",
    "phone",
    "description",
    "status",
  ];

  for (const field of stringFields) {
    if (source[field] !== undefined || !partial) {
      result[field] = source[field] === undefined ? "" : String(source[field]).trim();
    }
  }

  if (source.price !== undefined || !partial) {
    result.price = source.price === undefined || source.price === "" ? null : Number(source.price);
  }

  if (source.year !== undefined || !partial) {
    result.year = source.year === undefined || source.year === "" ? null : Number(source.year);
  }

  if (source.is_featured !== undefined || !partial) {
    result.is_featured = Boolean(source.is_featured);
  }

  if (source.images !== undefined || !partial) {
    result.images = Array.isArray(source.images)
      ? source.images.map((entry) => String(entry).trim()).filter(Boolean)
      : [];
  }

  return result;
}

function validateCarPayload(payload, partial) {
  if ((!partial || payload.title !== undefined) && !payload.title) {
    return "Title is required";
  }
  if ((!partial || payload.image !== undefined) && !payload.image) {
    return "Main image is required";
  }
  if ((!partial || payload.price !== undefined) && (!Number.isFinite(payload.price) || payload.price <= 0)) {
    return "Valid price is required";
  }
  if (payload.year !== undefined && payload.year !== null && !Number.isFinite(payload.year)) {
    return "Year must be a number";
  }
  if (
    payload.status !== undefined &&
    payload.status &&
    !["available", "sold"].includes(payload.status)
  ) {
    return "Status must be available or sold";
  }
  return null;
}

function resolveMimeType(filename, contentType) {
  const loweredName = String(filename).toLowerCase();
  const loweredType = String(contentType || "").toLowerCase();

  if (loweredType.includes("png") || loweredName.endsWith(".png")) return "image/png";
  if (loweredType.includes("webp") || loweredName.endsWith(".webp")) return "image/webp";
  if (loweredType.includes("gif") || loweredName.endsWith(".gif")) return "image/gif";
  if (
    loweredType.includes("jpeg") ||
    loweredType.includes("jpg") ||
    loweredName.endsWith(".jpg") ||
    loweredName.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  return null;
}
