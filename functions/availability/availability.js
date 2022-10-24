const moment = require('moment');
const momentTimezone = require('moment-timezone');

const clientPromise = require('../mongodb-client');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json'
};

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const handler = async (event) => {
    try {
        if (event.httpMethod == 'GET') {
            let duration = 20; //minutes
            let bufferAfter = 10; //minutes
            const maxBookableDays = 90;
            const availabilities = [];
            const appointments = [];
            const disabled = [];
            const days = [];
            const client = await clientPromise;
            const database = client.db();
            const availabilitiesCollection = database.collection('availabilities');
            const appointmentsCollection = database.collection('appointments');
            const settingsCollection = database.collection('settings');

            const availabilitiesDbData = await availabilitiesCollection.find({}, { sort: { order: 1 } });
            const appointmentsDbData = await appointmentsCollection.find();
            const setting = await settingsCollection.findOne({ id: 'setting' });
            duration = parseInt(setting.duration);
            bufferAfter = parseInt(setting.buffer);

            console.log('[duration]', duration, bufferAfter);
            
            let index = 0;
            await availabilitiesDbData.forEach((val) => {
                if(!val.available || val.slots === 0) disabled.push(index);
                
                availabilities.push(val);
                index++;
            });

            await appointmentsDbData.forEach((val) => {
                appointments.push(val);
            });

            for(let i = 0; i < maxBookableDays; i++) {
                const spots = [];
                const date = moment().add(i, 'day').format('YYYY-MM-DD');
                const dow = moment().add(i, 'day').day();

                const startTime = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + availabilities[dow].start_time);
                const endTime = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + availabilities[dow].end_time);
                const totalDuration = moment.duration(endTime.diff(startTime)).asMinutes();
                const timeForSpot = duration + bufferAfter;
                const numberOfAvailableSpots = parseInt(totalDuration / timeForSpot);
                const cursorDayAppointments = [];

                appointments.forEach((val) => {
                    const appointmentDate = moment(val.dateTime).format('YYYY-MM-DD');
                    const appointmentTime = moment(val.dateTime).format('hh:mm A');
                    if(date === appointmentDate) {
                        cursorDayAppointments.push({ time: appointmentTime, qty: val.qty });
                    }
                });
    
                index = 0;
                while(index < numberOfAvailableSpots) {
                    const hour = availabilities[dow].start_time.split(':')[0];
                    const minutes = parseInt(availabilities[dow].start_time.split(':')[0]);

                    const newStartTimeObj = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + availabilities[dow].start_time)
                                        .add( timeForSpot * index, 'minutes' );
                    const newStartTime = newStartTimeObj.format('hh:mmA');
                    const newEndTime = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + availabilities[dow].start_time)
                                        .add( (timeForSpot * index + duration), 'minutes' ).format('hh:mmA')
                    let slots = parseInt(availabilities[dow].slots);

                    cursorDayAppointments.forEach((val) => {
                        if(val.time === newStartTime) slots = slots - parseInt(val.qty);
                    });

                    if(moment(new Date()).format('YYYY-MM-DD') == date) {
                        const ukNow = moment(momentTimezone.tz('Europe/London').format('YYYY-MM-DD hh:mmA'), 'YYYY-MM-DD hh:mmA');
                        const diff = moment.duration(newStartTimeObj.diff(ukNow));

                        console.log('[diff]', diff.asHours(), newStartTimeObj.format('hh:mmA'), ukNow.format('hh:mmA'));

                        if (diff.asHours() < 1) {
                            index++;
                            continue;
                        }
                    }
                    
                    spots.push({
                        start_time: newStartTime,
                        end_time: newEndTime,
                        slots: slots
                    });
    
                    index++;
                }

                const day = {
                    date: date,
                    available: availabilities[dow].available,
                    spots: spots
                }
                days.push(day);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    disabled: disabled,
                    days: days
                })
            };
        } else {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ status: 'POST method is not allowed' })
            };
        }
    } catch (error) {
        console.log('[error]', error);
        return {
            statusCode: 500,
            headers,
            body: error.toString()
        };
    }
};

module.exports = { handler };
