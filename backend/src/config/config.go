package config

import (
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	DBUrl     string `mapstructure:"DBUrl"`
	JWTSecret string `mapstructure:"JWTSecret"`
}

func LoadConfig() (*Config, error) {
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()
	viper.BindEnv("DBUrl", "DB_URL")
	viper.BindEnv("JWTSecret", "JWT_SECRET")
	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}
