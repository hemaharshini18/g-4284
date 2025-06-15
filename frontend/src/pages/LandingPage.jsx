
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaChartBar, 
  FaBrain,
  FaRobot,
  FaEye,
  FaFileAlt,
  FaArrowRight,
  FaPlay,
  FaCheck,
  FaStar,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaEnvelope
} from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // Handle email submission
  };

  const features = [
    {
      icon: FaUsers,
      title: "Employee Management",
      description: "Comprehensive employee profiles, onboarding, and lifecycle management with automated workflows."
    },
    {
      icon: FaCalendarAlt,
      title: "Attendance & Leave",
      description: "Smart attendance tracking, leave management, and automated policy enforcement."
    },
    {
      icon: FaMoneyBillWave,
      title: "Payroll Automation",
      description: "Intelligent payroll processing with tax calculations and compliance management."
    },
    {
      icon: FaChartLine,
      title: "Performance Reviews",
      description: "AI-powered performance analytics and automated feedback generation."
    },
    {
      icon: FaChartBar,
      title: "Reports & Dashboards",
      description: "Real-time insights and customizable dashboards for data-driven decisions."
    },
    {
      icon: FaBrain,
      title: "AI Analytics",
      description: "Predictive analytics for workforce planning and trend identification."
    }
  ];

  const aiFeatures = [
    {
      icon: FaRobot,
      title: "HR Chatbot",
      description: "24/7 AI assistant for employee queries and HR support"
    },
    {
      icon: FaBrain,
      title: "Attrition Predictor",
      description: "Predict employee turnover risk with machine learning"
    },
    {
      icon: FaEye,
      title: "Anomaly Detection",
      description: "Automatically detect unusual patterns in attendance and performance"
    },
    {
      icon: FaFileAlt,
      title: "Smart Reports",
      description: "AI-generated insights and recommendations from your HR data"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director at TechCorp",
      comment: "This AI-Enhanced HRMS reduced our manual work by 70% and improved employee satisfaction significantly.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "People Operations Manager",
      comment: "The attrition prediction feature helped us retain top talent and reduce turnover by 40%.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Chief Human Resources Officer",
      comment: "The anomaly detection caught issues we never would have noticed. It's like having an AI HR expert on our team.",
      rating: 5
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <FaBrain className="logo-icon" />
            <span>AI-Enhanced HRMS</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#ai-benefits">AI Benefits</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
            <Link to="/login" className="nav-cta">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Revolutionize HR with <span className="gradient-text">AI</span>
            </h1>
            <p className="hero-subtitle">
              An intelligent, all-in-one HRMS that automates, predicts, and empowers your workforce with cutting-edge artificial intelligence.
            </p>
            <div className="hero-cta">
              <Link to="/login" className="btn-primary">
                Get Started <FaArrowRight />
              </Link>
              <button className="btn-secondary">
                <FaPlay /> Watch Demo
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <FaBrain className="card-icon" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="container">
          <h2>About the Platform</h2>
          <p className="about-text">
            Our AI-Enhanced HRMS Platform is a comprehensive solution that combines traditional HR management 
            with advanced artificial intelligence. From employee onboarding to performance analytics, our system 
            automates workflows, provides predictive insights, and enables data-driven HR decisions that drive 
            organizational success.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="features">
        <div className="container">
          <h2>Core Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Benefits */}
      <section id="ai-benefits" className="ai-benefits">
        <div className="container">
          <h2>AI-Powered Benefits</h2>
          <p className="section-subtitle">
            Discover how artificial intelligence transforms HR decision-making and automates complex processes.
          </p>
          <div className="ai-features-grid">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="ai-feature-card">
                <div className="ai-feature-icon">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Onboard Employees</h3>
              <p>Seamlessly integrate new hires with automated onboarding workflows and document management.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Track Activities</h3>
              <p>Monitor attendance, performance, and engagement with real-time data collection and analysis.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Smart Insights</h3>
              <p>Receive AI-powered recommendations and predictions to optimize your workforce strategy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="screenshots">
        <div className="container">
          <h2>Platform Overview</h2>
          <div className="screenshots-grid">
            <div className="screenshot-placeholder">
              <FaChartBar className="placeholder-icon" />
              <span>Dashboard Analytics</span>
            </div>
            <div className="screenshot-placeholder">
              <FaUsers className="placeholder-icon" />
              <span>Employee Management</span>
            </div>
            <div className="screenshot-placeholder">
              <FaBrain className="placeholder-icon" />
              <span>AI Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <h2>What Our Clients Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p>"{testimonial.comment}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Try AI-Enhanced HRMS Today</h2>
          <p>Transform your HR operations with intelligent automation and insights.</p>
          <form onSubmit={handleSubmit} className="cta-form">
            <input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">
              Get Started <FaArrowRight />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <FaBrain className="logo-icon" />
                <span>AI-Enhanced HRMS</span>
              </div>
              <p>Revolutionizing human resources with artificial intelligence.</p>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Support</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#"><FaGithub /></a>
                <a href="#"><FaLinkedin /></a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaEnvelope /></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 AI-Enhanced HRMS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
