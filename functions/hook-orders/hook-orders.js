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
    const client = await clientPromise;
    const database = client.db();
    const appointmentsCollection = database.collection('appointments');
    const customersCollection = database.collection('customers');
    const order = JSON.parse(event.body);
    let dateTime = null;
    let qty = 1;

    if(order.note !== 'appointment_from_headless_store') {
      console.log('[Order is not for appointment]');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 'status': 'Order is not for appointment' })
      };
    }

    order.line_items.forEach((line_item) => {
      line_item.properties.forEach((property) => {
        if (property.name === 'Date Time') {
          dateTime = Date.parse(property.value);
        }
      });

      qty = line_item.quantity;
    });

    const cusstomerExist = await customersCollection.findOne({ id: order.customer.id });

    let insertCustomerResult

    if(!cusstomerExist) {
      insertCustomerResult = await customersCollection.insertOne({
        ...order.customer,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const doc = {
      dateTime,
      qty,
      orderId: order.id,
      orderNumber: order.order_number,
      customerId: cusstomerExist ? cusstomerExist._id : insertCustomerResult.insertedId,
      price: order.total_price,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await appointmentsCollection.insertOne(doc);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'success', ...result })
    };
  } catch (error) {
    return { statusCode: 500, headers, body: error.toString() };
  }
};

module.exports = { handler };
