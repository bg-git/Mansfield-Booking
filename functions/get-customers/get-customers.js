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
    const customers = [];
    const client = await clientPromise;
    const database = client.db();
    const collection = database.collection('customers');

    const options = {
      sort: { createdAt: -1 }
    };

    const cursor = await collection.find({}, options);
    console.log('[count]', await cursor.count());
    await cursor.forEach((val) => {
      customers.push(val);
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(customers)
    };
  } catch (error) {
    return { statusCode: 500, headers, body: error.toString() };
  }
};

module.exports = { handler };
