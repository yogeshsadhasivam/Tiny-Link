const express = require("express");
const path = require("path");
const cors = require("cors");
const sequelize = require("./database.js");
const dotenv = require("dotenv");
const {
  healtCheck,
  getAllLinks,
  createNewLink,
  getSingleLink,
  deleteLink,
  redirectLink,
} = require("./controller/linkcontroller.js");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/healthz", healtCheck);

app.get("/api/links", getAllLinks);

app.post("/api/links", createNewLink);

app.get("/api/links/:code", getSingleLink);

app.delete("/api/links/:code", deleteLink);

app.get("/code/:code", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "code.html"));
});

app.get("/:code", redirectLink);

const PORT = process.env.PORT || 7000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
