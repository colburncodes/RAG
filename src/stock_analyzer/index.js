const OpenAI = require('openai');
const axios = require('axios');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const context = [
    {
        role: 'system',
        content: 'You are a helpful chatbot specializing in stock market analysis.'
    }
];

let assets = [
    "AAPL",
    "AMZN",
    "BTCUSD",
    "GOOGL",
    "META",
    "MSFT",
    "SPY",
    "TSLA"
];

let startYear = "2022";
let endYear = "2023";

let stockData = {};

/**
 * Fetches stock data for a single symbol from the Alpha Vantage API.
 * @param {string} symbol - The stock symbol to fetch data for.
 * @param {string} startDate - The start date for the data range (YYYY-MM-DD).
 * @param {string} endDate - The end date for the data range (YYYY-MM-DD).
 * @returns {Object} An object containing the filtered stock data for the specified symbol and date range.
 */
async function fetchStockData(symbol, startDate, endDate) {
    try {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`;
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
 * @returns {Object} An object containing the stock data for all specified assets.
 */
async function fetchAllStockData() {
    const startDate = `${startYear}-01-01`;
    const endDate = `${endYear}-12-31`;
    const results = [];
    for (const symbol of assets) {
        console.log(`Fetching data for ${symbol}...`);
        results.push(await fetchStockData(symbol, startDate, endDate));
        await new Promise(resolve => setTimeout(resolve, 12000)); // 12-second delay
    }
    return Object.assign({}, ...results);
}

/**
 * Summarizes the stock data by calculating key metrics for each asset.
 * @param {Object} data - The full stock data object.
 * @returns {Object} A summary object containing key metrics for each asset.
 */
function summarizeStockData(data) {
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

/**
 * Analyzes the summarized stock data using OpenAI's GPT model.
 * @param {Object} summary - The summarized stock data.
 */
async function analyzeStockData(summary) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        temperature: 0,
        messages: [
            ...context,
            {
                role: "user",
                content: `Analyze the following summary of stock data and provide insights: ${JSON.stringify(summary)}`
            }
        ],
    });

    console.log("Analysis:", response.choices[0].message.content);
}

/**
 * The main function that orchestrates the entire process of fetching,
 * summarizing, and analyzing stock data.
 */
async function main() {
    try {
        console.log("Fetching stock data...");
        stockData = await fetchAllStockData();
        console.log("Stock data fetched successfully.");

        const summary = summarizeStockData(stockData);
        console.log("Data summary:", JSON.stringify(summary, null, 2));

        console.log("Analyzing stock data...");
        await analyzeStockData(summary);

        console.log("\nEnter a question about the stock data (or 'exit' to quit):");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// Set up the input stream to handle user queries
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (input) => {
    const userInput = input.trim();
    if (userInput.toLowerCase() === 'exit') {
        console.log("Exiting...");
        process.exit(0);
    }

    context.push({
        role: "user",
        content: userInput
    });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            temperature: 0,
            messages: context,
        });
        console.log("Response:", response.choices[0].message.content);
    } catch (error) {
        console.error("Error getting response:", error);
    }

    console.log("\nEnter another question (or 'exit' to quit):");
});

// Start the main function
main();