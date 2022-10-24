import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import CustomerListResults from '../components/customer/CustomerListResults';
import CustomerListToolbar from '../components/customer/CustomerListToolbar';
import { IntegrationInstructions } from '@mui/icons-material';
import axios from 'axios';
import { localBackendPort } from '../config';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const init = async () => {
        const res = await axios({
            method: 'get',
            url:
                process.env.NODE_ENV === 'development'
                    ? `http://localhost:${localBackendPort}/get-customers`
                    : '/.netlify/functions/get-customers'
        });
        console.log('[init]', res.data);
        setCustomers(res.data);
        setLoaded(true);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Helmet>
                <title>Customers | Material Kit</title>
            </Helmet>
            <Box
                sx={{
                    backgroundColor: 'background.default',
                    minHeight: '100%',
                    py: 3
                }}
            >
                {
                    loaded ? (
                        <Container maxWidth={false}>
                            {/* <CustomerListToolbar /> */}
                            <Box sx={{ pt: 3 }}>
                                <CustomerListResults customers={customers} />
                            </Box>
                        </Container>
                    ) : (
                        <Container maxWidth={false}>
                            <Box sx={{ pt: 3, textAlign: 'center' }}>
                                <CircularProgress />
                            </Box>
                        </Container>
                    )
                }

            </Box>
        </>
    );
};

export default CustomerList;
