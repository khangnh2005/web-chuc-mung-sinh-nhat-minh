import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api/wishes' : '/api/wishes';

function App() {
  const [wishes, setWishes] = useState([]);
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [candleLit, setCandleLit] = useState(true);

  // Hiệu ứng bắn các giọt sữa trắng
  const fireMilkSplash = () => {
    confetti({
      particleCount: 140,
      spread: 75,
      startVelocity: 45,
      gravity: 1.2,
      scalar: 1.1,
      shapes: ['circle'],
      colors: ['#ffffff', '#f8fafc', '#fffbeb', '#e2e8f0'],
      origin: { y: 0.65 }
    });
  };

  useEffect(() => {
    fireMilkSplash();
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setWishes(data))
      .catch((err) => console.error('Lỗi tải lời chúc:', err));
  }, []);

  const handleBlowCandle = () => {
    setCandleLit(false);
    fireMilkSplash();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sender.trim() || !message.trim()) return;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, message }),
    });

    if (res.ok) {
      const created = await res.json();
      setWishes([created, ...wishes]);
      setSender('');
      setMessage('');
      fireMilkSplash();
    }
  };

  return (
    <div className="container">
      <header className="hero">
        <span className="badge">🎂 SPECIAL DAY</span>
        
        {/* Ảnh đại diện Bùi Thanh Minh */}
        <div className="avatar-wrapper">
          <img src="/images/avatar.jpg" alt="Bùi Thanh Minh" className="avatar-img" />
        </div>

        <h1>Chúc Mừng Sinh Nhật<br /><span>Bùi Thanh Minh</span> 🎉</h1>
        <p>Chúc Minh bước sang tuổi mới thật nhiều sức khỏe, niềm vui và thành công rực rỡ!</p>

        <div className="cake-box">
          <div className="cake-emoji">{candleLit ? '🎂🕯️' : '🎂✨'}</div>
          {candleLit ? (
            <button onClick={handleBlowCandle} className="btn-primary">
              🌬️ Ước một điều và Thổi nến
            </button>
          ) : (
            <div className="wish-granted">
              <p>✨ Điều ước của Bùi Thanh Minh chắc chắn sẽ thành hiện thực! ✨</p>
              <button onClick={fireMilkSplash} className="btn-secondary">🥛 Bắn sữa trắng</button>
            </div>
          )}
        </div>
      </header>

      {/* Khu vực 2 ảnh kỷ niệm phụ */}
      <section className="gallery-section">
        <h2>📸 Khoảnh khắc kỷ niệm</h2>
        <div className="gallery-grid">
          <div className="photo-card">
            <img src="/images/photo1.jpg" alt="Kỷ niệm 1" />
          </div>
          <div className="photo-card">
            <img src="/images/photo2.jpg" alt="Kỷ niệm 2" />
          </div>
        </div>
      </section>

      <section className="wish-section">
        <h2>💌 Gửi lời chúc tới Bùi Thanh Minh</h2>
        <form onSubmit={handleSubmit} className="wish-form">
          <input
            type="text"
            placeholder="Tên của bạn..."
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required
          />
          <textarea
            placeholder="Nhập lời chúc sinh nhật..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="3"
            required
          />
          <button type="submit" className="btn-primary">Gửi lời chúc 🚀</button>
        </form>

        <div className="wish-list">
          {wishes.map((w) => (
            <div key={w.id} className="wish-card">
              <div className="wish-header">
                <strong>{w.sender}</strong>
                <span>{w.time}</span>
              </div>
              <p>{w.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;