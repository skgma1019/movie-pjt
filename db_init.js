const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const path = require('path');

// 엑셀 파일 로드
const workbook = xlsx.readFile(path.join(__dirname, 'movies.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 엑셀 데이터를 JSON으로 변환
const movies = xlsx.utils.sheet_to_json(worksheet);

// SQLite3 데이터베이스 연결
const db = new sqlite3.Database('movies.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// movies 테이블 생성
const createTableQuery = `
CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY,
    title TEXT,
    original_title TEXT,
    overview TEXT,
    release_date TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    popularity REAL,
    vote_average REAL,
    vote_count INTEGER,
    genre_ids TEXT
);
`;

db.run(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Table created or already exists.');
    }

    // 데이터 삽입
    const insertQuery = `
    INSERT OR IGNORE INTO movies (id, title, original_title, overview, release_date, poster_path, backdrop_path, popularity, vote_average, vote_count, genre_ids)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    

    movies.forEach((movie) => {
        db.run(insertQuery, [
            movie.ID,
            movie.Title,
            movie['Original Title'],
            movie.Overview,
            movie['Release Date'],
            movie['Poster Path'],
            movie['Backdrop Path'],
            movie.Popularity,
            movie['Vote Average'],
            movie['Vote Count'],
            movie['Genre IDs']
        ], (err) => {
            if (err) {
                console.error('Error inserting data:', err.message);
            }
        });
    });

    console.log('Data insertion complete.');
});
db.run("DELETE FROM movies", (err) => {
    if (err) {
        console.error("Error clearing table:", err.message);
    } else {
        console.log("Existing records cleared.");
    }
});

// 연결 종료
db.close();
