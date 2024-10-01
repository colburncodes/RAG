require('dotenv').config();
const StockModel = require('./models/model');
const StockView = require('./templates/view');
const StockController = require('./controllers/controller');


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

const model = new StockModel(process.env.ALPHA_API_API_KEY);
const view = new StockView();
const controller = new StockController(model, view, process.env.OPENAI_API_KEY);

/**
 * The main function that orchestrates the entire process of fetching,
 * summarizing, and analyzing stock data.
 */
async function main() {
    try {
        await controller.fetchAndAnalyzeStocks(assets, startYear, endYear);

        process.stdin.setEncoding('utf8');
        process.stdin.on('data', async (input) => {
            await controller.handleUserInput(input.trim());
        })
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// Start the main function
main();