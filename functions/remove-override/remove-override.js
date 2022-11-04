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
        if (event.httpMethod == 'POST') {
            const client = await clientPromise;
            const database = client.db();
            const collection = database.collection('availabilities');
            const payload = JSON.parse(event.body);
            const overrideDate = payload.date;

            const removedData = await collection.deleteOne({
                type: "date",
                dow: overrideDate
            });

            console.log('[removedData]', removedData);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: 'successfully deleted!' })
            };
        } else {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ status: 'Only POST method is allowed' })
            };
        }
    } catch (error) {
        console.log('[error]', error);
        return {
            statusCode: 500,
            headers,
            body: error.toString()
        };
    }
};

module.exports = { handler };
