const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const connection = require("./DbConnection/db");
const authRoute = require("./routes/authRoute");
const protectedRoute = require("./routes/protectedRoute");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRoute);
app.use("/protected", protectedRoute);

app.listen(3000, (req, res) => {
  console.log("Server is running on port 3000");
});
