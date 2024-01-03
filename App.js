const express = require('express')
const { google } = require('googleapis')
const app = express()
const port = 3000

async function getAuthSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    })

    const client = await auth.getClient();

    const googleSheets = google.sheets({
        version: 'v4',
        auth: client
    })

    const spreadsheetId = '1tXU8QvGLiJSkS05zjV16pQRqWHREpRk4j3HSe7DuEzs'

    return{
        auth,
        client,
        googleSheets,
        spreadsheetId
    }
}

app.get('/metadata', async (req, res) => {
    const { googleSheets, auth, client, spreadsheetId} = await getAuthSheets()

    const metadata = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId
    })

    res.send(metadata)
})

app.get('/getRow', async (req, res) => {
    const { googleSheets, auth, client, spreadsheetId} = await getAuthSheets()
    const getRow = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'oxford3000'
    })

    res.send(getRow.data)
})

app.post('/addRow', async (req, res) => {
    const { googleSheets, auth, client, spreadsheetId } = await getAuthSheets();

    // Get data from the request body (assuming it's a JSON object)
    const rowData = req.body;

    try {
        const response = await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: 'oxford3000!A1:AA1001',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [['hello world', 'hello world', 'hello world']]
            },
        });

        res.send(response.data);
    } catch (error) {
        console.error('Error adding row:', error.message);
        res.status(500).send('Error adding row to the sheet');
    }
});

app.post('/clearRow', async (req, res) => {
    const { googleSheets, auth, client, spreadsheetId } = await getAuthSheets();

    // Get the row number from the request body

    try {
        const response = await googleSheets.spreadsheets.values.clear({
            auth,
            spreadsheetId,
            range: `oxford3000!A${7}:C${7}`, // Adjust the range based on your needs
            //clear all range: 'oxford300'
        });

        res.send(response.data);
    } catch (error) {
        console.error('Error clearing row:', error.message);
        res.status(500).send('Error clearing row in the sheet');
    }
});

app.listen(port, (err) => {
    if(err) throw err
    console.log('The server is running on port ' + port)
})