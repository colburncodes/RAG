class StockView {
    displayFetchingStatus(symbol) {
        console.log(`Fetching data for ${symbol}...`);
    }

    displayFetchComplete() {
        console.log(`Stock data fetched complete...`);
    }

    displaySummary(symbol) {
        console.log("Data summary:", JSON.stringify(symbol, null, 2));
    }

    displayAnalysis(analysis) {
        console.log("Analysis:", analysis);
    }

    displayPrompt() {
        console.log("Enter a question about the stock data (or 'exit' to quit):");
    }

    displayResponse(response) {
        console.log('Response: ', response);
    }

    displayError(error) {
        console.log(`Stock data fetched error: ${error}`);
    }
}

module.exports = StockView;