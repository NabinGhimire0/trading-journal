package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type ForexService struct {
	apiKey string
	client *http.Client
	cache  map[string]cachedRates
}

type cachedRates struct {
	rates     map[string]float64
	timestamp time.Time
}

type ExchangeRateResponse struct {
	Result             string             `json:"result"`
	Provider           string             `json:"provider"`
	Documentation      string             `json:"documentation"`
	TermsOfUse         string             `json:"terms_of_use"`
	TimeLastUpdateUnix int64              `json:"time_last_update_unix"`
	TimeLastUpdateUTC  string             `json:"time_last_update_utc"`
	TimeNextUpdateUnix int64              `json:"time_next_update_unix"`
	TimeNextUpdateUTC  string             `json:"time_next_update_utc"`
	BaseCode           string             `json:"base_code"`
	ConversionRates    map[string]float64 `json:"conversion_rates"`
}

func NewForexService(apiKey string) *ForexService {
	return &ForexService{
		apiKey: apiKey,
		client: &http.Client{Timeout: 10 * time.Second},
		cache:  make(map[string]cachedRates),
	}
}

func (s *ForexService) GetRates(base string) (map[string]float64, error) {
	// Check cache (valid for 30 minutes)
	if cached, ok := s.cache[base]; ok && time.Since(cached.timestamp) < 30*time.Minute {
		return cached.rates, nil
	}

	url := fmt.Sprintf("https://v6.exchangerate-api.com/v6/%s/latest/%s", s.apiKey, base)

	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch rates: %v", err)
	}
	defer resp.Body.Close()

	var data ExchangeRateResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if data.Result != "success" {
		return nil, fmt.Errorf("API returned error: %s", data.Result)
	}

	// Cache the result
	s.cache[base] = cachedRates{
		rates:     data.ConversionRates,
		timestamp: time.Now(),
	}

	return data.ConversionRates, nil
}

func (s *ForexService) GetPopularPairs(base string) (map[string]interface{}, error) {
	rates, err := s.GetRates(base)
	if err != nil {
		return nil, err
	}

	popular := []string{"EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "CNY", "INR", "SGD"}
	result := make(map[string]interface{})

	for _, currency := range popular {
		if rate, ok := rates[currency]; ok {
			result[currency] = map[string]interface{}{
				"rate":   rate,
				"pair":   fmt.Sprintf("%s/%s", base, currency),
				"symbol": getCurrencySymbol(currency),
			}
		}
	}

	result["base"] = base
	result["last_updated"] = time.Now().Format(time.RFC3339)

	return result, nil
}

func getCurrencySymbol(code string) string {
	symbols := map[string]string{
		"USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥",
		"AUD": "A$", "CAD": "C$", "CHF": "CHF", "NZD": "NZ$",
		"CNY": "¥", "INR": "₹", "SGD": "S$",
	}
	if s, ok := symbols[code]; ok {
		return s
	}
	return code
}
