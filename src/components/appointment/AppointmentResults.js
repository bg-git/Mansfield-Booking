import React, { useState } from 'react';

import PropTypes from 'prop-types';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

const AppointmentResults = ({ appointments, ...rest }) => {
    const [selectedAppointmentIds, setSelectedAppointmentIds] = useState([]);
    const [limit, setLimit] = useState(15);
    const [page, setPage] = useState(0);

    const handleSelectAll = (event) => {
        let newSelectedAppointmentIds;

        if (event.target.checked) {
            newSelectedAppointmentIds = appointments.map(
                (appointment) => appointment._id
            );
        } else {
            newSelectedAppointmentIds = [];
        }

        setSelectedAppointmentIds(newSelectedAppointmentIds);
    };

    const handleSelectOne = (event, id) => {
        const selectedIndex = selectedAppointmentIds.indexOf(id);
        let newSelectedAppointmentIds = [];

        if (selectedIndex === -1) {
            newSelectedAppointmentIds = newSelectedAppointmentIds.concat(
                selectedAppointmentIds,
                id
            );
        } else if (selectedIndex === 0) {
            newSelectedAppointmentIds = newSelectedAppointmentIds.concat(
                selectedAppointmentIds.slice(1)
            );
        } else if (selectedIndex === selectedAppointmentIds.length - 1) {
            newSelectedAppointmentIds = newSelectedAppointmentIds.concat(
                selectedAppointmentIds.slice(0, -1)
            );
        } else if (selectedIndex > 0) {
            newSelectedAppointmentIds = newSelectedAppointmentIds.concat(
                selectedAppointmentIds.slice(0, selectedIndex),
                selectedAppointmentIds.slice(selectedIndex + 1)
            );
        }

        setSelectedAppointmentIds(newSelectedAppointmentIds);
    };

    const handleLimitChange = (event) => {
        setLimit(event.target.value);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <Card {...rest}>
            <PerfectScrollbar>
                <Box sx={{ minWidth: 1050 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={
                                            selectedAppointmentIds.length ===
                                            appointments.length
                                        }
                                        color="primary"
                                        indeterminate={
                                            selectedAppointmentIds.length > 0 &&
                                            selectedAppointmentIds.length <
                                                appointments.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>Order #</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Date/Time</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Registration date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {appointments
                                .slice(page, limit)
                                .map((appointment) => {
                                    const dateTimeObj = moment(appointment.dateTime, 'YYYY-MM-DD hh:mm A');
                                    return (
                                        <TableRow
                                            hover
                                            key={appointment._id}
                                            selected={
                                                selectedAppointmentIds.indexOf(
                                                    appointment._id
                                                ) !== -1
                                            }
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={
                                                        selectedAppointmentIds.indexOf(
                                                            appointment._id
                                                        ) !== -1
                                                    }
                                                    onChange={(event) =>
                                                        handleSelectOne(
                                                            event,
                                                            appointment._id
                                                        )
                                                    }
                                                    value="true"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                #{appointment.orderNumber}
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        alignItems: 'center',
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <Typography
                                                        color="textPrimary"
                                                        variant="body1"
                                                    >
                                                        {
                                                            appointment.customer
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            appointment.customer
                                                                .last_name
                                                        }
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        moment().diff(
                                                          dateTimeObj
                                                        ) < 0
                                                            ? 'success'
                                                            : 'primary'
                                                    }
                                                    label={appointment.dateTime}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {appointment.qty}
                                            </TableCell>
                                            <TableCell>
                                                {moment(
                                                    appointment.createdAt
                                                ).format('YYYY-MM-DD hh:mm A')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        moment().diff(
                                                          dateTimeObj
                                                        ) < 0
                                                            ? 'success'
                                                            : 'primary'
                                                    }
                                                    label={
                                                        moment().diff(
                                                          dateTimeObj
                                                        ) < 0
                                                            ? 'New'
                                                            : 'Done'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>                                                
                                                <a
                                                    href={`${process.env.REACT_APP_STORE_URI}/ecommerce/orders/${appointment.orderId}`}
                                                    target="_blank"
                                                >
                                                    View on admin
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </Box>
            </PerfectScrollbar>
            <TablePagination
                component="div"
                count={appointments.length}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleLimitChange}
                page={page}
                rowsPerPage={limit}
                rowsPerPageOptions={[5, 10, 15, 20, 30]}
            />
        </Card>
    );
};

AppointmentResults.propTypes = {
    appointments: PropTypes.array.isRequired
};

export default AppointmentResults;
