
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const context = [{
    role: 'system',
    content: 'You are a helpful assistant that gives information about flights and makes reservations'
}]


function getListOfFlights(origin, destination) {
    console.log('Getting available flights.')

    const flights = [
        {
            depart: "CLT",
            arrival: "STL",
            code: 'STL245'
        },
        {
            depart: "CGK",
            arrival: "DPS",
            code: 'GA4252'
        },
        {
            depart: "CGK",
            arrival: "DPS",
            code: 'GA4253'
        },
        {
            depart: "CLT",
            arrival: "STL",
            code: 'STL243'
        }
    ]

    return flights.filter((f) => f.depart === origin && f.arrival === destination);
}

function setFlightReservation(code) {
    console.log('Confirming reservations.')
}

function bookFlight(origin, destination, code) {
    const availableFlights = getListOfFlights(origin, destination);
    const selectedFlight = availableFlights.find((flight) => flight.code === code);
    if (selectedFlight) {
        setFlightReservation(code);
        console.log('Flight booked successfully:', selectedFlight);
        // TODO: Add better error handling
    } else {
        console.log('Flight not found or not available for the given route.');
        // TODO: Add better error handling
    }
}

/**
 * This function demonstrates how to make an API call to OpenAI's chat completions
 * endpoint with function-calling capabilities. It sets up a conversation context
 * and defines two tools: one for getting a list of flights, and another for flight
 * reservations. The function allows the AI model to choose which tool to use based
 * on the conversation context.
 *
 * The function does the following:
 * 1. Sets up the initial conversation context with a system message and a user query.
 * 2. Configures two tools: getListOfFlight and setFlightReservation.
 * 3. Makes an API call to OpenAI with the context and tool definitions.
 * 4. Allows the AI to automatically choose which tool to use based on the context.
 *
 * Note: This function is asynchronous and requires the OpenAI API to be properly
 * configured and authenticated in the runtime environment.
 */
async function createCompletion() {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: context,
        tools:[
            {
                type: 'function',
                function: {
                    name: 'getListOfFlights',
                    description: 'Get the list of available flights.',
                    parameters: {
                        type: 'object',
                        properties: {
                            origin: {
                                type: 'string',
                                description: 'departure of a flight.'
                            },
                            destination: {
                                type: 'string',
                                description: 'destination of a flight'
                            }
                        },
                        required: ['origin', 'destination'],
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'setFlightReservation',
                    description: 'Makes reservations for customer.',
                    parameters: {
                        type: 'object',
                        properties: {
                            code: {
                                type: 'string',
                                description: 'The code of the flight service',
                            }
                        }
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'bookFlight',
                    description: 'Confirms booking of flight.',
                    parameters: {
                        type: 'object',
                        properties: {
                            origin: {
                                type: 'string',
                                description: 'departure of a flight.'
                            },
                            destination: {
                                type: 'string',
                                description: 'destination of a flight'
                            },
                            code: {
                                type: 'string',
                                description: 'The code of the flight service',
                            }
                        }
                    },
                    required: ['origin', 'destination', 'code'],
                }
            }
        ]
    });

    let willInvokeFunction = response.choices[0].finish_reason === "tool_calls";
    let toolCall;

    if (response.choices[0].message.tool_calls) {
        toolCall = response.choices[0].message.tool_calls[0];
    }
    if (willInvokeFunction && toolCall) {
       const { name, rawArguments } = toolCall.function;
       const parsedArguments = JSON.parse(rawArguments);

       if (name === 'getListOfFlights') {
           const { origin, destination } = parsedArguments;
           const flights = getListOfFlights(origin, destination);
           console.log('Available Flights:', flights);
           // TODO: Add these flights to the context for AI generation
       }

       if (name === 'bookFlight') {
           const { origin, destination, code } = parsedArguments;
           bookFlight(origin, destination, code);
       }

       if (name === 'setFlightReservation') {
           const { code } = parsedArguments;
           setFlightReservation(code);
           console.log('Reservation set for flight:', code);
       }
    }
}

async function chatBot() {
    while (true) {
        const userInput = await getUserInput(); // Need implementation
        context.push({ role: 'user', content: userInput });

        await createCompletion();

        // TODO:  Handle the AIs response
        // TODO: Check if the AI asked a question or waiting for a resposne.
    }
}