import { Link } from 'react-router-dom';
import { Megaphone, Radio, Shield, Zap } from 'lucide-react';
import '../styles/Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">📢</div>
        <nav className="landing-nav">
          <Link to="/dashboard" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">Crier</h1>
        <p className="hero-tagline">Broadcast to Discord. No bots. No tags. Just your voice.</p>
        <Link to="/dashboard" className="btn btn-accent btn-large">
          Launch Dashboard
        </Link>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={32} />
            </div>
            <h3>Multi-Server</h3>
            <p>Manage multiple Discord servers from one dashboard</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Radio size={32} />
            </div>
            <h3>Scheduled Announcements</h3>
            <p>Set announcements to broadcast at specific times</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Megaphone size={32} />
            </div>
            <h3>No BOT Tag</h3>
            <p>Messages appear from your custom name, not a bot</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={32} />
            </div>
            <h3>Free Forever</h3>
            <p>Everything runs in your browser. No backend. No limitations.</p>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="donation">
        <h2>Support the Project</h2>
        <p>Enjoying Crier? Consider supporting development:</p>
        <div className="donation-methods">
          <a href="https://ko-fi.com" target="_blank" rel="noopener noreferrer" className="donation-card">
            <strong>Ko-fi</strong>
            <p>Make a one-time or recurring donation</p>
          </a>
          <div className="donation-card esewa">
            <strong>eSewa</strong>
            <p>Support via eSewa: 98XXXXXXXX</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Built by Safalll</p>
        <a href="#" className="footer-link">GitHub</a>
      </footer>
    </div>
  );
}
