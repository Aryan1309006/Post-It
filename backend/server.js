const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const apiAuthRoutes = require("./routes/apiAuthRoutes");
const apiPostRoutes = require("./routes/apiPostRoutes");
const webRoutes = require("./routes/webRoutes");
const apiErrorHandler = require("./middleware/apiErrorHandler");

const app = express();

mongoose
  .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.use("/api/auth", apiAuthRoutes);
app.use("/api/posts", apiPostRoutes);
app.use("/", webRoutes);
app.use("/api", apiErrorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
