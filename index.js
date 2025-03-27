const express = require('express');
const app = express();
const PORT = 3000;
const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const path = require('path');
const cors = require('cors'); // CORS 미들웨어 추가

app.use(cors());
app.use(express.json()); // JSON 형식의 본문을 파싱
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded 데이터 파싱

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

const movies = [
  {
      id: 1,
      title: '영화 제목 1',
      original_title: 'Original Title 1',
      overview: '이것은 영화 1에 대한 간단한 설명입니다.',
      release_date: '2025-01-01',
      poster_path: '/path_to_poster_1.jpg',
      popularity: 50.5,
      vote_average: 8.5,
      vote_count: 1000,
  },
  {
      id: 2,
      title: '영화 제목 2',
      original_title: 'Original Title 2',
      overview: '이것은 영화 2에 대한 간단한 설명입니다.',
      release_date: '2024-11-15',
      poster_path: '/path_to_poster_2.jpg',
      popularity: 60.2,
      vote_average: 7.0,
      vote_count: 500,
  },
  // ... 더 많은 영화 데이터
];

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
app.get('/movies/:id', async (req, res) => {
  const movieId = req.params.id;


  try {
      const query = 'SELECT * FROM movies WHERE id = ?';
      db.get(query, [movieId], (err, movie) => {
          if (err) {
              console.error('DB 오류:', err);
              return res.status(500).json({ message: '서버 오류' });
          }

         

          if (!movie) {
           
              return res.status(404).json({ message: '영화를 찾을 수 없습니다.' });
          }

          res.json(movie); // 영화 데이터 반환
      });
  } catch (error) {
      
      res.status(500).json({ message: '서버 오류' });
  }
});


// 댓글 작성 API
app.post('/movies/:id/comments', (req, res) => {
  const movieId = req.params.id;
  const { author, content } = req.body;

  if (!author || !content) {
      return res.status(400).json({ message: '작성자와 내용이 필요합니다.' });
  }

  const insertCommentQuery = `
  INSERT INTO comments (movie_id, author, content)
  VALUES (?, ?, ?);
  `;

  db.run(insertCommentQuery, [movieId, author, content], function(err) {
      if (err) {
          console.error('Error inserting comment:', err.message);
          return res.status(500).json({ message: '댓글을 저장하는 데 실패했습니다.' });
      }

      res.status(201).json({
          id: this.lastID,
          movie_id: movieId,
          author,
          content,
          created_at: new Date().toISOString()
      });
  });
});

// 댓글 조회 API
app.get('/movies/:id/comments', (req, res) => {
  const movieId = req.params.id;

  const query = 'SELECT * FROM comments WHERE movie_id = ? ORDER BY created_at DESC';
  db.all(query, [movieId], (err, rows) => {
      if (err) {
          console.error('Error fetching comments:', err.message);
          return res.status(500).json({ message: '댓글을 가져오는 데 실패했습니다.' });
      }

      res.json(rows);
  });
});



