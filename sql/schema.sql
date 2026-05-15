-- =============================================
-- Trading Journal Database Schema
-- PostgreSQL
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Strategies table
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_pair VARCHAR(50) NOT NULL,
    trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
    entry_price DOUBLE PRECISION NOT NULL,
    exit_price DOUBLE PRECISION NOT NULL,
    lot_size DOUBLE PRECISION NOT NULL,
    stop_loss DOUBLE PRECISION NOT NULL,
    take_profit DOUBLE PRECISION NOT NULL,
    profit_loss DOUBLE PRECISION GENERATED ALWAYS AS (
        CASE
            WHEN trade_type = 'BUY' THEN (exit_price - entry_price) * lot_size
            ELSE (entry_price - exit_price) * lot_size
        END
    ) STORED,
    risk_reward_ratio DOUBLE PRECISION GENERATED ALWAYS AS (
        CASE
            WHEN trade_type = 'BUY' THEN
                ROUND((take_profit - entry_price) / NULLIF(entry_price - stop_loss, 0), 2)
            ELSE
                ROUND((entry_price - take_profit) / NULLIF(stop_loss - entry_price, 0), 2)
        END
    ) STORED,
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    strategy VARCHAR(100),
    session VARCHAR(20) CHECK (session IN ('London', 'New York', 'Asia')),
    emotions_before_trade TEXT,
    emotions_after_trade TEXT,
    notes TEXT,
    screenshots TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trade reviews table
CREATE TABLE trade_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL UNIQUE REFERENCES trades(id) ON DELETE CASCADE,
    what_went_right TEXT,
    what_went_wrong TEXT,
    lesson_learned TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_entry_time ON trades(entry_time);
CREATE INDEX idx_trades_strategy ON trades(strategy);
CREATE INDEX idx_trades_session ON trades(session);
CREATE INDEX idx_trades_asset_pair ON trades(asset_pair);
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_trade_reviews_trade_id ON trade_reviews(trade_id);