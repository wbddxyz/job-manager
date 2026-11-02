import express from "express";
import cors from "cors";
import { pool } from "./database.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT 1 AS database_connected"
    );

    res.json({
      status: "ok",
      message: "Job Manager API is running",
      database: result[0].database_connected === 1
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
      "SELECT * FROM customers ORDER BY created_at DESC"
    );

    res.json(customers);
  } catch (error) {
    console.error("Failed to retrieve customers:", error);

    res.status(500).json({
      error: "Failed to retrieve customers"
    });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Customer name is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES (?, ?, ?, ?)`,
      [name, email, phone, address]
    );

    res.status(201).json({
      id: Number(result.insertId),
      name,
      email,
      phone,
      address
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
app.post("/api/jobs", async (req, res) => {
  try {
    const {
      customer_id,
      title,
      description,
      status,
      price,
      due_date
    } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        error: "Customer is required"
      });
    }

    if (!title) {
      return res.status(400).json({
        error: "Job title is required"
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
        price || 0,
        due_date || null
      ]
    );

    res.status(201).json({
      id: Number(result.insertId),
      customer_id,
      title,
      description,
      status: status || "quoted",
      price: price || 0,
      due_date
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
