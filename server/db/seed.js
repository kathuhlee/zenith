const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function setup() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'setup.sql'), "utf8");
        await pool.query(sql);
        console.log("Tables created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error setting up tables:", error);
        process.exit(1);
    }
}

setup();
