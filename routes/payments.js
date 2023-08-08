const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");
const config = require("../util/config");
const Razorpay = require("razorpay");

/**
 * @swagger
 * definitions:
 *   place_order:
 *     properties:
 *       order_for:
 *         type: string
 *         enum:
 *          - Ads
 *          - Breadcrum
 *       entity_id:
 *         type: integer
 *       base_amount:
 *         type: integer
 *       gst:
 *         type: integer
 *       currency_unit:
 *         type: string
 *         enum:
 *          - Rupee
 *          - Paisa
 */
//#region /payment/place-order : post
/**
 * @swagger
 * /payment/place-order:
 *   post:
 *     tags:
 *       - Payments
 *     description: Place an order with Razorpay.
 *     summary: Place an order with Razorpay.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Payment object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/place_order'
 *     responses:
 *       200:
 *         description: Multiple responses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/place-order", auth.authenticateToken, async (req, res) => {
  const user_id = req.user.rec_id;
  const order_for = req.body.order_for;
  const entity_id = req.body.entity_id;
  let base_amount = req.body.base_amount;
  let gst = req.body.gst;
  const currency_unit = req.body.currency_unit;

  var instance = new Razorpay({
    key_id: config.payment_config.key_id,
    key_secret: config.payment_config.key_secret,
  });

  if (currency_unit == "Rupee") {
    base_amount = base_amount * 100;
    gst = gst * 100;
  }
  var amount = base_amount + gst;
  amount += amount <= 500 * 100 ? 50 * 100 : 0;
  var options = {
    amount: amount, // amount in the smallest currency unit.
    currency: "INR",
  };

  console.log(`basea - ${base_amount}\ngst - ${gst}\namount ${amount}`);
  // return res.status(200).send({"success":false});

  instance.orders.create(options, async function (err, order) {
    if (err) return res.status(400).send({ success: false, error: err.error });
    let sql = `SET @x = 0; CALL order_Ad_bread_insert(${user_id}, '${order.id}', '${order_for}', ${entity_id}, ${base_amount}, ${amount}, ${gst}, @x); SELECT @x;`;
    let sql_response = await conn.getConnection(sql, res);
    console.log(sql_response);
    if (sql_response[1]["affectedRows"] > 0) {
      return res
        .status(200)
        .send({
          success: true,
          rp_order_id: order.id,
          api_key: config.payment_config.key_id,
          order_id: sql_response[2][0]["@x"],
        });
    } else {
      return res.status(200).send({ success: false });
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   add_transaction:
 *     properties:
 *       order_id:
 *         type: integer
 *       rp_order_id:
 *         type: string
 *       rp_transation_id:
 *         type: string
 *       payment_status:
 *         type: string
 *         enum:
 *          - Approved
 *          - Failed
 *       error_log:
 *         type: object
 *       rp_signature:
 *         type: string
 */
//#region /payment/add-transaction : post
/**
 * @swagger
 * /payment/add-transaction:
 *   post:
 *     tags:
 *       - Payments
 *     description: Add a Razorpay transaction.
 *     summary: Add a Razorpay transaction.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Transaction object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/add_transaction'
 *     responses:
 *       200:
 *         description: Multiple responses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/add-transaction", auth.authenticateToken, async (req, res) => {
  const user_id = req.user.rec_id;
  const order_id = req.body.order_id;
  const rp_order_id = req.body.rp_order_id;
  const rp_transation_id = req.body.rp_transation_id;
  const payment_status = req.body.payment_status;
  const error_log = req.body.error_log;
  const rp_signature = req.body.rp_signature;

  if (payment_status === "Approved") {
    let sql = `call ciydb.cart_clear_by_user_id(${user_id});`;
    clear_cart_res = await conn.getConnection(sql, res);

    // sql =`SET @x = ${recId}; call ciydb.notification_upsert(@x, 'New Prepaid Order', '', '${entity_id}', 'Customer', '-1', '${read_status}', '${status}');`


  }

  let sql = `SET @x = 0; CALL transaction_history_insert(${user_id}, ${order_id}, '${rp_order_id}', '${rp_transation_id}', '${payment_status}', ${JSON.stringify(
    error_log
  )}, '${rp_signature}', @x); SELECT @x;`;
  let sql_response = await conn.getConnection(sql, res);
  if (sql_response[1]["affectedRows"] > 0) {
    return res
      .status(200)
      .send({ success: true, message: "Inserted successfully" });
  } else {
    return res
      .status(200)
      .send({ success: false, message: "Could not log this transaction" });
  }
});
// #endregion

/**
 * @swagger
 * /payment/vendor/transaction_history:
 *   get:
 *     tags:
 *       - Payments
 *     description: Get vendor's order list by order_id.
 *     summary: Get vendor's order list by order_id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: order_id
 *         description: order_id
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Listing successful
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get(
  "/vendor/transaction_history",
  auth.authenticateToken,
  async (req, res) => {
    const order_id = req.query.order_id;
    let sql = `CALL transaction_history_get_by_order_id(${order_id});`;
    var response = await conn.getConnection(sql, res);

    res.send({ response: response[0] });
  }
);
// #endregion

/**
 * @swagger
 * /payment/vendor/refund_history:
 *   get:
 *     tags:
 *       - Payments
 *     description: Get vendor's  refund order list by order_id.
 *     summary: Get vendor's  refund order list by order_id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: order_id
 *         description: order_id
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Listing successful
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get(
  "/vendor/refund_history",
  auth.authenticateToken,
  async (req, res) => {
    const order_id = req.query.order_id;
    let sql = `CALL refund_history_get_by_order_id(${order_id});`;
    var response = await conn.getConnection(sql, res);

    res.send({ response: response[0] });
  }
);
// #endregion
//events starting 

// ... Your other code ...

router.post("/razorpay", auth.authenticateToken, async (req, res) => {
  console.log("razorpay hitted ");
  const eventId  =req.body.entity_id;
  console.log("i am cllin");
  console.log("body",req.body);
  const payment_capture = 1;
  const currency = "INR";
  console.log("eventid", eventId);
  const rec_id = eventId;
  const user_id = req.user.rec_id;
  console.log('userid', user_id);
  
  try {
    const sql = `call ciydb.events(${rec_id});`;
    const event = await sql;
    console.log("eventing",event);
    if (!event) {
      return res.status(400).json({ message: "Event not found" });
    } else {
      console.log("event found");
      const amount =parseInt(req.body.base_amount);

      console.log("amount",amount);
      const options = {
        amount: amount * 100,
        currency,
        payment_capture,
      };
      
      console.log("Razorpay", Razorpay);

      var instance = new Razorpay({
        key_id: config.payment_config.key_id,
        key_secret: config.payment_config.key_secret,
      });
  
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.error("Error creating order:", err);
          return res.status(400).json({ success: false, error: err.error });
        } else {
          console.log("order created");
          console.log("order", order);
          return res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



router.post("/bookevent", auth.authenticateToken, async (req, res) => {
  console.log("hitted");
  const { eventid, event, BookingDate, persons, TotalAmount, transactionid } = req.body;
  console.log("bookings body", req.body);
  const user_id = req.user.rec_id;
  console.log('bookingsuserid', user_id);
  console.log("booking done");
  console.log("eventid",eventid);
  const selectQuery = `SELECT imageurl FROM events WHERE id = ?`;
  const insertQuery = 'INSERT INTO EventBooking (eventName, bookingDate, persons, totalAmount, transactionId, userId, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const updateQuery = 'UPDATE events SET seatavalability = seatavalability - ? WHERE id = ?';

  // Execute the selection query to get the imageUrl
  conn.connection.query(selectQuery, [eventid], (error, selectResults) => {
    if (error) {
      console.error('Error fetching imageUrl:', error);
      res.status(500).json({ error: 'Failed to fetch imageUrl' });
    } else {
      if (selectResults.length > 0) {
        const imageUrl = selectResults[0].imageurl;

        // Execute the insertion query with the provided data including the imageUrl
        conn.connection.query(
          insertQuery,
          [event, BookingDate, persons, TotalAmount, transactionid, user_id, imageUrl],
          (error, insertResults) => {
            if (error) {
              console.error('Error inserting event booking:', error);
              res.status(500).json({ error: 'Failed to create event booking' });
            } else {
              console.log('Event booking created:', insertResults);

              // Execute the update query to reduce seat availability
              conn.connection.query(updateQuery, [persons, eventid], (error, updateResults) => {
                if (error) {
                  console.error('Error updating seat availability:', error);
                  res.status(500).json({ error: 'Failed to update seat availability' });
                } else {
                  console.log('Seat availability updated:', updateResults);
                  res.status(201).json({ message: 'Event booking created successfully' });
                }
              });
            }
          }
        );
      } else {
        res.status(404).json({ error: 'Event not found' });
      }
    }
  });
});

router.get('/bookings', auth.authenticateToken, (req, res) => {
  const userId = req.user.rec_id;
  // SQL query to fetch data from the EventBooking table
  const sqlQuery = `SELECT eventName, bookingDate, persons, totalAmount, transactionId,imageUrl FROM EventBooking WHERE userId = ${userId}`;

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

router.post('/addlikes', auth.authenticateToken, (req, res) => {
  console.log("fine");
  const userId =req.user.rec_id;
  const { rec_id} =req.body;
  console.log("likes rec_Id",rec_Id);
  console.log("likesusersId",userId);
  const sql = 'SELECT Likes FROM Feed WHERE rec_id = ?'
  conn.connection.query(sql, [rec_id], (error, results) => {
    if (error) {
      console.error('Error retrieving Likes:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      let likes = results[0].Likes || ''; // Get the existing Likes value or initialize as empty string

      if (!likes.includes(user_id)) {
        likes += (likes.length > 0 ? ',' : '') + userId; // Append the user_id to Likes if it's not already present
      }

      // Update the Likes column with the new value
      sql = 'UPDATE Feed SET Likes = ? WHERE rec_id = ?';
      conn.connection.query(sql, [likes, rec_id], (error) => {
        if (error) {
          console.error('Error updating Likes:', error);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.json({ success: true });
        }
      });
    }
  });
  
});


module.exports = router;
