const express = require('express');
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

router.get('/getallevents',(req, res) => {
  console.log("i am called")
  console.log("req.body",req.body);
  const user = req.body;
  const recId = user.recId;
  console.log("event user",user);
  console.log("eventrecid",recId)
  console.log("events called");
  let sql = 'SELECT * FROM events';
  conn.connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error retrieving events:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

router.get('/getallbookings', (req, res) => {
  console.log("bookings hit");
  
  // SQL query to fetch data from the EventBooking table and join it with the users table
  const sqlQuery = `SELECT eb.eventName, eb.bookingDate, eb.persons, eb.totalAmount, eb.transactionId, u.name, u.mobile_no
                    FROM EventBooking eb
                    INNER JOIN users u ON eb.userid = u.rec_id`;

  // Execute the SQL query
  conn.connection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error executing the SQL query: ' + err.stack);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    // Return the results as JSON
    res.json(results);
  });
});

router.post('/addevents', (req, res) => {
  console.log("reaching");
  const eventData = req.body;
  console.log("eventData", eventData);

  // Convert the date format to 'yyyy-mm-dd'
  const formattedDate = eventData.date.split('/').reverse().join('-');

  // Update the eventData object with the formatted date
  eventData.date = formattedDate;

  conn.connection.query('INSERT INTO events SET ?', eventData, (err, results) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).json({ error: 'Error executing database query' });
      return;
    }

    res.status(201).json({ message: 'Event added successfully', eventId: results.insertId });
  });
});


router.post('/addexpenses', (req, res) => {
  console.log("reaching");
  const expenseData = req.body;
  console.log("expenseData", expenseData);

  conn.connection.query('INSERT INTO expenses SET ?', expenseData, (err, results) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).json({ error: 'Error executing database query' });
      return;
    }

    res.status(201).json({ message: 'Expense added successfully', expenseId: results.insertId });
  });
});

router.get('/getallexpenses', (req, res) => {
  console.log("finaly here");
  const recId =req.query.recId; // Use req.query to get the recId from the query string
  let sql = `SELECT * FROM expenses where event_id = ${recId}`; // Use the correct variable name here (recId instead of rec_id)
  conn.connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error retrieving expenses:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});
router.delete('/delete_all_users', (req, res) => {
  console.log("finaly rec id");
  const recId =req.query.recId; 
  console.log("recId",recId);// Use req.query to get the recId from the query string
  let sql = `Delete FROM users where rec_id = ${recId}`; // Use the correct variable name here (recId instead of rec_id)
  conn.connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error retrieving expenses:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});


module.exports = router;
