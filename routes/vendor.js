const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");
var groupBy = require("group-by");

/**
 * @swagger
 * definitions:
 *   Vendor find all paged:
 *     properties:
 *       page:
 *         type: integer
 *       size:
 *         type: integer
 *       filter:
 *         type: string
 *       search:
 *         type: string
 *       orderCol:
 *         type: string
 *       order:
 *         type: integer
 */
//#region /vendor/find_all_paged : post

/**
 * @swagger
 * definitions:
 *   Vendor_order_find all paged:
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
 *       filter:
 *         type: string
 *       store_id:
 *         type: integer
 */
//#region /vendor/vendor_order/find_all_paged : post

/**
 * @swagger
 * /vendor/find_all_paged:
 *   post:
 *     tags:
 *       - Vendor
 *     description: Find all vendor and count of vendor.
 *     summary: All vendor and total count.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_find_all_paged'
 *     responses:
 *       200:
 *         description: vendor find all pages and count
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
  const filter = req.body.filter;
  const search = req.body.search;
  const orderCol = req.body.orderCol;
  const order = req.body.order;

  let sql = `call ciydb.vendor_find_all_paged(${page}, ${size}, '${filter}', '%${search}%' ,'${orderCol}', ${order});`;
  const response = await conn.getConnection(sql, res);
  let sqlQuery = `SET @x = 0; call ciydb.vendor_find_all_paged_count('${filter}', '%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sqlQuery, res);
  res.send({ response: response[0], count: count[2][0]["@x"] });
});
// #endregion

/**
 * @swagger
 * /vendor/vendor_order/find-all-paged:
 *   post:
 *     tags:
 *       - Vendor
 *     description: vendor's orders and count of vendor's order.
 *     summary: All vendor's ordes and total count.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Vendor_order_find all paged'
 *     responses:
 *       200:
 *         description: vendor find all pages and count
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
  "/vendor_order/find-all-paged",
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
    const filter = req.body.filter;
    const store_id = req.body.store_id;

    let sql = `CALL orders_find_all_paged_by_vendor_id(${page}, ${size}, '%${search}%' ,'${orderBy}', ${order}, ${vendor_id},'${role_id}','${from_date}','${to_date}','${filter}',${store_id});`;
    const response = await conn.getConnection(sql, res);
    let sqlQuery = `SET @x = 0; CALL orders_find_all_paged_count_by_vendor_id( '%${search}%','${orderBy}', ${order}, ${vendor_id},'${from_date}','${to_date}','${filter}',${store_id}, @x); SELECT @x;`;
    const count = await conn.getConnection(sqlQuery, res);
    var grouped = groupBy(response[0], "order_id");

    let total = response[0].reduce((sum, record) => {
      if (record.vendor_status.toLowerCase() === "reject") {
        return sum - record.amount;
      } else {
        return sum + record.amount;
      }
    }, 0);

    res.send({
      response: grouped,
      count: Object.keys(grouped).length,
      total: total,
    });
    // { response: response[0], count: count[2][0]["@x"] }
  }
);
// #endregion
module.exports = router;
