const handler = async (event) => {
    const myShopifyDomain = process.env.REACT_APP_MY_SHOPIFY_DOMAIN;
    const redirectedURL = process.env.REACT_APP_REDIRECT_URL;
    const shopifyAppApiKey = process.env.REACT_APP_SHOPIFY_APP_API_KEY;
    const scope = 'read_products,read_orders,write_orders,read_customers,write_customers';
    const nonce = 'poabooking';
    const accessMode = 'per-user';

    return {
        statusCode: 302,
        headers: {
            Location:
                `https://${myShopifyDomain}admin/oauth/authorize?client_id=${shopifyAppApiKey}&scope=${scope}&redirect_uri=${redirectedURL}&state=${nonce}&grant_options[]=${accessMode}`
        }
    };
};

module.exports = { handler };
