const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   Notification_find_by_userId:
 *     properties:
 *       userId:
 *         type: integer
 */
//#region /notifications/find-by-userId : post

/**
 * @swagger
 * /notifications/find-by-userId:
 *   post:
 *     tags:
 *       - Notification
 *     description: notification find by user id.
 *     summary: notification find by user id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: notification
 *         description: Notification object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Notification_find_by_userId'
 *     responses:
 *       200:
 *         description: Notification data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-by-userid", auth.authenticateToken, (req, res) => {
  const userid = req.body.userId;
  let sql = `call ciydb.notification_find_by_userid(${userid});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = results[0];
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Notification_add:
 *     properties:
 *       recId:
 *         type: integer
 *       desc:
 *         type: string
 *       entity_type:
 *         type: string
 *         enum:
 *          - Ads
 *          - Order
 *          - Vendor
 *       entity_id:
 *         type: integer
 *       user_type:
 *         type: string
 *         enum:
 *          - Admin
 *          - Vendor
 *          - Customer
 *       user_id:
 *         type: integer
 *       read_status:
 *          type: string
 *          enum:
 *           - Read
 *           - Unread
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 */
//#region /notifications/add : post
/**
 * @swagger
 * /notifications/add:
 *   post:
 *     tags:
 *       - Notification
 *     description: Add notification.
 *     summary: Add notification
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: notification
 *         description: Notification object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Notification_add'
 *     responses:
 *       200:
 *         description: Notification added successfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/add", auth.authenticateToken, (req, res) => {
  const notification = req.body;
  const recId = notification.recId;
  const desc = notification.desc;
  const entity_type = notification.entity_type;
  const entity_id = notification.entity_id;
  const user_type = notification.user_type;
  const user_id = notification.user_id;
  const read_status = notification.read_status;
  const status = notification.status;
  let sql = `SET @x = ${recId}; call ciydb.notification_upsert(@x, '${desc}', '${entity_type}', '${entity_id}', '${user_type}', '${user_id}', '${read_status}', '${status}');`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured" });
    }
    return res.send({ response: "Notification added sucessfully." });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   UserID_find_by_storeId:
 *     properties:
 *       storeId:
 *         type: integer
 */
//#region /notifications/find-by-storeId : post

/**
 * @swagger
 * /notifications/find-by-storeId:
 *   post:
 *     tags:
 *       - Notification
 *     description: user find by store id.
 *     summary: user find by store id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: notification
 *         description: Notification object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserID_find_by_storeId'
 *     responses:
 *       200:
 *         description: Notification data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-by-storeId", auth.authenticateToken, (req, res) => {
  const storeId = req.body.storeId;
  let sql = `call ciydb.system_user_find_by_store_id(${storeId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = results[0];
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   notification_find_all_paged:
 *     properties:
 *       pageNo:
 *         type: integer
 *       pageSize:
 *         type: integer
 *       filter:
 *         type: string
 *         enum:
 *          - All
 *          - Active
 *          - Inactive
 *       orderBy:
 *         type: string
 *       order:
 *         type: integer
 *       user_id:
 *         type: integer
 */
//#region /notifications/find-all-paged : post
/**
 * @swagger
 * /notifications/find-all-paged:
 *   post:
 *     tags:
 *       - Notification
 *     description: Find paged listing of ads.
 *     summary: Find page-wise records of ads for listing and get the total count of all records for pagination.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/notification_find_all_paged'
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
router.post("/find-all-paged", auth.checkIfTokenExists, async (req, res) => {
  const page = req.body.pageNo; 
  const size = req.body.pageSize;
  const filter = req.body.filter;
  const orderCol = req.body.orderBy;
  const order = req.body.order;
  var user_id = req.body.user_id || -1;
  if (user_id == 0) user_id = req.user.rec_id;
  let sql = `call ciydb.notification_find_all_paged(${page}, ${size}, '${filter}', '${orderCol}', ${order}, ${user_id});`;
  const rows = await conn.getConnection(sql, res);

  sql = `call ciydb.notification_find_all_paged_count('${filter}', ${user_id}, @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  res.send({ rows: rows[0], count: count[1][0]["@x"] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Notification_update:
 *     properties:
 *       recId:
 *         type: integer
 */
//#region /notifications/update : post

/**
 * @swagger
 * /notifications/update:
 *   post:
 *     tags:
 *       - Notification
 *     description: notification find by rec id.
 *     summary: notification find by rec id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: notification
 *         description: Notification object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Notification_update'
 *     responses:
 *       200:
 *         description: Notification data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/update", auth.authenticateToken, (req, res) => {
  const recId = req.body.recId;
  let sql = `call ciydb.notification_change_read_status(${recId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = results[0];
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Notification_count:
 *     properties:
 *       userId:
 *         type: integer
 */
//#region /notifications/update : post

/**
 * @swagger
 * /notifications/update:
 *   post:
 *     tags:
 *       - Notification
 *     description: notification count by rec id.
 *     summary: notification count by rec id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: notification
 *         description: Notification object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Notification_count'
 *     responses:
 *       200:
 *         description: Notification data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/getCount", auth.authenticateToken, (req, res) => {
  const userId = req.body.userId;
  let sql = `call ciydb.notification_count_userid(${userId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = results[0];
    return res.status(200).send({ response: response });
  });
});
// #endregion

module.exports = router;
