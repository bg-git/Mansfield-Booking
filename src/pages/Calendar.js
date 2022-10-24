import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import axios from 'axios';
import { localBackendPort } from '../config';

const localizer = momentLocalizer(moment);

let allViews = Object.keys(Views).map((k) => Views[k]);

const ColoredDateCellWrapper = ({ children }) =>
    React.cloneElement(React.Children.only(children), {
        style: {
            backgroundColor: 'lightblue'
        }
    });

const MyCalendar = () => {
    var offset = new Date().getTimezoneOffset();
    console.log('[offset]', offset);

    const [appointments, setAppointments] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const init = async () => {
        const res = await axios({
            method: 'get',
            url:
                process.env.NODE_ENV === 'development'
                    ? `http://localhost:${localBackendPort}/appointments`
                    : '/.netlify/functions/appointments'
        });
        console.log('[init]', res.data);
        const allAppointments = [];

        res.data.forEach((val) => {
            allAppointments.push({
                title: `${val.customer.first_name} ${val.customer.last_name}`,
                start: moment(val.start_time, 'YYYY-MM-DD hh:mm A').utcOffset(offset).toDate(),
                end: moment(val.end_time, 'YYYY-MM-DD hh:mm A').utcOffset(offset).toDate(),
                allDay: false
            });
        });
        setAppointments(allAppointments);
        console.log('[allAppointments #4]', allAppointments);
        setLoaded(true);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Helmet>
                <title>Calendar | POA Admin</title>
            </Helmet>
            <Box
                sx={{
                    backgroundColor: 'background.default',
                    minHeight: '100%',
                    py: 3
                }}
            >
                {loaded ? (
                    <Container maxWidth={false}>
                        <Calendar
                            components={{
                              timeSlotWrapper: ColoredDateCellWrapper,
                            }}
                            showMultiDayTimes
                            step={60}
                            views={allViews}
                            localizer={localizer}
                            events={appointments}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 'calc(100vh - 164px)' }}
                        />
                    </Container>
                ) : (
                    <Container maxWidth={false}>
                        <Box sx={{ pt: 3, textAlign: 'center' }}>
                            <CircularProgress />
                        </Box>
                    </Container>
                )}
            </Box>
        </>
    );
};

export default MyCalendar;
