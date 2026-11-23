import { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api/wishes' : '/api/wishes';

// Dán ID video YouTube "Vì sao tôi là gay remix" của bạn vào đây
const YOUTUBE_VIDEO_ID = 'THAY_ID_VIDEO_CUA_BAN_VAO_DAY';

function App() {
  const [wishes, setWishes] = useState([]);
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [candleLit, setCandleLit] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const canvasRef = useRef(null);
  const dropsRef = useRef([]);
  const splatsRef = useRef([]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const startMusic = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = splatsRef.current.length - 1; i >= 0; i--) {
        const s = splatsRef.current[i];
        s.y += s.dripSpeed;
        s.alpha -= 0.004;

        if (s.alpha <= 0) {
          splatsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (let i = dropsRef.current.length - 1; i >= 0; i--) {
        const d = dropsRef.current[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.45;

        if (Math.random() < 0.06 && d.y > 50 && d.y < canvas.height - 50) {
          splatsRef.current.push({
            x: d.x,
            y: d.y,
            radius: d.size * (1.2 + Math.random() * 1.5),
            alpha: 0.92,
            dripSpeed: 0.2 + Math.random() * 0.5
          });
        }

        if (d.y > canvas.height + 50 || d.x < -50 || d.x > canvas.width + 50) {
          dropsRef.current.splice(i, 1);
          continue;
        }

        const angle = Math.atan2(d.vy, d.vx);
        const speed = Math.hypot(d.vx, d.vy);
        const stretch = Math.min(speed * 1.4, 28);

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, d.size + stretch * 0.4, d.size * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const sprayMilk = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const origins = [
      { x: w * 0.5, y: h * 0.85 },
      { x: w * 0.25, y: h * 0.9 },
      { x: w * 0.75, y: h * 0.9 }
    ];

    origins.forEach((origin) => {
      for (let i = 0; i < 45; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const velocity = 10 + Math.random() * 18;
        dropsRef.current.push({
          x: origin.x + (Math.random() - 0.5) * 40,
          y: origin.y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: 3 + Math.random() * 6
        });
      }
    });
  };

  useEffect(() => {
    sprayMilk();
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setWishes(data))
      .catch((err) => console.error('Lỗi tải lời chúc:', err));
  }, []);

  const handleBlowCandle = () => {
    setCandleLit(false);
    sprayMilk();
    startMusic();
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
      sprayMilk();
      startMusic();
    }
  };

  return (
    <div className="container">
      {/* Trình phát nhạc YouTube chạy ngầm khi isPlaying = true */}
      {isPlaying && (
        <iframe
          width="0"
          height="0"
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}`}
          title="Nhạc nền"
          allow="autoplay; encrypted-media"
          style={{ display: 'none' }}
        />
      )}

      <button onClick={toggleMusic} className="music-toggle-btn">
        {isPlaying ? '🔊 Tắt nhạc Remix' : '🔇 Bật nhạc "Vì sao tôi là gay"'}
      </button>

      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      />

      <header className="hero">
        <span className="badge">🎂 SPECIAL DAY</span>
        
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
              <button onClick={sprayMilk} className="btn-secondary">🥛 Bắn sữa trắng</button>
            </div>
          )}
        </div>
      </header>

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