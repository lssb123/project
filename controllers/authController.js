const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../DbConnection/db");

exports.register = async (req, res) => {
  try {
    const { user_name, user_email, password, mobile } = req.body;

    // Check if user_email already exists
    connection.query(
      "SELECT * FROM users WHERE user_email = ?",
      [user_email],
      async (error, results) => {
        if (error) {
          console.error("Error checking existing user:", error);
          return res.status(500).json({ error: "Registration failed" });
        }

        if (results.length > 0) {
          return res.status(400).json({ error: "Email already exists" });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert new user
          connection.query(
            "INSERT INTO users (user_name, user_email, password, mobile) VALUES (?, ?, ?, ?)",
            [user_name, user_email, hashedPassword, mobile],
            (error, result) => {
              if (error) {
                console.error("Error inserting user:", error);
                return res.status(500).json({ error: "Registration failed" });
              }

              if (result.affectedRows === 1) {
                res
                  .status(201)
                  .json({ message: "User registered successfully" });
              } else {
                res.status(500).json({ error: "Registration failed" });
              }
            }
          );
        } catch (error) {
          console.error("Error during registration:", error);
          res.status(500).json({ error: "Registration failed" });
        }
      }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = (req, res) => {
  try {
    const { user_email, password } = req.body;

    // Query the user from the database
    connection.query(
      "SELECT * FROM users WHERE user_email = ?",
      [user_email],
      async (error, results) => {
        if (error) {
          console.error("Error querying user:", error);
          return res.status(500).json({ error: "Login failed" });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: "Authentication failed" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(401).json({ error: "Authentication failed" });
        }

        const token = jwt.sign(
          { userId: user.id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1h",
          }
        );

        res.cookie("jwt1", token, { httpOnly: true, secure: true });
        res.status(200).json({ message: "Login successful", token });
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
