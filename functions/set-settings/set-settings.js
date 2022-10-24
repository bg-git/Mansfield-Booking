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
            const settingsCollection = database.collection('settings');
            const payload = JSON.parse(event.body);

            const dbData = await settingsCollection.find();

            const dbDataCount = await dbData.count();
            
            if (dbDataCount > 0) {
                await settingsCollection.updateOne({ id: 'setting' }, {
                    $set: {
                        duration: payload.duration,
                        buffer: payload.buffer
                    }
                });
            } else {
                await settingsCollection.insertOne({ ...payload, id: 'setting' });
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
        console.log('[error]', error);
        return {
            statusCode: 500,
            headers,
            body: error.toString()
        };
    }
};

module.exports = { handler };
