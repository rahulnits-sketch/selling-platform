import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Car Dealer Backend is running");
});

app.get("/api/cars", (req, res) => {
  res.json({
    data: [],
    message: "Add your backend routes and data here",
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
