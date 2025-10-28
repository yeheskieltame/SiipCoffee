package config

import (
	"os"
)

type Config struct {
	Port            string
	Environment     string
	DBType          string
	DBPath          string
	DBHost          string
	DBPort          string
	DBName          string
	DBUser          string
	DBPassword      string
	GeminiAPIKey    string
	GeminiModel     string
	JWTSecret       string
	JWTExpiresIn    string
	EthereumRPCURL  string
	ContractAddress string
	PrivateKey      string
	CafeName        string
	CafeAddress     string
	CafePhone       string
}

func Load() *Config {
	return &Config{
		Port:            getEnv("PORT", "8080"),
		Environment:     getEnv("ENVIRONMENT", "development"),
		DBType:          getEnv("DB_TYPE", "sqlite"),
		DBPath:          getEnv("DB_PATH", "./data/siipcoffe.db"),
		DBHost:          getEnv("DB_HOST", "127.0.0.1"),
		DBPort:          getEnv("DB_PORT", "3306"),
		DBName:          getEnv("DB_NAME", "siipcoffe_db"),
		DBUser:          getEnv("DB_USER", "root"),
		DBPassword:      getEnv("DB_PASSWORD", ""),
		GeminiAPIKey:    getEnv("GEMINI_API_KEY", ""),
		GeminiModel:     getEnv("GEMINI_MODEL", "gemini-2.5-flash"),
		JWTSecret:       getEnv("JWT_SECRET", "default-secret-key"),
		JWTExpiresIn:    getEnv("JWT_EXPIRES_IN", "24h"),
		EthereumRPCURL:  getEnv("ETHEREUM_RPC_URL", ""),
		ContractAddress: getEnv("CONTRACT_ADDRESS", ""),
		PrivateKey:      getEnv("PRIVATE_KEY", ""),
		CafeName:        getEnv("CAFE_NAME", "SiipCoffee"),
		CafeAddress:     getEnv("CAFE_ADDRESS", "Jl. Cafe No. 123, Jakarta"),
		CafePhone:       getEnv("CAFE_PHONE", "+62 812-3456-7890"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}