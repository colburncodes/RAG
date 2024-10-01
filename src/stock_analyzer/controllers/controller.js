const OpenAI = require('openai');

class StockController {
    constructor(model, view, openAiApiKey) {
        this.model = model;
        this.view = view;
        this.openAiApiKey = new OpenAI({ apiKey: openAiApiKey });
        this.context = [{
            role: 'System',
            content: 'You are a helpful chatbot specializing in stock market analysis.'
        }]
    }

    async fetchAndAnalyzeStocks(assets, startYear, endYear) {
        try {
            for (const symbol of assets) {
                this.view.displayFetchingStatus(symbol);
            }

            await this.model.fetchAllStockData(assets, startYear, endYear);
            this.view.displayFetchComplete();

            const summary = this.model.summarizeStockData();
            this.view.displaySummary(summary);

            const analysis = await this.analyzeStockData(summary);
            this.view.displayAnalysis(analysis);

            this.view.displayPrompt();
        } catch(error) {
            this.view.displayError(error);
        }
    }

    async analyzeStockData(summary) {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            temperature: 0,
            messages: [
                ...this.context,
                {
                    role: "user",
                    content: `Analyze the following summary of stock data and provide insights: ${JSON.stringify(summary)}`
                }
            ],
        });

        return response.choices[0].message.content;
    }

    async handleUserInput(input) {
        if (input.toLowerCase() === 'exit') {
            console.log("Exiting...");
            process.exit(0);
        }

        this.context.push({
            role: "user",
            content: input
        });

        try {
            const response = await this.openAiApiKey.chat.completions.create({
                model: "gpt-4-turbo-preview",
                temperature: 0,
                messages: this.context,
            });
            this.view.displayResponse(response.choices[0].message.content);
        } catch (error) {
            this.view.displayError("Error getting response: " + error);
        }

        this.view.displayPrompt();
    }
}

module.exports = StockController;