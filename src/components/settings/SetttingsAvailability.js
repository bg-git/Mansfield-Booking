import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Modal from '@mui/material/Modal';

import DateAdapter from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TimePicker from '@mui/lab/TimePicker';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import moment from 'moment';
import axios from 'axios';

import { localBackendPort } from '../../config';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

const initialAvailabilities = [
    {
        dow: 'sunday',
        order: 0,
        available: false,
        start_time: '09:30',
        end_time: '17:30',
        slots: 0
    },
    {
        dow: 'monday',
        order: 1,
        available: true,
        start_time: '09:30',
        end_time: '17:30',
        slots: 1
    },
    {
        dow: 'tuesday',
        order: 2,
        available: true,
        start_time: '09:30',
        end_time: '17:30',
        slots: 1
    },
    {
        dow: 'wednesday',
        order: 3,
        available: true,
        start_time: '09:30',
        end_time: '17:30',
        slots: 1
    },
    {
        dow: 'thursday',
        order: 4,
        available: true,
        start_time: '09:30',
        end_time: '17:30',
        slots: 1
    },
    {
        dow: 'friday',
        order: 5,
        available: true,
        start_time: '09:30',
        end_time: '17:30',
        slots: 1
    },
    {
        dow: 'saturday',
        order: 6,
        available: true,
        start_time: '09:30',
        end_time: '17:30',
        slots: 1
    }
];

const SetttingsAvailability = () => {
    const vertical = 'top';
    const horizontal = 'center';
    const [availabilities, setAvailabilities] = useState(initialAvailabilities);
    const [updated, setUpdated] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [message, setMessage] = useState('');

    const updateAvailability = (dow, type, value) => {
        let newValue;
        if(type === 'start_time' || type === 'end_time') newValue = moment(value).format('HH:mm');
        else if (type === 'slots') newValue = parseInt(value);
        else newValue = value;
        console.log('[update]', dow, type, newValue);

        let newAvailabilities = availabilities;

        newAvailabilities.forEach((availability, index) => {
            if(availability.dow === dow) {
                newAvailabilities[index][type] = newValue;
                if(type === 'slots' && newValue === 0) newAvailabilities[index].available = false;
            }
        });

        setAvailabilities(newAvailabilities);
        setUpdated(!updated);
    }

    const init = async () => {
        try {
            const res = await axios({
                method: 'get',
                url: process.env.NODE_ENV === 'development' ? `http://localhost:${localBackendPort}/weekly-availabilities` : '/.netlify/functions/weekly-availabilities'
            });
            console.log('[init]', res.data);
            setAvailabilities(res.data);
            setUpdated(!updated);
            setLoaded(true);
        }
        catch (error) {
            setLoaded(true);
            setMessage('Something went wrong, try again to reload!');
            setAlertType('error');
            setOpen(true);
        }
    }

    const save = async () => {
        setLoaded(false);
        try {
            await axios({
                method: 'post',
                url: process.env.NODE_ENV === 'development' ? `http://localhost:${localBackendPort}/update-availability` : '/.netlify/functions/update-availability',
                data: JSON.stringify(availabilities)
            });
            const res = await axios({
                method: 'post',
                url: process.env.NODE_ENV === 'development' ? `http://localhost:${localBackendPort}/update-availability` : '/.netlify/functions/update-availability',
                data: JSON.stringify(availabilities)
            });
            console.log('[save]', res.data);
            setLoaded(true);

            setMessage('Settings saved successfully!');
            setAlertType('success');
            setOpen(true);
        }
        catch (error) {
            setLoaded(true);
            setMessage('Something went wrong, try again to save!');
            setAlertType('error');
            setOpen(true);
        }
    }

    const addOverride = () => {
        setOpenModal(true);
    }
    
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    useEffect(() => {
        init();
    }, []);

    if(!loaded) return <Box sx={{ pt: 3, textAlign: 'center' }}>
        <CircularProgress />
    </Box>;

    return (
        <Card>
            <CardHeader
                subheader="Set your weekly hours"
                title="Working hours"
                action={<Button color="primary" variant="contained" onClick={addOverride}>Add override</Button>}
            />
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h4" component="h2">
                        Select a date you want to disable, or assign specific hours.
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography>
                </Box>
            </Modal>            
            <Divider />
            <Snackbar anchorOrigin={{ vertical, horizontal }} open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                    { message }
                </Alert>
            </Snackbar>
            <CardContent>
                <Container>
                    {
                        availabilities.map(availability => {
                            const start = moment(`${moment(new Date()).format('YYYY-MM-DD')} ${availability.start_time}`);
                            const end = moment(`${moment(new Date()).format('YYYY-MM-DD')} ${availability.end_time}`);

                            return (
                                <FormGroup sx={{ margin: '20px 0' }} className={updated ? 'updated' : 'initial' } key={availability.dow}>
                                    <Grid container spacing={3}>
                                        <Grid
                                            item
                                            lg={3}
                                            sm={3}
                                            xl={3}
                                            xs={12}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start'
                                            }}
                                        >
                                            <FormControlLabel
                                                control={<Checkbox checked={availability.available ? true : false} onChange={(e) => {
                                                    updateAvailability(availability.dow, 'available', e.target.checked)
                                                }} />}
                                                label={availability.dow}
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </Grid>
                                        {
                                            availability.available ? (
                                                <Grid item lg={7} sm={7} xl={7} xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                    <LocalizationProvider dateAdapter={DateAdapter}>
                                                        <TimePicker
                                                            label="Start"
                                                            value={start}
                                                            onChange={(newValue) => {
                                                                updateAvailability(availability.dow, 'start_time', newValue);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField {...params} />
                                                            )}
                                                        />
                                                    </LocalizationProvider>
                                                    <Divider
                                                        sx={{ width: '15px', margin: '0 10px' }}
                                                    />
                                                    <LocalizationProvider dateAdapter={DateAdapter}>
                                                        <TimePicker
                                                            label="End"
                                                            value={end}
                                                            onChange={(newValue) => {
                                                                updateAvailability(availability.dow, 'end_time', newValue);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField {...params} />
                                                            )}
                                                            sx={{ '& .MuiTypography-h3': {
                                                                fontSize: 48
                                                            } }}
                                                        />
                                                    </LocalizationProvider>
                                                    <Box sx={{ m: 2 }} />
                                                    <TextField
                                                        id="slots"
                                                        label="Slots"
                                                        type="number"
                                                        variant="outlined"
                                                        value={availability.slots}
                                                        onChange={(e) => {
                                                            updateAvailability(availability.dow, 'slots', e.target.value)
                                                        }}
                                                    />
                                                </Grid>
                                            ) : <Grid item lg={7} sm={7} xl={7} xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '7px 0' }}>
                                                <Typography variant="h4" component="h4" sx={{ fontWeight: 'normal', lineHeight: 2.1 }}>Unavailable</Typography>
                                            </Grid>
                                        }
                                        
                                        <Grid
                                            item
                                            lg={2}
                                            sm={2}
                                            xl={2}
                                            xs={12}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start'
                                            }}
                                        >
                                            <IconButton
                                                color="primary"
                                                aria-label="upload picture"
                                                component="span"
                                                disabled={availability.type === 'date' ? false : true}
                                                onClick={() => updateAvailability(availability.dow, 'available', false)}
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                            );
                        })
                    }
                </Container>
            </CardContent>
            <Divider />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 2
                }}
            >
                <Button color="primary" variant="contained" onClick={save}>
                    Update
                </Button>
            </Box>
        </Card>
    );
};

export default SetttingsAvailability;
