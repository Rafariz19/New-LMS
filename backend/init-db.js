const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
});

db.connect((err) => {
    if (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
    
    console.log("✓ Connected to MySQL");
    
    // Create database if not exists
    const createDbSql = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`;
    
    db.query(createDbSql, (err) => {
        if (err) {
            console.error("Database creation error:", err);
            db.end();
            process.exit(1);
        }
        
        console.log(`✓ Database '${process.env.DB_NAME}' ensured`);
        
        // Use the database
        db.query(`USE ${process.env.DB_NAME};`, (err) => {
            if (err) {
                console.error("Database selection error:", err);
                db.end();
                process.exit(1);
            }
            
            // Read schema file
            const schemaFile = __dirname + "/schema.sql";
            const schema = fs.readFileSync(schemaFile, "utf8");
            
            // Execute schema queries
            db.query(schema, (err) => {
                if (err) {
                    console.error("Schema creation error:", err);
                    db.end();
                    process.exit(1);
                }
                
                console.log("✓ Database schema created successfully!");
                console.log("\nDatabase is ready. Tables created:");
                console.log("  - users");
                console.log("  - students");
                console.log("  - teachers");
                console.log("  - classes");
                console.log("  - enrollments");
                console.log("  - assignments");
                console.log("  - submissions");
                console.log("  - materials");
                
                db.end();
                process.exit(0);
            });
        });
    });
});
