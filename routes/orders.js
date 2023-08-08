const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");
const details = require("../util/details.json");
const sendMail = require("../util/email");
const fs = require("fs");
var groupBy = require("group-by");
var FCM = require("fcm-node");
const config = require("../util/config");
var serverKey = require("../util/dukaan-firebase.json");
var fcm = new FCM(serverKey);

/**
 * @swagger
 * definitions:
 *   order_upsert:
 *     properties:
 *       rec_id:
 *         type: integer
 *       product_list:
 *         type: Array
 *       price_list:
 *         type: Array
 *       gst_list:
 *         type: Array
 *       quantity_list:
 *         type: Array
 *       user_id:
 *         type: integer
 *       amount:
 *         type: integer
 *       ship_name:
 *         type: string
 *       address1:
 *         type: string
 *       address2:
 *         type: string
 *       city:
 *         type: string
 *       landmark:
 *         type: string
 *       state:
 *         type: integer
 *       country:
 *         type: integer
 *       phone_no:
 *         type: string
 *       zip_code:
 *         type: string
 *       shipping:
 *         type: integer
 *       total_gst:
 *         type: integer
 *       order_date:
 *         type: string
 *       vendor_status:
 *         type: string
 *         enum:
 *          - Accept
 *          - Reject
 *          - Pending
 *       status_date:
 *         type: string
 *       delivery_type:
 *         type: string
 *         enum:
 *          - Pickup
 *          - Delivery
 */

//#region /order/upsert : post
/**
 * @swagger
 * /order/upsert:
 *   post:
 *     tags:
 *       - Orders
 *     description: Add and update an order.
 *     summary: Add and update an order.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Order
 *         description: Order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/order_upsert'
 *     responses:
 *       200:
 *         description: Order added/updated.
 *       201:
 *         description: Order added.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/upsert", auth.authenticateToken, async (req, res) => {
  console.log("requestbody",req.body);
  const rec_id = req.body.rec_id;
  const product_list = req.body.product_list;
  const price_list = req.body.price_list;
  const gst_list = req.body.gst_list;
  const quantity_list = req.body.quantity_list;
  const user_id = req.user.rec_id;
  const amount = req.body.amount;
  const ship_name = req.body.ship_name;
  const address1 = req.body.address1;
  const address2 = req.body.address2;
  const city = req.body.city;
  const landmark = req.body.landmark;
  const state = req.body.state;
  const country = req.body.country;
  const phone_no = req.body.phone_no;
  const zip_code = req.body.zip_code;
  var shipping = req.body.shipping;
  const total_gst = req.body.total_gst;
  const order_date = req.body.order_date;
  const vendor_status = req.body.vendor_status;
  const delivery_type = req.body.delivery_type;
  // const product_name=req.body.product_name;
  // console.log("product_name",product_name);
  console.log("product_list",product_list);
  if (amount <= 500)
    shipping = 50;
    
  var order_details_res;
  let sql = `SET @x = ${rec_id}; call ciydb.order_upsert(@x, ${user_id}, ${amount}, '${ship_name}', '${address1}', '${address2}', '${city}', '${landmark}', ${state}, ${country}, '${phone_no}', '${zip_code}', ${shipping}, ${total_gst}, '${order_date}', '${vendor_status}','${delivery_type}'); SELECT @x`;
  const order_res = await conn.getConnection(sql, res);
  console.log("order_res",order_res)
  console.log("rec_idupsert",rec_id);
  if (rec_id === 0) {
    var response = "Order added successfully.";
    var order_id = order_res[2][0]["@x"];
    console.log(price_list.length);
    console.log(gst_list.length);
    console.log(product_list.length);
    console.log(quantity_list.length);
    if (
      price_list.length == gst_list.length &&
      product_list.length == quantity_list.length &&
      price_list.length == product_list.length
    ) {
      for (var index = 0; index < product_list.length; index++) {
        var order_id_recID = 0;
        var order_id = order_id;
        console.log("order_id",order_id);
        var product_id = product_list[index];
        console.log("product_id",product_id);
        var price = price_list[index];
        console.log("price",price)
        var gst = gst_list[index];
        console.log("gst",gst);
        var quantity = quantity_list[index];
       
        
        console.log("quantity",quantity);
        console.log("order_id_recID",order_id_recID);
        console.log("product_id",product_id);
        let getProductSql = `SELECT name FROM products WHERE rec_id = ${product_id}`;
        const productResult = await conn.getConnection(getProductSql, res);
        let productName = null;
if (productResult && productResult[0] && productResult[0][0] && productResult[0][0].name) {
  productName = productResult[0][0].name;
}

        console.log(productName);
        let sql = `SET @x = ${order_id_recID}; call ciydb.order_details_upsert(@x, ${order_id}, ${product_id}, ${price}, ${gst}, ${quantity},${productName}); SELECT @x`;
        
        order_details_res = await conn.getConnection(sql, res);
        console.log("order_details_res",order_details_res);
      }
      if (order_details_res) {
        // let sql = `call ciydb.cart_clear_by_user_id(${user_id});`;
        // clear_cart_res = await conn.getConnection(sql, res);
        // if (clear_cart_res) {
        //   var response = "Order added successfully";
        //   return res
        //     .status(200)
        //     .send({ response: response, order_id: order_id });
        // }
        // else {
        //   var response = "There was an issue, please contact support team";
        //   return res
        //     .status(400)
        //     .send({ response: response });
        // }
        var response = "Order added successfully";
        console.log("finalresponse",response);
        return res.status(200).send({ response: response, order_id: order_id });
      }
    } else {
      var response = "There was an issue, please contact support team";
      console.log("finalresponse",response);
      return res.status(400).send({ response: response });
     
    }
  
  }

});
// #endregion

//#region /order/find-by-id : get
/**
 * @swagger
 * /order/find-by-id:
 *   get:
 *     tags:
 *       - Orders
 *     description: Find order by Id.
 *     summary: Find order by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: rec_id
 *         type: integer
 *         in: query
 *         required: true
 *       - name: user_id
 *         description: user_id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found order.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.post("/find-by-id", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  let sql = `call ciydb.order_by_id(${rec_id});`;
  var order_obj = await conn.getConnection(sql, res);
  return res.send({ response: order_obj[0] });
});
// #endregion

router.get("/find-by-productid", async (req, res) => {
  const recId = 1//req.query.recId; // Access recId from query parameter
  
  try {
    const sql = `
      SELECT productId
      FROM image_tags
      WHERE image_id = ${recId}
    `;
    
    conn.connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error retrieving product ID:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (results.length > 0) {
          const productId = results[0].productId;
          const productSql = `
            SELECT name, price
            FROM products
            WHERE rec_id = ${productId}
          `;
          
          conn.connection.query(productSql, (productError, productResults) => {
            if (productError) {
              console.error('Error retrieving product details:', productError);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              if (productResults.length > 0) {
                const product = productResults[0];
                const { name, price } = product;
                res.json({ name, price });
              } else {
                res.status(404).json({ error: 'Product not found' });
              }
            }
          });
        } else {
          res.status(404).json({ error: 'Product ID not found in image_tags' });
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving product details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//#region /order/update-delivery-status : post
/**
 * @swagger
 * /order/update-delivery-status:
 *   post:
 *     tags:
 *       - Orders
 *     description: Find order by Id.
 *     summary: Find order by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: rec_id
 *         type: integer
 *         in: query
 *         required: true
 *       - name: user_id
 *         description: user_id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found order.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.post("/update-delivery-status", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  const status = req.body.status;
  let sql = `call ciydb.order_update_delivery_status(${rec_id},'${status}');`;
  var order_obj = await conn.getConnection(sql, res);
  return res.send({ response: order_obj[0] });
});
// #endregion




/**
 * @swagger
 * definitions:
 *   order_find_all_paged:
 *     properties:
 *       page:
 *         type: integer
 *       size:
 *         type: integer
 *       search:
 *         type: string
 *       orderCol:
 *         type: string
 *       order:
 *         type: integer
 */
//#region /order/find-all-paged : post
/**
 * @swagger
 * /order/find-all-paged:
 *   post:
 *     tags:
 *       - Orders
 *     description: Orders by page and its count.
 *     summary: Orders by page and its count.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Order
 *         description: Order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/order_find_all_paged'
 *     responses:
 *       200:
 *         description : Got page count and paged data.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-all-paged", auth.authenticateToken, async (req, res) => {
  const page = req.body.page;
  const size = req.body.size;
  const search = req.body.search;
  const orderCol = req.body.orderCol;
  const order = req.body.order;
  const paymentFilter = req.body.paymentFilter || "";
  const deliveryFilter = req.body.deliveryFilter || "";
  console.log("body",req.body);

  if(req.user.role=="Vendor"){
    return res.send({rows:[],count:0});
  }

  let sql = `call ciydb.order_find_all_paged(${page}, ${size}, '%${search}%', '${orderCol}', ${order} , '${paymentFilter}' , '${deliveryFilter}');`;
  const rows = await conn.getConnection(sql, res);
  
  console.log("dashsql",rows);
  sql = `SET @x = 0; call ciydb.order_find_all_paged_count('%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);
  return res.send({ rows: rows[0], count: count[2][0]["@x"] });
  console.log("count",count)
});
// #endregion

/**
 * @swagger
 * definitions:
 *   order_details_upsert:
 *     properties:
 *       rec_id:
 *         type: integer
 *       order_id:
 *         type: integer
 *       product_id:
 *         type: integer
 *       price:
 *         type: integer
 *       gst:
 *         type: integer
 *       quantity:
 *         type: integer
 */

//#region /order/details/upsert : post
/**
 * @swagger
 * /order/details/upsert:
 *   post:
 *     tags:
 *       - Orders
 *     description: Add and update an order detail.
 *     summary: Add and update an order detail.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Order detail
 *         description: Order detail object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/order_details_upsert'
 *     responses:
 *       200:
 *         description: Order details added/updated.
 *       201:
 *         description: Order details added.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/details/upsert", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  console.log("myrecid",rec_id)
  const order_id = req.body.order_id;
  const product_id = req.body.product_id;
  const price = req.body.price;
  const gst = req.body.gst;
  const quantity = req.body.quantity;
  let sql = `SET @x = ${rec_id}; call ciydb.order_details_upsert(@x, ${order_id}, ${product_id}, ${price}, ${gst}, ${quantity}); SELECT @x`;
  const order_details_res = await conn.getConnection(sql, res);

  if (rec_id === 0) {
    var response = "Order details added successfully.";
    return res
      .status(201)
      .send({ response: response, rec_id: order_details_res[2][0]["@x"] });
  } else {
    var response = "Order details updated successfully.";
    return res
      .status(200)
      .send({ response: response, rec_id: order_details_res[2][0]["@x"] });
  }
});
// #endregion

//#region /order/details/find-by-id : get
/**
 * @swagger
 * /order/details/find-by-id:
 *   get:
 *     tags:
 *       - Orders
 *     description: Find order details by Id.
 *     summary: Find order details by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: rec_id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found order order.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.get("/details/find-details", async (req, res) => {
  const rec_id =req.query.order_id;

  let sql = `
    SELECT od.rec_id, od.order_id, od.product_id, od.price, od.gst, od.quantity, s.store_name AS store_name, p.name AS product_name, pi.image_name
    FROM order_details od
    INNER JOIN products p ON od.product_id = p.rec_id
    INNER JOIN store s ON od.store_id = s.rec_id
    INNER JOIN product_image pi ON pi.product_id = p.rec_id
    WHERE od.order_id = ${rec_id} AND pi.type = 'main'
  `;
  
  conn.connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error retrieving events:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});

router.get("/details/find-user-details", async (req, res) => {
  const rec_id = req.query.order_id;
  let sql = `SELECT * FROM \`order\` WHERE rec_id=${rec_id}`;
  conn.connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error retrieving events:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(results);
    }
  });
});




// #endregion


//#region /order/details/find-by-order-id : post
/**
 * @swagger
 * /order/details/find-by-order-id:
 *   post:
 *     tags:
 *       - Orders
 *     description: Find order details by OrderId.
 *     summary: Find order details by OrderId.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: order_id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found order order.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.post("/details/find-by-order-id", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  let sql = `call ciydb.order_details_by_order_id(${rec_id});`;
  var order_details_obj = await conn.getConnection(sql, res);
  sql = `call ciydb.order_by_id(${rec_id});`;
  var order_obj = await conn.getConnection(sql, res);
  return res.send({ order_details: order_obj[0][0], item_details: order_details_obj[0] });
});
// #endregion


//#region /order/find-by-user-id : get
/**
 * @swagger
 * /order/find-by-user-id:
 *   get:
 *     tags:
 *       - Orders
 *     description: Find orders by user Id.
 *     summary: Find order by user Id.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description : Found orders.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/find-by-user-id", auth.authenticateToken, async (req, res) => {
  const user_id = req.user.rec_id;
  let sql = `call ciydb.order_by_user_id(${user_id});`;
  var order_obj = await conn.getConnection(sql, res);
  return res.send({ response: order_obj[0] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   status_update:
 *     properties:
 *       rec_id:
 *         type: integer
 *       vendor_status:
 *         type: string
 *         enum:
 *          - Accept
 *          - Reject
 *          - Pending
 */

//#region /order/accept_status_update : put
/**
 * @swagger
 * /order/accept_status_update:
 *   put:
 *     tags:
 *       - Orders
 *     description: Update order status.
 *     summary: Update order status.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/status_update'
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
router.put(
  "/accept_status_update",
  auth.authenticateToken,
  async (req, res) => {
    const rec_id = req.body.rec_id;
    const vendor_status = req.body.vendor_status;

    let sql = `CALL order_accept_status_update( ${rec_id}, '${vendor_status}');`;
    let response = await conn.getConnection(sql, res);
    //res.send({ response: response[0], msg: "record updated successfully!" });
    var eamil_body = fs.readFileSync(
      "./email_templates/order_accept.txt",
      "utf8"
    );
    eamil_body = eamil_body
      .replace(/##Respondent##/g, response[0][0].name)
      .replace(/##Email##/g, response[0][0].email_id)
      .replace(/##productName##/g, response[0][0].product_name)
      .replace(/##productCode##/g, response[0][0].product_code)
      .replace(/##transactionId##/g, response[0][0].transation_id)
      .replace(/##vendorName##/g, response[0][0].store_name);

    let mailOptions = {
      from: details.manager_mail_id, // sender address
      to: response[0][0].email_id, // list of receivers
      subject: "CIY order accepted", // Subject line
      html: eamil_body,
    };
    console.log("mail", mailOptions);
    await sendMail.sendorderMail(res, mailOptions);
    // sendMail.sendMail(res, mailOptions, (info) => {
    //   console.log(info)
    //   console.log(
    //     `Mail has been sent and the id is ${info.messageId}`
    //   );
    //   //return response.status(200).send(info);
    // });

    var message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: response[0][0].token_no, //"fmGL-oo2TTOJh1wgkNOWCN:APA91bHm-nZN66Zu4CI2Ma099_Qz4nm5HBTVL20_3YIrih_ZmUnf4vUc6ahMVtONSowUxOzk_0F85_W8mRnozQnCnrw2_TbofqzQL2Y2OZAtBr8fd8zOUUG2kyy6woMT0IGIQmhNeGhK", //response[0][0].token_no,
      // collapse_key: 'your_collapse_key',

      notification: {
        title: `Order accepted by ${response[0][0].store_name}`,
        body: `Your order has been accepted by ${response[0][0].store_name} for product ${response[0][0].product_name}`,
      },

      data: {
        //you can send only notification or only data(or include both)
        my_key: `Order accepted by ${response[0][0].store_name}`,
        my_another_key: `Your order has been accepted by ${response[0][0].store_name} for product ${response[0][0].product_name}`,
      },
    };
    console.log("Token", response[0][0].token_no);
    console.log("notification", message);
    if (response[0][0].token_no != "" && response[0][0].token_no != null) {
      fcm.send(message, function (err, resp) {
        if (err) {
          console.log("Something has gone wrong!");
        }

        return res.send({
          response: response[0],
          msg: "record updated successfully!",
        });
      });
    } else {
      console.log("Token is null", response[0][0].token_no);
    }
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   reject_status_update:
 *     properties:
 *       rec_id:
 *         type: integer
 *       reject_reason:
 *         type: string
 *       vendor_status:
 *         type: string
 *         enum:
 *          - Reject
 *          - Accept
 *          - Pending
 */

//#region /order/reject_status_update : put
/**
 * @swagger
 * /order/reject_status_update:
 *   put:
 *     tags:
 *       - Orders
 *     description: Reject order and update status.
 *     summary: Reject order and update status.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/reject_status_update'
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
router.put(
  "/reject_status_update",
  auth.authenticateToken,
  async (req, res) => {
    const rec_id = req.body.rec_id;
    const reject_reason = req.body.reject_reason;
    const vendor_status = req.body.vendor_status;

    let sql = `CALL order_reject_status_update( ${rec_id}, '${reject_reason}' ,'${vendor_status}');`;
    let response = await conn.getConnection(sql, res);

    var email_body = fs.readFileSync(
      "./email_templates/order_reject.txt",
      "utf8"
    );
    email_body = email_body
      .replace(/##Respondent##/g, response[0][0].name)
      .replace(/##Email##/g, response[0][0].email_id)
      .replace(/##productName##/g, response[0][0].product_name)
      .replace(/##productCode##/g, response[0][0].product_code)
      .replace(/##transactionId##/g, response[0][0].transation_id)
      .replace(/##vendorName##/g, response[0][0].store_name);

    let mailOptions = {
      from: details.manager_mail_id, // sender address
      to: response[0][0].email_id, // list of receivers
      subject: "CIY order rejected", // Subject line
      html: email_body,
    };
    console.log(mailOptions);

    await sendMail.sendorderMail(res, mailOptions);

    var message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: response[0][0].token_no, //"fmGL-oo2TTOJh1wgkNOWCN:APA91bHm-nZN66Zu4CI2Ma099_Qz4nm5HBTVL20_3YIrih_ZmUnf4vUc6ahMVtONSowUxOzk_0F85_W8mRnozQnCnrw2_TbofqzQL2Y2OZAtBr8fd8zOUUG2kyy6woMT0IGIQmhNeGhK", //response[0][0].token_no,
      // collapse_key: 'your_collapse_key',

      notification: {
        title: `Order rejected by ${response[0][0].store_name}`,
        body: `Your order has been rejected by ${response[0][0].store_name} for product ${response[0][0].product_name}`,
      },

      data: {
        //you can send only notification or only data(or include both)
        my_key: `Order rejected by ${response[0][0].store_name}`,
        my_another_key: `Your order has been rejected by ${response[0][0].store_name} for product ${response[0][0].product_name}`,
      },
    };
    console.log("notification", message);
    if (response[0][0].token_no != "" && response[0][0].token_no != null) {
      fcm.send(message, function (err, resp) {
        if (err) {
          console.log("Something has gone wrong!");
        }

        return res.send({
          response: response[0],
          msg: "record updated successfully!",
        });
      });
    } else {
      console.log("Token is null", response[0][0].token_no);
    }
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   refund_initiate:
 *     properties:
 *       rec_id:
 *         type: integer
 *       is_refund:
 *         type: string
 */

//#region /order/refund_initiate : put
/**
 * @swagger
 * /order/refund_initiate:
 *   put:
 *     tags:
 *       - Orders
 *     description: Refund initiate for rejected orders.
 *     summary: Refund initiate for rejected orders.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/refund_initiate'
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
router.put("/refund_initiate", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  const is_refund = req.body.is_refund;

  let sql = `CALL order_refund_initiate( ${rec_id}, '${is_refund}');`;
  let response = await conn.getConnection(sql, res);
  console.log({ response: response[0] });
  var initiateResponse = response[0][0];
  //res.send({ response: response[0], msg: "refund initiated successfully!" });

  var eamil_body = fs.readFileSync(
    "./email_templates/refund_amount.txt",
    "utf8"
  );
  eamil_body = eamil_body
    .replace(/##Respondent##/g, initiateResponse.name)
    .replace(/##Email##/g, initiateResponse.email_id)
    .replace(/##productName##/g, initiateResponse.product_name)
    .replace(/##productCode##/g, initiateResponse.product_code)
    .replace(/##transactionId##/g, initiateResponse.transation_id)
    .replace(/##vendorName##/g, initiateResponse.store_name);

  let mailOptions = {
    from: details.manager_mail_id, // sender address
    to: response[0][0].email_id, // list of receivers
    subject: "CIY order refund initiated", // Subject line
    html: eamil_body,
  };

  console.log(mailOptions);
  await sendMail.sendorderMail(res, mailOptions);
  //  sendMail.sendMail(res, mailOptions, (info) => {
  //   console.log(
  //     `Mail has been sent and the id is ${info.messageId}`
  //   );
  //   return res.status(200).send(info);
  // });

  var message = {
    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: initiateResponse.token_no, //"fmGL-oo2TTOJh1wgkNOWCN:APA91bHm-nZN66Zu4CI2Ma099_Qz4nm5HBTVL20_3YIrih_ZmUnf4vUc6ahMVtONSowUxOzk_0F85_W8mRnozQnCnrw2_TbofqzQL2Y2OZAtBr8fd8zOUUG2kyy6woMT0IGIQmhNeGhK", //response[0][0].token_no,
    // collapse_key: 'your_collapse_key',

    notification: {
      title: `Refund initiated by ${initiateResponse.store_name}`,
      body: `Your amount will be refunded by ${initiateResponse.store_name} for product ${initiateResponse.product_name}`,
    },

    data: {
      //you can send only notification or only data(or include both)
      my_key: `Refund initiated by ${initiateResponse.store_name}`,
      my_another_key: `Your amount will be refunded by ${initiateResponse.store_name} for product ${initiateResponse.product_name}`,
    },
  };
  console.log("notification", message);
  if (initiateResponse.token_no != "" && initiateResponse != null) {
    fcm.send(message, function (err, resp) {
      if (err) {
        console.log("Something has gone wrong!");
      }

      return res.send({
        response: response[0],
        msg: "record updated successfully!",
      });
    });
  } else {
    console.log("Token is null", initiateResponse.token_no);
  }
  res.send({ response: response[0], msg: "refund initiated successfully!" });
});

/**
 * @swagger
 * definitions:
 *   Refund_order_find all paged:
 *     properties:
 *       page:
 *         type: integer
 *       size:
 *         type: integer
 *       search:
 *         type: string
 *       orderBy:
 *         type: string
 *       order:
 *         type: integer
 *       role_id:
 *         type: string
 *       to_date:
 *         type: string
 *       from_date:
 *         type: string
 *       store_id:
 *         type: integer
 */
//#region /order/refund_order/find_all_paged : post
/**
 * @swagger
 * /order/refund_order/find_all_paged:
 *   post:
 *     tags:
 *       - Orders
 *     description: refund orders and count of refund orders.
 *     summary: All refund orders and count of refund orders.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: order
 *         description: Order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Refund_order_find all paged'
 *     responses:
 *       200:
 *         description: Refund orders find all pages and count
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.post(
  "/refund_order/find_all_paged",
  auth.authenticateToken,
  async (req, res) => {
    const page = req.body.page;
    const size = req.body.size;
    const search = req.body.search;
    const orderBy = req.body.orderBy;
    const order = req.body.order;
    const vendor_id = req.user.rec_id;
    const role_id = req.body.role_id;
    const to_date = req.body.to_date;
    const from_date = req.body.from_date;
    const store_id = req.body.store_id;

    let sql = `CALL refund_orders_find_all_paged_by_vendor_id(${page}, ${size}, '%${search}%' ,'${orderBy}', ${order}, ${vendor_id},'${role_id}','${from_date}','${to_date}',${store_id});`;
    const response = await conn.getConnection(sql, res);
    let sqlQuery = `SET @x = 0; CALL refund_orders_find_all_paged_count_by_vendor_id( '%${search}%','${orderBy}', ${order}, ${vendor_id},'${from_date}','${to_date}',${store_id}, @x); SELECT @x;`;
    const count = await conn.getConnection(sqlQuery, res);
    var grouped = groupBy(response[0], "order_id");
    res.send({ response: grouped, count: Object.keys(grouped).length });
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   order_delivery:
 *     properties:
 *       order_id:
 *         type: integer
 *       delivery_type:
 *         type: string
 */

//#region /order/delivery_status/update : put
/**
 * @swagger
 * /order/delivery_status/update:
 *   put:
 *     tags:
 *       - Orders
 *     description: Pickup/delivery order.
 *     summary: Pickup/delivery order.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/order_delivery'
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
router.put(
  "/delivery_status/update",
  auth.authenticateToken,
  async (req, res) => {
    const order_id = req.body.order_id;
    const delivery_type = req.body.delivery_type;
    let sql = `CALL order_delivery_status_update( ${order_id}, '${delivery_type}');`;
    let response = await conn.getConnection(sql, res);
    res.send({
      response: response[0],
      msg: "Delivery status updated successfully!",
    });
  }
);
// #endregion

module.exports = router;
