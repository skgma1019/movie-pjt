const express = require('express');
const app = express();
const PORT = 3000;
const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const path = require('path');
const cors = require('cors'); // CORS 미들웨어 추가
app.use(cors());

const db = new sqlite3.Database("./movies.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});


// API 엔드포인트 - 영화 리스트 반환
app.get('/movies', (req, res) => {
    const query = "SELECT id, title, poster_path, vote_average FROM movies";
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } 
        res.json(rows);
    });
});




// 영화 상세글글