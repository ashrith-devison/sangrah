package config

import (
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	DBUrl              string `mapstructure:"DBUrl"`
	JWTSecret          string `mapstructure:"JWTSecret"`
	RateLimit          int    `mapstructure:"RateLimit"`      // API calls per second
	StorageQuotaMB     int    `mapstructure:"StorageQuotaMB"` // Storage quota per user in MB
	PublicShareBaseURL string `mapstructure:"PublicShareBaseURL"`
}

func LoadConfig() (*Config, error) {
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()
	viper.BindEnv("DBUrl", "DB_URL")
	viper.BindEnv("JWTSecret", "JWT_SECRET")
	viper.BindEnv("RateLimit", "RATE_LIMIT")
	viper.BindEnv("StorageQuotaMB", "STORAGE_QUOTA_MB")
	viper.BindEnv("PublicShareBaseURL", "PUBLIC_SHARE_BASEURL")
	viper.SetDefault("RateLimit", 2)
	viper.SetDefault("StorageQuotaMB", 10)
	viper.SetDefault("PublicShareBaseURL", "http://localhost:8080/public/view?token=")
	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}
