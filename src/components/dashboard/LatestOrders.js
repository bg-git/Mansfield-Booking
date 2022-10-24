import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { NavLink as RouterLink } from 'react-router-dom';

const LatestOrders = ({ appointments, limit }) => (
    <Card>
        <CardHeader title="Latest Appointments" />
        <Divider />
        <PerfectScrollbar>
            <Box sx={{ minWidth: 800 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order #</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Date/Time</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Created Date</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointments.slice(0, limit).map((appointment) => {
                            const dateTimeObj = moment(appointment.dateTime, 'YYYY-MM-DD hh:mm A');
                            return (
                                <TableRow hover key={appointment._id}>
                                    <TableCell>
                                        #{appointment.orderNumber}
                                    </TableCell>
                                    <TableCell>
                                        {appointment.customer.first_name}{' '}
                                        {appointment.customer.last_name}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            color={ moment().diff(dateTimeObj) < 0 ? 'success' : 'primary' }
                                            label={appointment.dateTime}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{appointment.qty}</TableCell>
                                    <TableCell>
                                        {moment(appointment.createdAt).format('YYYY-MM-DD hh:mm A')}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            color={ moment().diff(dateTimeObj) < 0 ? 'success' : 'primary' }
                                            label={ moment().diff(dateTimeObj) < 0 ? 'New' : 'Done' }
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>
        </PerfectScrollbar>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                p: 2
            }}
        >
            <Button
                component={RouterLink}
                color="primary"
                endIcon={<ArrowRightIcon />}
                size="small"
                variant="text"
                to="/app/appointments"
            >
                View all
            </Button>
        </Box>
    </Card>
);

export default LatestOrders;
