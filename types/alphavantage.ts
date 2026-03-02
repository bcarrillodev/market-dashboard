// Alpha Vantage Stock Time Series Types
// https://www.alphavantage.co/documentation/#time-series-data

export interface StockDailyMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Output Size': string;
  '5. Time Zone': string;
}

export interface StockWeeklyMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Time Zone': string;
}

export interface StockDayData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface StockWeekData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface StockDailyResponse {
  'Meta Data': StockDailyMetaData;
  'Time Series (Daily)': Record<string, StockDayData>;
}

export interface StockWeeklyResponse {
  'Meta Data': StockWeeklyMetaData;
  'Weekly Time Series': Record<string, StockWeekData>;
}

// Alpha Vantage Digital Currency Types
// https://www.alphavantage.co/documentation/#digital-currency

export interface DigitalCurrencyDailyMetaData {
  '1. Information': string;
  '2. Digital Currency Code': string;
  '3. Digital Currency Name': string;
  '4. Market Code': string;
  '5. Market Name': string;
  '6. Last Refreshed': string;
  '7. Time Zone': string;
}

export interface DigitalCurrencyWeeklyMetaData {
  '1. Information': string;
  '2. Digital Currency Code': string;
  '3. Digital Currency Name': string;
  '4. Market Code': string;
  '5. Market Name': string;
  '6. Last Refreshed': string;
  '7. Time Zone': string;
}

export interface DigitalCurrencyDayData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface DigitalCurrencyWeekData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface DigitalCurrencyDailyResponse {
  'Meta Data': DigitalCurrencyDailyMetaData;
  'Time Series (Digital Currency Daily)': Record<string, DigitalCurrencyDayData>;
}

export interface DigitalCurrencyWeeklyResponse {
  'Meta Data': DigitalCurrencyWeeklyMetaData;
  'Time Series (Digital Currency Weekly)': Record<string, DigitalCurrencyWeekData>;
}

// Normalized types for easier consumption in components

// Base candle interface for consistent graph rendering
export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockCandle extends Candle {}

export interface CryptoCandle extends Candle {
  marketCap: number;
}

// Base time series interface for consistent graph rendering
export interface TimeSeries {
  symbol: string;
  lastRefreshed: string;
  timeZone: string;
  candles: Candle[];
}

export interface StockTimeSeries extends TimeSeries {
  candles: StockCandle[];
}

export interface CryptoTimeSeries extends TimeSeries {
  name: string;
  market: string;
  candles: CryptoCandle[];
}
