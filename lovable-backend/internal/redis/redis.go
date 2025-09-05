// internal/redis/redis.go - Replace your current redis.go with this:

package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"lovable-backend/internal/config"
)

type Client struct {
	Client *redis.Client   // Exported field
	Ctx    context.Context // Exported context field (uppercase!)
}

func Connect(cfg config.RedisConfig) *Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:         cfg.URL[8:], // Remove redis:// prefix
		Password:     cfg.Password,
		DB:           0,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		PoolSize:     10,
	})

	// Test connection
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		fmt.Printf("Redis connection failed: %v\n", err)
		return nil
	}

	return &Client{
		Client: rdb,
		Ctx:    ctx, // Use uppercase Ctx
	}
}

func (c *Client) Set(key string, value interface{}, ttl time.Duration) error {
	if c.Client == nil {
		return fmt.Errorf("redis client not available")
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return c.Client.Set(c.Ctx, key, data, ttl).Err()
}

func (c *Client) Get(key string, dest interface{}) error {
	if c.Client == nil {
		return fmt.Errorf("redis client not available")
	}

	val, err := c.Client.Get(c.Ctx, key).Result()
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(val), dest)
}

func (c *Client) Del(key string) error {
	if c.Client == nil {
		return fmt.Errorf("redis client not available")
	}

	return c.Client.Del(c.Ctx, key).Err()
}

func (c *Client) Exists(key string) bool {
	if c.Client == nil {
		return false
	}

	result, err := c.Client.Exists(c.Ctx, key).Result()
	return err == nil && result == 1
}

func (c *Client) Incr(key string) (int64, error) {
	if c.Client == nil {
		return 0, fmt.Errorf("redis client not available")
	}

	return c.Client.Incr(c.Ctx, key).Result()
}

func (c *Client) IncrBy(key string, value int64) (int64, error) {
	if c.Client == nil {
		return 0, fmt.Errorf("redis client not available")
	}

	return c.Client.IncrBy(c.Ctx, key, value).Result()
}

func (c *Client) SetTTL(key string, ttl time.Duration) error {
	if c.Client == nil {
		return fmt.Errorf("redis client not available")
	}

	return c.Client.Expire(c.Ctx, key, ttl).Err()
}

func (c *Client) CheckRateLimit(key string, limit int64, window time.Duration) (bool, int64, time.Time, error) {
	if c.Client == nil {
		return true, 0, time.Time{}, nil // Allow if Redis unavailable
	}

	count, err := c.Client.Incr(c.Ctx, key).Result()
	if err != nil {
		return true, 0, time.Time{}, err
	}

	if count == 1 {
		c.Client.Expire(c.Ctx, key, window)
	}

	ttl, _ := c.Client.TTL(c.Ctx, key).Result()
	resetTime := time.Now().Add(ttl)

	return count <= limit, limit - count, resetTime, nil
}

func (c *Client) Close() error {
	if c.Client != nil {
		return c.Client.Close()
	}
	return nil
}
