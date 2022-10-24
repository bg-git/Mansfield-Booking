const moment = require('moment');

const clientPromise = require('../mongodb-client');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json'
};

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const handler = async (event) => {
    try {
        if (event.httpMethod == 'GET') {
            const client = await clientPromise;
            const database = client.db();
            const availabilitiesCollection = database.collection('availabilities');
            const availabilities = [];

            const availabilitiesDbData = await availabilitiesCollection.find({}, { sort: { order: 1 } });
            
            let index = 0;
            await availabilitiesDbData.forEach((val) => {
                availabilities.push(val);
                index++;
            });

            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(availabilities)
            };
        } else {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ status: 'POST method is not allowed' })
            };
        }
    } catch (error) {
        console.log('[error]');
        return {
            statusCode: 500,
            headers,
            body: error.toString()
        };
    }
};

module.exports = { handler };
