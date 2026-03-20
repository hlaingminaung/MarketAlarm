/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  BellOff, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Clock,
  Settings,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Constants ---
const ASSETS_MAPPING: Record<string, any[]> = {
  finnhub: [
    { id: 'BINANCE:BTCUSDT', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'QQQ', symbol: 'US100', name: 'Nasdaq 100', type: 'stock' },
    { id: 'SPY', symbol: 'US500', name: 'S&P 500', type: 'stock' },
    { id: 'OANDA:EUR_USD', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
    { id: 'OANDA:GBP_USD', symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
    { id: 'OANDA:USD_JPY', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  ],
  twelvedata: [
    { id: 'BTC/USD', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'QQQ', symbol: 'US100', name: 'Nasdaq 100', type: 'stock' },
    { id: 'SPY', symbol: 'US500', name: 'S&P 500', type: 'stock' },
    { id: 'EUR/USD', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
    { id: 'GBP/USD', symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
    { id: 'USD/JPY', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  ],
  alphavantage: [
    { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'QQQ', symbol: 'US100', name: 'Nasdaq 100', type: 'stock' },
    { id: 'SPY', symbol: 'US500', name: 'S&P 500', type: 'stock' },
    { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
    { id: 'GBPUSD', symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
    { id: 'USDJPY', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  ],
  polygon: [
    { id: 'X:BTCUSD', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'QQQ', symbol: 'US100', name: 'Nasdaq 100', type: 'stock' },
    { id: 'SPY', symbol: 'US500', name: 'S&P 500', type: 'stock' },
    { id: 'C:EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
    { id: 'C:GBPUSD', symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
    { id: 'C:USDJPY', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  ],
  fmp: [
    { id: 'BTCUSD', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'QQQ', symbol: 'US100', name: 'Nasdaq 100', type: 'stock' },
    { id: 'SPY', symbol: 'US500', name: 'S&P 500', type: 'stock' },
    { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
    { id: 'GBPUSD', symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
    { id: 'USDJPY', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  ],
  marketstack: [
    { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'QQQ', symbol: 'US100', name: 'Nasdaq 100', type: 'stock' },
    { id: 'SPY', symbol: 'US500', name: 'S&P 500', type: 'stock' },
  ],
  iexcloud: [
    { id: 'BTCUSD', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'QQQ', symbol: 'US100', name: 'Nasdaq 100', type: 'stock' },
    { id: 'SPY', symbol: 'US500', name: 'S&P 500', type: 'stock' },
  ],
  cryptocompare: [
    { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'ETH', symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
    { id: 'SOL', symbol: 'SOL', name: 'Solana', type: 'crypto' },
    { id: 'BNB', symbol: 'BNB', name: 'BNB', type: 'crypto' },
    { id: 'XRP', symbol: 'XRP', name: 'XRP', type: 'crypto' },
  ],
  coingecko: [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', type: 'crypto' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', type: 'crypto' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', type: 'crypto' },
  ],
  coinmarketcap: [
    { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'ETH', symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
    { id: 'SOL', symbol: 'SOL', name: 'Solana', type: 'crypto' },
    { id: 'BNB', symbol: 'BNB', name: 'BNB', type: 'crypto' },
    { id: 'XRP', symbol: 'XRP', name: 'XRP', type: 'crypto' },
  ],
  eodhistoricaldata: [
    { id: 'BTC-USD.CC', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'AAPL.US', symbol: 'AAPL', name: 'Apple', type: 'stock' },
    { id: 'MSFT.US', symbol: 'MSFT', name: 'Microsoft', type: 'stock' },
    { id: 'EURUSD.FOREX', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
  ],
  barchart: [
    { id: 'BTCUSD', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'AAPL', symbol: 'AAPL', name: 'Apple', type: 'stock' },
    { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
  ],
  custom: [
    { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
    { id: 'ETH', symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  ]
};

const ALARM_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3'; // Loud alarm sound

// --- Types ---
interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
}

interface PriceData {
  [key: string]: {
    price: string;
  } | string;
}

export default function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [triggeredAlert, setTriggeredAlert] = useState<Alert | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // API Settings
  const [apiProvider, setApiProvider] = useState<string>('finnhub');
  const [userApiKey, setUserApiKey] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Form state
  const [newSymbol, setNewSymbol] = useState(ASSETS_MAPPING['finnhub'][0].id);
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [newCondition, setNewCondition] = useState<'above' | 'below'>('above');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Local Storage Persistence ---
  useEffect(() => {
    const savedProvider = localStorage.getItem('market_alarm_provider');
    const savedKey = localStorage.getItem('market_alarm_key');
    const savedCustomUrl = localStorage.getItem('market_alarm_custom_url');
    const savedAlerts = localStorage.getItem('market_alarm_alerts');

    if (savedProvider) setApiProvider(savedProvider);
    if (savedKey) setUserApiKey(savedKey);
    if (savedCustomUrl) setCustomApiUrl(savedCustomUrl);
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
  }, []);

  useEffect(() => {
    setNewSymbol(ASSETS_MAPPING[apiProvider][0].id);
  }, [apiProvider]);

  // --- Alerts Logic ---
  const addAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetPrice) return;

    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: newSymbol,
      targetPrice: parseFloat(newTargetPrice),
      condition: newCondition,
      isActive: true,
      createdAt: Date.now()
    };

    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    localStorage.setItem('market_alarm_alerts', JSON.stringify(updatedAlerts));
    setNewTargetPrice('');
  };

  const deleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(a => a.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('market_alarm_alerts', JSON.stringify(updatedAlerts));
  };

  const toggleAlert = (alert: Alert) => {
    const updatedAlerts = alerts.map(a => 
      a.id === alert.id ? { ...a, isActive: !a.isActive } : a
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('market_alarm_alerts', JSON.stringify(updatedAlerts));
  };

  // --- Price Monitoring ---
  const fetchPrices = useCallback(async () => {
    const defaultKeys: Record<string, string | undefined> = {
      finnhub: import.meta.env.VITE_FINNHUB_API_KEY,
      twelvedata: import.meta.env.VITE_TWELVE_DATA_API_KEY,
      alphavantage: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
      polygon: import.meta.env.VITE_POLYGON_API_KEY,
      fmp: import.meta.env.VITE_FMP_API_KEY,
      marketstack: import.meta.env.VITE_MARKETSTACK_API_KEY,
      iexcloud: import.meta.env.VITE_IEX_CLOUD_API_KEY,
      cryptocompare: import.meta.env.VITE_CRYPTOCOMPARE_API_KEY,
      coinmarketcap: import.meta.env.VITE_CMC_API_KEY,
      eodhistoricaldata: import.meta.env.VITE_EOD_HISTORICAL_DATA_API_KEY,
      barchart: import.meta.env.VITE_BARCHART_API_KEY,
    };

    const effectiveApiKey = userApiKey || defaultKeys[apiProvider];
    // CoinGecko doesn't strictly require a key for basic public API
    if (isFetching || (!effectiveApiKey && apiProvider !== 'coingecko')) return;
    setIsFetching(true);
    try {
      const newPrices: Record<string, number> = {};
      const currentAssets = ASSETS_MAPPING[apiProvider];

      if (apiProvider === 'finnhub') {
        await Promise.all(currentAssets.map(async (asset) => {
          try {
            const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${asset.id}&token=${effectiveApiKey}`);
            const data = await response.json();
            if (data.c) newPrices[asset.id] = data.c;
          } catch (err) { console.error(`Error fetching ${asset.id}:`, err); }
        }));
      } else if (apiProvider === 'twelvedata') {
        const symbols = currentAssets.map(a => a.id).join(',');
        const response = await fetch(`https://api.twelvedata.com/price?symbol=${symbols}&apikey=${effectiveApiKey}`);
        const data = await response.json();
        if (currentAssets.length > 1) {
          Object.keys(data).forEach(symbol => {
            if (data[symbol].price) newPrices[symbol] = parseFloat(data[symbol].price);
          });
        } else if (data.price) {
          newPrices[currentAssets[0].id] = parseFloat(data.price);
        }
      } else if (apiProvider === 'alphavantage') {
        await Promise.all(currentAssets.map(async (asset) => {
          try {
            const endpoint = asset.type === 'crypto' ? 'CRYPTO_INTRADAY&symbol=' + asset.id + '&market=USD&interval=1min' : 'GLOBAL_QUOTE&symbol=' + asset.id;
            const response = await fetch(`https://www.alphavantage.co/query?function=${endpoint}&apikey=${effectiveApiKey}`);
            const data = await response.json();
            if (data['Global Quote'] && data['Global Quote']['05. price']) {
              newPrices[asset.id] = parseFloat(data['Global Quote']['05. price']);
            } else if (data['Time Series Crypto (1min)']) {
              const lastTime = Object.keys(data['Time Series Crypto (1min)'])[0];
              newPrices[asset.id] = parseFloat(data['Time Series Crypto (1min)'][lastTime]['1. open']);
            }
          } catch (err) { console.error(`Error fetching ${asset.id}:`, err); }
        }));
      } else if (apiProvider === 'polygon') {
        await Promise.all(currentAssets.map(async (asset) => {
          try {
            const response = await fetch(`https://api.polygon.io/v2/last/trade/${asset.id}?apiKey=${effectiveApiKey}`);
            const data = await response.json();
            if (data.results && data.results.p) newPrices[asset.id] = data.results.p;
          } catch (err) { console.error(`Error fetching ${asset.id}:`, err); }
        }));
      } else if (apiProvider === 'fmp') {
        const symbols = currentAssets.map(a => a.id).join(',');
        const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${effectiveApiKey}`);
        const data = await response.json();
        data.forEach((item: any) => {
          newPrices[item.symbol] = item.price;
        });
      } else if (apiProvider === 'marketstack') {
        const symbols = currentAssets.map(a => a.id).join(',');
        const response = await fetch(`http://api.marketstack.com/v1/tickers/${symbols}/eod/latest?access_key=${effectiveApiKey}`);
        const data = await response.json();
        if (data.data) {
          data.data.forEach((item: any) => {
            newPrices[item.symbol] = item.last;
          });
        }
      } else if (apiProvider === 'iexcloud') {
        await Promise.all(currentAssets.map(async (asset) => {
          try {
            const response = await fetch(`https://cloud.iexapis.com/stable/stock/${asset.id}/quote?token=${effectiveApiKey}`);
            const data = await response.json();
            if (data.latestPrice) newPrices[asset.id] = data.latestPrice;
          } catch (err) { console.error(`Error fetching ${asset.id}:`, err); }
        }));
      } else if (apiProvider === 'cryptocompare') {
        const symbols = currentAssets.map(a => a.id).join(',');
        const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD&api_key=${effectiveApiKey}`);
        const data = await response.json();
        Object.keys(data).forEach(symbol => {
          newPrices[symbol] = data[symbol].USD;
        });
      } else if (apiProvider === 'coingecko') {
        const ids = currentAssets.map(a => a.id).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const data = await response.json();
        currentAssets.forEach(asset => {
          if (data[asset.id]) newPrices[asset.id] = data[asset.id].usd;
        });
      } else if (apiProvider === 'coinmarketcap') {
        const symbols = currentAssets.map(a => a.id).join(',');
        const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&CMC_PRO_API_KEY=${effectiveApiKey}`);
        const data = await response.json();
        if (data.data) {
          Object.keys(data.data).forEach(symbol => {
            newPrices[symbol] = data.data[symbol].quote.USD.price;
          });
        }
      } else if (apiProvider === 'eodhistoricaldata') {
        await Promise.all(currentAssets.map(async (asset) => {
          try {
            const response = await fetch(`https://eodhistoricaldata.com/api/real-time/${asset.id}?api_token=${effectiveApiKey}&fmt=json`);
            const data = await response.json();
            if (data.close) newPrices[asset.id] = data.close;
          } catch (err) { console.error(`Error fetching ${asset.id}:`, err); }
        }));
      } else if (apiProvider === 'barchart') {
        const symbols = currentAssets.map(a => a.id).join(',');
        const response = await fetch(`https://marketdata.barchart.com/getQuote.json?apikey=${effectiveApiKey}&symbols=${symbols}`);
        const data = await response.json();
        if (data.results) {
          data.results.forEach((item: any) => {
            newPrices[item.symbol] = item.lastPrice;
          });
        }
      } else if (apiProvider === 'custom' && customApiUrl) {
        await Promise.all(currentAssets.map(async (asset) => {
          try {
            // Replace placeholders in custom URL
            const url = customApiUrl
              .replace('{{symbol}}', asset.id)
              .replace('{{key}}', effectiveApiKey || '');
            
            const response = await fetch(url);
            const data = await response.json();
            
            // Try common price fields
            const price = data.price || data.last || data.c || data.usd || (data.quote && data.quote.USD && data.quote.USD.price);
            if (price) newPrices[asset.id] = parseFloat(price);
          } catch (err) { console.error(`Error fetching custom ${asset.id}:`, err); }
        }));
      }
      
      setPrices(newPrices);
    } catch (error) {
      console.error('Price fetch error:', error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, apiProvider, userApiKey]);

  useEffect(() => {
    const defaultKeys: Record<string, string | undefined> = {
      finnhub: import.meta.env.VITE_FINNHUB_API_KEY,
      twelvedata: import.meta.env.VITE_TWELVE_DATA_API_KEY,
      alphavantage: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
      polygon: import.meta.env.VITE_POLYGON_API_KEY,
      fmp: import.meta.env.VITE_FMP_API_KEY,
      marketstack: import.meta.env.VITE_MARKETSTACK_API_KEY,
      iexcloud: import.meta.env.VITE_IEX_CLOUD_API_KEY,
      cryptocompare: import.meta.env.VITE_CRYPTOCOMPARE_API_KEY,
      coinmarketcap: import.meta.env.VITE_CMC_API_KEY,
      eodhistoricaldata: import.meta.env.VITE_EOD_HISTORICAL_DATA_API_KEY,
      barchart: import.meta.env.VITE_BARCHART_API_KEY,
    };
    const effectiveApiKey = userApiKey || defaultKeys[apiProvider];
    if (effectiveApiKey || apiProvider === 'coingecko' || (apiProvider === 'custom' && customApiUrl)) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchPrices, apiProvider, userApiKey, customApiUrl]);

  const saveSettings = () => {
    localStorage.setItem('market_alarm_provider', apiProvider);
    localStorage.setItem('market_alarm_key', userApiKey);
    localStorage.setItem('market_alarm_custom_url', customApiUrl);
    setShowSettings(false);
    fetchPrices();
  };

  // --- Alarm Logic ---
  useEffect(() => {
    if (!prices || alerts.length === 0) return;

    const activeAlerts = alerts.filter(a => a.isActive);
    for (const alert of activeAlerts) {
      const currentPrice = prices[alert.symbol];
      if (!currentPrice) continue;

      const isTriggered = 
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (isTriggered) {
        triggerAlarm(alert);
        break; // Only trigger one at a time for simplicity
      }
    }
  }, [prices, alerts]);

  const triggerAlarm = (alert: Alert) => {
    if (isAlarmActive) return;
    
    setIsAlarmActive(true);
    setTriggeredAlert(alert);
    
    if (!isMuted) {
      if (!audioRef.current) {
        audioRef.current = new Audio(ALARM_SOUND_URL);
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(e => console.error('Audio play failed:', e));
    }

    // Deactivate the alert so it doesn't keep triggering
    const updatedAlerts = alerts.map(a => 
      a.id === alert.id ? { ...a, isActive: false, triggeredAt: Date.now() } : a
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('market_alarm_alerts', JSON.stringify(updatedAlerts));
  };

  const stopAlarm = () => {
    setIsAlarmActive(false);
    setTriggeredAlert(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-zinc-950" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight italic serif leading-none">Market Alarm</h1>
              <span className="text-[10px] text-zinc-500 font-mono mt-0.5">hma.connect@proton.me</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 rounded-full transition-colors",
                showSettings ? "bg-emerald-500/20 text-emerald-500" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              )}
              title="API Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                API Configuration
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-zinc-500 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Data Provider</label>
                <select 
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="finnhub">Finnhub</option>
                  <option value="twelvedata">Twelve Data</option>
                  <option value="alphavantage">Alpha Vantage</option>
                  <option value="polygon">Polygon.io</option>
                  <option value="fmp">Financial Modeling Prep</option>
                  <option value="marketstack">MarketStack</option>
                  <option value="iexcloud">IEX Cloud</option>
                  <option value="cryptocompare">CryptoCompare</option>
                  <option value="coingecko">CoinGecko</option>
                  <option value="coinmarketcap">CoinMarketCap</option>
                  <option value="eodhistoricaldata">EOD Historical Data</option>
                  <option value="barchart">Barchart</option>
                  <option value="custom">Custom Provider</option>
                </select>
                <p className="text-[10px] text-zinc-500">
                  {apiProvider === 'finnhub' && 'Finnhub: Best for US stocks and crypto.'}
                  {apiProvider === 'twelvedata' && 'Twelve Data: Global stocks, forex, and crypto.'}
                  {apiProvider === 'alphavantage' && 'Alpha Vantage: Comprehensive market data.'}
                  {apiProvider === 'polygon' && 'Polygon.io: Real-time market data.'}
                  {apiProvider === 'fmp' && 'FMP: Financial Modeling Prep data.'}
                  {apiProvider === 'marketstack' && 'MarketStack: Global stock market data.'}
                  {apiProvider === 'iexcloud' && 'IEX Cloud: Real-time stock quotes.'}
                  {apiProvider === 'cryptocompare' && 'CryptoCompare: Leading crypto data.'}
                  {apiProvider === 'coingecko' && 'CoinGecko: Free crypto data (no key required).'}
                  {apiProvider === 'coinmarketcap' && 'CoinMarketCap: Professional crypto data.'}
                  {apiProvider === 'eodhistoricaldata' && 'EOD Historical Data: Global coverage.'}
                  {apiProvider === 'barchart' && 'Barchart: Professional market data.'}
                  {apiProvider === 'custom' && 'Custom: Use your own API endpoint. Use {{symbol}} and {{key}} as placeholders.'}
                </p>
              </div>
              
              {apiProvider === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Custom API Endpoint</label>
                  <input 
                    type="text"
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    placeholder="https://api.example.com/price?s={{symbol}}&k={{key}}"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                  />
                  <p className="text-[10px] text-zinc-500">
                    The URL must return a JSON with a 'price' field.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Personal API Key</label>
                <input 
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="Paste your API key here"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                />
                <p className="text-[10px] text-zinc-500">
                  Leave empty to use the default system key (if available).
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={saveSettings}
                className="px-6 py-2.5 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Save Configuration
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Create Alert */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  New Alert
                </h3>
                <form onSubmit={addAlert} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Asset</label>
                    <select 
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                    >
                      {ASSETS_MAPPING[apiProvider].map(asset => (
                        <option key={asset.id} value={asset.id}>{asset.name} ({asset.symbol})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCondition('above')}
                      className={cn(
                        "py-2 rounded-xl border text-sm font-semibold transition-all",
                        newCondition === 'above' 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      Price Above
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCondition('below')}
                      className={cn(
                        "py-2 rounded-xl border text-sm font-semibold transition-all",
                        newCondition === 'below' 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      Price Below
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Target Price (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                      <input 
                        type="number"
                        step="any"
                        required
                        value={newTargetPrice}
                        onChange={(e) => setNewTargetPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                  >
                    Set Alert
                  </button>
                </form>
              </div>

              {/* Live Prices Widget */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Live Prices</h3>
                  <button onClick={fetchPrices} className={cn("text-zinc-500 hover:text-emerald-500 transition-colors", isFetching && "animate-spin")}>
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {ASSETS_MAPPING[apiProvider].map(asset => (
                    <div key={asset.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{asset.symbol}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">{asset.name}</span>
                      </div>
                      <span className="font-mono text-sm">
                        {prices[asset.id] ? `$${prices[asset.id].toLocaleString()}` : '---'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Alerts List */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  Your Alerts
                </h3>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              <AnimatePresence mode="popLayout">
                {alerts.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-12 text-center"
                  >
                    <p className="text-zinc-500">No alerts set yet.</p>
                  </motion.div>
                ) : (
                  alerts.map(alert => {
                    const asset = ASSETS_MAPPING[apiProvider].find(a => a.id === alert.symbol);
                    const currentPrice = prices[alert.symbol];
                    
                    return (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between group transition-all",
                          !alert.isActive && "opacity-60 grayscale-[0.5]"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            alert.condition === 'above' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            {alert.condition === 'above' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{asset?.symbol || alert.symbol}</span>
                              <span className="text-xs text-zinc-500">{alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-zinc-400">
                              Current: <span className="font-mono">${currentPrice?.toLocaleString() || '---'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAlert(alert)}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              alert.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                            )}
                          >
                            {alert.isActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-2 bg-zinc-800 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

      {/* Alarm Overlay */}
      <AnimatePresence>
        {isAlarmActive && triggeredAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border-2 border-emerald-500 rounded-[2rem] p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center animate-bounce">
                  <AlertTriangle className="w-10 h-10 text-zinc-950" />
                </div>
              </div>
              
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Price Alert!</h2>
              <p className="text-zinc-400 mb-8">
                <span className="font-bold text-zinc-100">{ASSETS_MAPPING[apiProvider].find(a => a.id === triggeredAlert.symbol)?.name}</span> has hit your target of <span className="font-bold text-emerald-500">${triggeredAlert.targetPrice.toLocaleString()}</span>.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={stopAlarm}
                  className="w-full py-4 bg-emerald-500 text-zinc-950 font-black text-xl rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                >
                  DISMISS ALARM
                </button>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Stay alert, stay profitable</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-900 text-center">
        <p className="text-xs text-zinc-600 uppercase tracking-widest">
          Market Alarm &copy; 2026 &bull; Real-time data via Twelve Data
        </p>
      </footer>
    </div>
  );
}
