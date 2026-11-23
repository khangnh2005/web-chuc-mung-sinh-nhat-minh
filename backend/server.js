const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let wishes = [
  { id: 1, sender: "Khang", message: "Chúc mừng sinh nhật Bùi Thanh Minh! Tuổi mới code không bug, tiền đầy túi!", time: "23/11/2026" },
  { id: 2, sender: "Hội bạn thân", message: "Happy Birthday Minh nhé! Chúc ông luôn vui vẻ và đạt mọi mục tiêu!", time: "23/11/2026" }
];

app.get('/api/wishes', (req, res) => {
  res.json(wishes);
});

app.post('/api/wishes', (req, res) => {
  const { sender, message } = req.body;
  if (!sender || !message) {
    return res.status(400).json({ error: "Vui lòng nhập tên và lời chúc!" });
  }
  const newWish = {
    id: Date.now(),
    sender,
    message,
    time: new Date().toLocaleDateString('vi-VN')
  };
  wishes.unshift(newWish);
  res.status(201).json(newWish);
});

// Phục vụ giao diện React sau khi build (khi chạy trên Render)
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});