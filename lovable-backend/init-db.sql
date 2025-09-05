-- init-db.sql
-- Create database if not exists
CREATE DATABASE ai_website_builder;

-- Connect to the database
\c ai_website_builder;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'premium');
CREATE TYPE project_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE message_type AS ENUM ('generation', 'refinement', 'question');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    subscription_plan subscription_plan DEFAULT 'free',
    api_usage_count INTEGER DEFAULT 0,
    api_usage_limit INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    html_code TEXT,
    css_code TEXT,
    js_code TEXT,
    preview_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    status project_status DEFAULT 'draft',
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    generated_code TEXT,
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    model_used VARCHAR(100),
    message_type message_type DEFAULT 'generation',
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    html_code TEXT NOT NULL,
    css_code TEXT,
    js_code TEXT,
    preview_url VARCHAR(500),
    tags TEXT[],
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_premium BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    status_code INTEGER,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);

-- Full-text search index for projects
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Insert some sample templates
INSERT INTO templates (name, description, category, html_code, tags, is_premium) VALUES 
('Modern Portfolio', 'A clean, modern portfolio website perfect for developers and designers', 'portfolio', 
'<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #2c3e50; color: white; padding: 1rem 0; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .btn { background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; transition: background 0.3s; }
        .btn:hover { background: #c0392b; }
        section { padding: 80px 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        footer { background: #2c3e50; color: white; padding: 40px 0; text-align: center; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>John Doe</h1>
        </div>
    </header>
    <section class="hero">
        <div class="container">
            <h1>Full Stack Developer</h1>
            <p>Creating amazing web experiences with modern technologies</p>
            <a href="#contact" class="btn">Get In Touch</a>
        </div>
    </section>
    <section>
        <div class="container">
            <h2>About Me</h2>
            <p>I am a passionate full stack developer with 5+ years of experience in creating web applications using React, Node.js, and modern technologies.</p>
        </div>
    </section>
    <section>
        <div class="container">
            <h2>My Projects</h2>
            <div class="grid">
                <div class="card">
                    <h3>E-commerce Platform</h3>
                    <p>A full-featured e-commerce platform built with React and Node.js</p>
                </div>
                <div class="card">
                    <h3>Task Management App</h3>
                    <p>A collaborative task management application with real-time updates</p>
                </div>
                <div class="card">
                    <h3>Weather Dashboard</h3>
                    <p>A beautiful weather dashboard with interactive maps and forecasts</p>
                </div>
            </div>
        </div>
    </section>
    <footer id="contact">
        <div class="container">
            <h2>Contact Me</h2>
            <p>Email: john@example.com | Phone: (555) 123-4567</p>
        </div>
    </footer>
</body>
</html>', 
ARRAY['modern', 'portfolio', 'developer'], false),

('SaaS Landing Page', 'A high-converting landing page template for SaaS products', 'landing',
'<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaS Landing Page</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 0; text-align: center; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; font-weight: 700; }
        .hero p { font-size: 1.3rem; margin-bottom: 3rem; opacity: 0.9; }
        .btn-primary { background: #ff6b6b; color: white; padding: 15px 30px; font-size: 1.1rem; border: none; border-radius: 50px; cursor: pointer; transition: all 0.3s; }
        .btn-primary:hover { background: #ee5a5a; transform: translateY(-2px); }
        .features { padding: 100px 0; background: #f8f9fa; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; margin-top: 4rem; }
        .feature { text-align: center; padding: 2rem; }
        .feature-icon { width: 80px; height: 80px; background: #667eea; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; }
        .pricing { padding: 100px 0; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
        .pricing-card { background: white; padding: 3rem 2rem; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
        .price { font-size: 3rem; font-weight: 700; color: #667eea; margin: 1rem 0; }
        footer { background: #2c3e50; color: white; padding: 60px 0; text-align: center; }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>Grow Your Business Faster</h1>
            <p>The all-in-one platform that helps you manage customers, track sales, and grow your revenue</p>
            <button class="btn-primary">Start Free Trial</button>
        </div>
    </section>
    <section class="features">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 1rem;">Why Choose Our Platform?</h2>
            <div class="features-grid">
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <h3>Analytics Dashboard</h3>
                    <p>Get detailed insights into your business performance with our comprehensive analytics dashboard.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>Fast & Reliable</h3>
                    <p>Built on modern infrastructure to ensure your business runs smoothly 24/7.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <h3>Secure & Private</h3>
                    <p>Your data is protected with enterprise-grade security and privacy controls.</p>
                </div>
            </div>
        </div>
    </section>
    <section class="pricing">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 1rem;">Simple Pricing</h2>
            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>Starter</h3>
                    <div class="price">$29</div>
                    <p>Perfect for small teams</p>
                    <button class="btn-primary">Get Started</button>
                </div>
                <div class="pricing-card">
                    <h3>Professional</h3>
                    <div class="price">$99</div>
                    <p>Best for growing businesses</p>
                    <button class="btn-primary">Get Started</button>
                </div>
                <div class="pricing-card">
                    <h3>Enterprise</h3>
                    <div class="price">$299</div>
                    <p>For large organizations</p>
                    <button class="btn-primary">Contact Sales</button>
                </div>
            </div>
        </div>
    </section>
    <footer>
        <div class="container">
            <p>&copy; 2024 SaaS Platform. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>',
ARRAY['saas', 'landing', 'conversion'], false);

-- Create a default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, subscription_plan, api_usage_limit, is_active, email_verified) VALUES 
('admin@lovable.dev', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'premium', 1000, true, true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();