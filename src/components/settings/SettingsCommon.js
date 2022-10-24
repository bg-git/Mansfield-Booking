import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import axios from 'axios';
import { localBackendPort } from '../../config';

const initialSettings = {
    duration: 20,
    buffer: 10
};

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SettingsCommon = (props) => {
    const vertical = 'top';
    const horizontal = 'center';
    const [settings, setSettings] = useState(initialSettings);
    const [loaded, setLoaded] = useState(false);
    const [open, setOpen] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [message, setMessage] = useState('');

    const handleChange = (event) => {
        setSettings({
            ...settings,
            [event.target.name]: event.target.value
        });
    };

    const init = async () => {
        const res = await axios({
            method: 'post',
            url:
                process.env.NODE_ENV === 'development'
                    ? `http://localhost:${localBackendPort}/get-settings`
                    : '/.netlify/functions/get-settings',
            data: JSON.stringify(settings)
        });
        if(res.data) setSettings(res.data);
        setLoaded(true);
    }

    const save = async () => {
        setLoaded(false);
        try {
            const res = await axios({
                method: 'post',
                url:
                    process.env.NODE_ENV === 'development'
                        ? `http://localhost:${localBackendPort}/set-settings`
                        : '/.netlify/functions/set-settings',
                data: JSON.stringify(settings)
            });

            console.log('[save]', res.data);
            setLoaded(true);
            setMessage('Settings saved successfully!');
            setAlertType('success');
            setOpen(true);
        } catch (error) {
            console.log('[error]', error);
            setLoaded(true);
            setMessage('Something went wrong, try again to save!');
            setAlertType('error');
            setOpen(true);
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <Snackbar anchorOrigin={{ vertical, horizontal }} open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                    { message }
                </Alert>
            </Snackbar>
            <Card>
                <CardHeader subheader="Update settings" title="Settings" />
                <Divider />
                {
                    loaded ? (
                        <CardContent>
                            <TextField
                                fullWidth
                                label="Duration(minutes)"
                                margin="normal"
                                name="duration"
                                onChange={handleChange}
                                type="number"
                                value={settings.duration}
                                variant="outlined"
                            />
                            <TextField
                                fullWidth
                                label="Buffer(minutes)"
                                margin="normal"
                                name="buffer"
                                onChange={handleChange}
                                type="number"
                                value={settings.buffer}
                                variant="outlined"
                            />
                        </CardContent>
                    ) : (
                        <CardContent sx={{ pt: 3, textAlign: 'center' }}>
                            <CircularProgress />
                        </CardContent>
                    )
                }
                
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
        </>
    );
};

export default SettingsCommon;
