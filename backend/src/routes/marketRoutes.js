import { Router } from 'express';
import { fetchLiveIndicesData, searchStocks, getStockQuote, getStockShareholdingPattern } from '../services/marketData.js';
import { getHistoricalData } from '../services/upstox.js';

const router = Router();

router.get('/indices', async (req, res) => {
  try {
    const data = await fetchLiveIndicesData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching market indices route:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market indices', details: String(error) });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const results = await searchStocks(q);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in market search route:', error);
    res.status(500).json({ success: false, error: 'Failed to search market', details: String(error) });
  }
});

router.get('/quote', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    if (!symbol) return res.status(400).json({ success: false, error: 'Symbol parameter is required' });
    const quote = await getStockQuote(symbol);
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quote', details: String(error) });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { symbol, interval } = req.query;
    if (!symbol) return res.status(400).json({ success: false, error: 'Symbol parameter is required' });
    const data = await getHistoricalData(symbol, interval || '1day');
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history', details: String(error) });
  }
});

export default router;
