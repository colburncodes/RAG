const axios = require('axios');

class StockModel {
    constructor(apiKey) {
        this.ALPHA_VANTAGE_API_KEY = apiKey;
        this.stockData = {};
    }

    /**
     * Fetches stock data for a single symbol from the Alpha Vantage API.
     * @param {string} symbol - The stock symbol to fetch data for.
     * @param {string} startDate - The start date for the data range (YYYY-MM-DD).
     * @param {string} endDate - The end date for the data range (YYYY-MM-DD).
     * @returns {Object} An object containing the filtered stock data for the specified symbol and date range.
     */
    async fetchStockData(symbol, startDate, endDate) {
        try {
            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${this.ALPHA_VANTAGE_API_KEY}`;
            const response = await axios.get(url, {
                headers: {'User-Agent': 'request'}
            });

            if (response.data['Error Message']) {
                throw new Error(response.data['Error Message']);
            }

            const data = response.data['Time Series (Daily)'];
            const filteredData = Object.entries(data)
                .filter(([date]) => date >= startDate && date <= endDate)
                .reduce((acc, [date, values]) => {
                    acc[date] = values;
                    return acc;
                }, {});

            return { [symbol]: filteredData };
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error.message);
            return { [symbol]: null };
        }
    }

    /**
     * Fetches stock data for all specified assets from the Alpha Vantage API.
     * @returns{Object} An object containing the stock data for all specified assets.
     */
    async fetchAllStockData(assets, startYear, endYear) {
        const startDate = `${startYear}-01-01`;
        const endDate = `${endYear}-12-31`;
        const results = [];
        for (const symbol of assets) {
            console.log(`Fetching data for ${symbol}...`);
            results.push(await this.fetchStockData(symbol, startDate, endDate));
            await new Promise(resolve => setTimeout(resolve, 12000)); // 12-second delay
        }
        this.stockData = Object.assign({}, ...results);
        return this.stockData;
    }

    /**
     * Summarizes the stock data by calculating key metrics for each asset.
     * @param {Object} data - The full stock data object.
     * @returns {Object} A summary object containing key metrics for each asset.
     */
    summarizeStockData(data) {
        let summary = {};
        for (const [symbol, timeSeries] of Object.entries(data)) {
            if (!timeSeries) continue;
            const dates = Object.keys(timeSeries).sort();
            const firstDate = dates[0];
            const lastDate = dates[dates.length - 1];
            const firstClose = parseFloat(timeSeries[firstDate]['4. close']);
            const lastClose = parseFloat(timeSeries[lastDate]['4. close']);
            const percentChange = ((lastClose - firstClose) / firstClose) * 100;

            summary[symbol] = {
                startDate: firstDate,
                endDate: lastDate,
                startPrice: firstClose.toFixed(2),
                endPrice: lastClose.toFixed(2),
                percentChange: percentChange.toFixed(2)
            };
        }
        return summary;
    }
}

module.exports = StockModel;