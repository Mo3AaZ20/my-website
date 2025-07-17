const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static('../luxury-auth-site'));

// Initialize SQLite database
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error('Error creating users table', err.message);
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                subject TEXT NOT NULL,
                grade TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) {
                    console.error('Error creating results table', err.message);
                }
            });

            // Insert sample data into results table
            db.run(`INSERT OR IGNORE INTO results (user_id, subject, grade) VALUES
                (1, 'الرياضيات', 'ممتاز'),
                (1, 'الفيزياء', 'جيد جداً'),
                (1, 'الكيمياء', 'جيد')`);
        });
    }
});

// Register endpoint
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(query, [name, email, password], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
            }
            return res.status(500).json({ message: 'خطأ في الخادم' });
        }
        res.status(201).json({ message: 'تم التسجيل بنجاح' });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(query, [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'خطأ في الخادم' });
        }
        if (!row) {
            return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }
        res.json({ message: 'تم تسجيل الدخول بنجاح', user: { id: row.id, name: row.name, email: row.email } });
    });
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Endpoint to get results by user_id
app.get('/results', (req, res) => {
    const userId = req.query.user_id;
    if (!userId) {
        return res.status(400).json({ message: 'معرف المستخدم مطلوب' });
    }
    const query = 'SELECT subject, grade FROM results WHERE user_id = ?';
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'خطأ في الخادم' });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
