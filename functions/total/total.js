const moment = require('moment');

const clientPromise = require('../mongodb-client');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Content-Type': 'application/json'
};

const handler = async (event) => {
  try {
    const client = await clientPromise;
    const database = client.db();
    const appointmentsCollection = database.collection('appointments');
    const customersCollection = database.collection('customers');

    const appointCursor = await appointmentsCollection.find();
    const totalAppointments = await appointCursor.count();
    let totalProfit = 0;

    let totalNewAppointments = 0;
    await appointCursor.forEach((val) => {
        if(moment().diff(val.dateTime) < 0) totalNewAppointments++;
        totalProfit += parseFloat(val.price);
    });

    const customerCursor = await customersCollection.find();
    const totalCustomers = await customerCursor.count();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalAppointments,
        totalNewAppointments,
        totalCustomers,
        totalProfit
      })
    };
  } catch (error) {
    return { statusCode: 500, headers, body: error.toString() };
  }
};

module.exports = { handler };
