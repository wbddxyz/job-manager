import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { pool } from "./database.js";
import { customerSchema, jobSchema } from "./validation.js";

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3001;

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:3000"
).split(",").map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json({ limit: "10kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." }
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again later." }
});

app.use(apiLimiter);

async function demoLimitReached(table: "customers" | "jobs", maximum: number) {
  const result = await pool.query(
    `SELECT COUNT(*) AS total FROM ${table}`
  );

  return Number(result[0].total) >= maximum;
}



app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT 1 AS database_connected"
    );

    res.json({
      status: "ok",
      message: "Job Manager API is running",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const customers = await pool.query(
      `SELECT id, name, email, phone, address, created_at
       FROM customers
       ORDER BY created_at DESC`
    );

    res.json(customers);
  } catch (error) {
    console.error("Failed to retrieve customers:", error);

    res.status(500).json({
      error: "Failed to retrieve customers"
    });
  }
});

app.post("/api/customers", writeLimiter, async (req, res) => {
  try {
    const validation = customerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid customer details",
        details: validation.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const { name, email, phone, address } = validation.data;
    if (await demoLimitReached("customers", 100)) {
      return res.status(429).json({
        error: "The demo has reached its customer limit. Please try again later."
      });
    }


    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES (?, ?, ?, ?)`,
      [name, email || null, phone || null, address || null]
    );

    res.status(201).json({
      id: Number(result.insertId),
      name,
      email: email || null,
      phone: phone || null,
      address: address || null
    });
  } catch (error) {
    console.error("Failed to create customer:", error);

    res.status(500).json({
      error: "Failed to create customer"
    });
  }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await pool.query(`
      SELECT
        jobs.id,
        jobs.customer_id,
        jobs.title,
        jobs.description,
        jobs.status,
        jobs.price,
        jobs.due_date,
        jobs.created_at,
        customers.name AS customer_name
      FROM jobs
      INNER JOIN customers
        ON jobs.customer_id = customers.id
      ORDER BY jobs.created_at DESC
    `);

    res.json(jobs);
  } catch (error) {
    console.error("Failed to retrieve jobs:", error);

    res.status(500).json({
      error: "Failed to retrieve jobs"
    });
  }
});
app.post("/api/jobs", writeLimiter, async (req, res) => {
  try {
    const validation = jobSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid job details",
        details: validation.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const {
      customer_id,
      title,
      description,
      status,
      price,
      due_date
    } = validation.data;

    if (await demoLimitReached("jobs", 200)) {
      return res.status(429).json({
        error: "The demo has reached its job limit. Please try again later."
      });
    }

    const result = await pool.query(
      `INSERT INTO jobs
        (customer_id, title, description, status, price, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        title,
        description || null,
        status || "quoted",
        price ?? 0,
        due_date || null
      ]
    );

    res.status(201).json({
      id: Number(result.insertId),
      customer_id,
      title,
      description: description || null,
      status: status || "quoted",
      price: price ?? 0,
      due_date: due_date || null
    });
  } catch (error) {
    console.error("Failed to create job:", error);

    res.status(500).json({
      error: "Failed to create job"
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
