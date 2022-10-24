import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import TotalAppointments from '../components/dashboard/TotalAppointments';
import LatestOrders from '../components/dashboard/LatestOrders';
import TotalNewAppointments from '../components/dashboard/TotalNewAppointments';
import TotalCustomers from '../components/dashboard/TotalCustomers';
import TotalProfit from '../components/dashboard/TotalProfit';

import axios from 'axios';
import { localBackendPort } from '../config';

const initialTotal = {
    totalAppointments: 0,
    totalNewAppointments: 0,
    totalCustomers: 0,
    totalProfit: 0
}

const Dashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(initialTotal);
    const [loaded, setLoaded] = useState(false);

    const init = async () => {
        const resTotal = await axios({
            method: 'get',
            url:
                process.env.NODE_ENV === 'development'
                    ? `http://localhost:${localBackendPort}/total`
                    : '/.netlify/functions/total'
        });
        console.log('[total]', resTotal.data);
        setTotal(resTotal.data);

        const res = await axios({
            method: 'get',
            url:
                process.env.NODE_ENV === 'development'
                    ? `http://localhost:${localBackendPort}/appointments`
                    : '/.netlify/functions/appointments'
        });
        console.log('[init]', res.data);
        setAppointments(res.data);
        setLoaded(true);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Helmet>
                <title>Dashboard | POA Admin</title>
            </Helmet>
            <Box
                sx={{
                    backgroundColor: 'background.default',
                    minHeight: '100%',
                    py: 3
                }}
            >
                <Container maxWidth={false}>
                    {
                        loaded ? (
                            <Grid container spacing={3}>
                                <Grid item lg={3} sm={6} xl={3} xs={12}>
                                    <TotalAppointments total={total.totalAppointments} />
                                </Grid>
                                <Grid item lg={3} sm={6} xl={3} xs={12}>
                                    <TotalCustomers total={total.totalCustomers} />
                                </Grid>
                                <Grid item lg={3} sm={6} xl={3} xs={12}>
                                    <TotalNewAppointments total={total.totalNewAppointments} />
                                </Grid>
                                <Grid item lg={3} sm={6} xl={3} xs={12}>
                                    <TotalProfit total={total.totalProfit} />
                                </Grid>
                                <Grid item lg={12} md={12} xl={12} xs={12}>
                                    <LatestOrders appointments={appointments} limit={limit} />
                                </Grid>
                            </Grid>
                        ) : <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress />
                        </Box>
                    }
                </Container>
            </Box>
        </>
    );
};

export default Dashboard;
