import { Helmet } from 'react-helmet';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import SetttingsAvailability from '../components/settings/SetttingsAvailability';
import SettingsCommon from '../components/settings/SettingsCommon';

const SettingsView = () => (
    <>
        <Helmet>
            <title>Settings | Material Kit</title>
        </Helmet>
        <Box
            sx={{
                backgroundColor: 'background.default',
                minHeight: '100%',
                py: 3
            }}
        >
            <Container maxWidth={false}>
                <Grid container spacing={3}>
                    <Grid item lg={8} sm={12} xl={8} xs={12}>
                        <SetttingsAvailability />
                    </Grid>
                    <Grid item lg={4} sm={12} xl={4} xs={12}>
                        <SettingsCommon />
                    </Grid>
                    {/* <Grid item lg={6} sm={6} xl={6} xs={12}>
                        <SettingsNotifications />
                    </Grid>
                    <Grid item lg={6} sm={6} xl={6} xs={12}>
                        <SettingsPassword />
                    </Grid> */}
                </Grid>
            </Container>
        </Box>
    </>
);

export default SettingsView;
