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
            const overrideStart = payload.start;
            const overrideEnd = payload.end;
            const isAvailable = payload.available;
            const slots = parseInt(payload.slots);

            const targetData = await collection.findOne({
                type: "date",
                dow: overrideDate
            });
            // const targetDataCount = await targetData.count();
            console.log('[targetData]', targetData);

            if (targetData) {
                const query = { dow: overrideDate };
                const newValues = {
                    $set: {
                        available: isAvailable,
                        start_time: overrideStart,
                        end_time: overrideEnd,
                        slots: slots
                    }
                };

                const result = await collection.updateOne(query, newValues);
                console.log('[Update result]', result);
            } else {
                await collection.insertOne({
                    dow: overrideDate,
                    available: isAvailable,
                    start_time: overrideStart,
                    end_time: overrideEnd,
                    slots: slots,
                    type: "date",
                    order: 9999
                });
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
