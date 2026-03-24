const express = require("express");
const cors = require("cors");

require("dotenv").config();

const sessionsRouter = require("./routes/sessions");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/sessions", sessionsRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
    res.json({ message: "Focus Tracker API is running!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
