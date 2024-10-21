import { google } from 'googleapis';
import dotenv from "dotenv";

dotenv.config();

const CLIENT_EMAIL : string = process.env.CLIENT_EMAIL as string;
const PRIVATE_KEY : string = process.env.PRIVATE_KEY as string;

if (!CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error('Missing CLIENT_EMAIL or PRIVATE_KEY in environment variables.');
  process.exit(1);
}


const formattedPrivateKey = PRIVATE_KEY.replace(/\\n/g, '\n');

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const appendToSheet = async (spreadsheetId: string, range: string, values: any[][]) => {
  try {
    const resultSheets = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
    if (resultSheets.status === 200) {
      console.log('Data successfully appended');
      return true;
    } else {
      console.log('Error appending data:', resultSheets.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error appending data:', error);
    return false;
  }
};


const readFirstRow = async (spreadsheetId: string, range: string) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (rows && rows.length > 0) {
      const firstRow = rows[0];
      // console.log('First row data:', firstRow);
      return firstRow;
    } else {
      console.log('No data found.');
      return [];
    }
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
};

export {appendToSheet , readFirstRow};