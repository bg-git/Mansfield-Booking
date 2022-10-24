import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import AppointmentResults from '../components/appointment/AppointmentResults';
import AppointmentsToolbar from '../components/appointment/AppointmentsToolbar';
import axios from 'axios';
import { localBackendPort } from '../config';

const CustomerList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const init = async () => {
        setLoaded(false);
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
                <title>Appointments | Material Kit</title>
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
                            {/* <AppointmentsToolbar /> */}
                            <Box sx={{ pt: 3 }}>
                                <AppointmentResults appointments={appointments} />
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
