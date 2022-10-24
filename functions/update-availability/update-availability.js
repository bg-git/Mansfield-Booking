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

            const dbData = await collection.find();
            const dbDataCount = await dbData.count();
            console.log('[dbDataCount]', dbDataCount);

            if (dbDataCount > 0) {
                payload.forEach(async (item) => {
                    const query = { dow: item.dow };
                    const newValues = {
                        $set: {
                            available: item.available,
                            start_time: item.start_time,
                            end_time: item.end_time,
                            slots: item.slots
                        }
                    };

                    const result = await collection.updateOne(query, newValues);
                    console.log('[Update result]', result);
                });
            } else {
                await collection.insertMany(payload);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: 'successfully updated or inserted!' })
            };
        } else {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ status: 'GET method is not allowed' })
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
