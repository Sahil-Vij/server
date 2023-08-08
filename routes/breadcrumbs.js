const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   breadcrums_upsert:
 *     properties:
 *       rec_id:
 *         type: integer
 *       name:
 *         type: string
 *       user_id:
 *         type: integer
 *       store_id:
 *         type: integer
 *       no_of_breadcrum:
 *         type: integer
 *       price:
 *         type: number
 *       total:
 *         type: number
 *       is_draft:
 *         type: integer
 *       publish_status:
 *         type: string
 *         enum:
 *           - Yes
 *           - No
 *       status:
 *         type: string
 *         enum:
 *           - Active
 *           - Inactive
 */

//#region /breadcrumbs/upsert : post
/**
 * @swagger
 * /breadcrumbs/upsert:
 *   post:
 *     tags:
 *       - Breadcrumb
 *     description: Add and update breadcrumb.
 *     summary: Add and update breadcrumb.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Breadcrumb
 *         description: Breadcrumb object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/breadcrums_upsert'
 *     responses:
 *       200:
 *         description: Breadcrumb updated.
 *       201:
 *         description: Breadcrumb added.
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
  const user = req.body;
  const recId = user.rec_id;
  const name = user.ad_name;
  const user_id = user.user_id;
  const store_id = user.store_id;
  const no_of_breadcrum = user.no_of_breadcrum;
  const price = user.price;
  const total = user.total;
  const draft = user.is_draft;
  const publish_status = user.publish_status;
  const status = user.status;

  let sql = `SET @x = ${recId}; call ciydb.breadcrums_upsert(@x, '${name}', ${user_id}, ${store_id}, ${no_of_breadcrum}, ${price}, ${total}, ${draft}, '${publish_status}', '${status}'); SELECT @x`;
  const breadcrum_id = await conn.getConnection(sql, res);

  if (recId === 0) {
    var response = "Breadcrum added successfully.";
    return res
      .status(201)
      .send({ response: response, sql_response: breadcrum_id[2][0]["@x"] });
  } else {
    var response = "Breadcrum updated successfully.";
    return res
      .status(200)
      .send({ response: response, sql_response: breadcrum_id[2][0]["@x"] });
  }
});
// #endregion

/**
 * @swagger
 * /breadcrumbs/find-by-id:
 *   get:
 *     tags:
 *       - Breadcrumb
 *     description: Find breadcrumb by Id.
 *     summary: breadcrumb by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: recId
 *         description: recId
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found breadcrumb.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.get("/find-by-id", auth.authenticateToken, (req, res) => {
  const recId = req.query.recId;
  let sql = `call ciydb.breadcrums_by_id(${recId});`;
  console.log(sql);
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = results[0];
    return res.send({ response: response });
  });
});
// #endregion

//#region /breadcrumbs/delete-by-id : delete
/**
 * @swagger
 * /breadcrumbs/delete-by-id:
 *   delete:
 *     tags:
 *       - Breadcrumb
 *     description: Delete breadcrumb by Id.
 *     summary: delete breadcrumb by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: recId
 *         description: recId
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Deleted breadcrumb by Id.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.delete("/delete-by-id", auth.authenticateToken, (req, res) => {
  const recId = req.query.recId;
  let sql = `call ciydb.breadcrums_delete(${recId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = "Breadcrum id deleted.";
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   breadcrums_find_all_paged:
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
 *       userId:
 *         type:integer
 */
//#region /breadcrumbs/find-all-paged : post
/**
 * @swagger
 * /breadcrumbs/find-all-paged:
 *   post:
 *     tags:
 *       - Breadcrumb
 *     description: breadcrumb by page and its count.
 *     summary: breadcrumb by page and its count.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Breadcrumb
 *         description: Breadcrumb object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/breadcrums_find_all_paged'
 *     responses:
 *       200:
 *         description : got page count and paged data.
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
  const page = req.body.pageNo;
  const size = req.body.pageSize;
  const filter = req.body.statusQuery;
  const search = req.body.searchQuery;
  const orderCol = req.body.orderBy;
  const order = req.body.order;
  let userId = req.body.userId;
  if (userId == 0) userId = req.user.rec_id;

  let sql = `call ciydb.breadcrums_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order}, ${userId});`;
  const rows = await conn.getConnection(sql, res);

  sql = `SET @x = 0; call ciydb.breadcrums_find_all_paged_count('${filter}', '%${search}%', ${userId}, @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  return res.send({ rows: rows[0], count: count[2][0]["@x"] });
});
// #endregion

/**
 * @swagger
 * /breadcrumbs/get-breadscrumb-price:
 *   get:
 *     tags:
 *       - Breadcrumb
 *     description: Get breadcrumb price.
 *     summary: breadcrumb price.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description : Found breadcrumb price.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.get("/get-breadscrumb-price", auth.authenticateToken, (req, res) => {
  let sql = `call ciydb.breadcrum_get_price();`;
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
 *   breadcrumbs_set_publish_status:
 *     properties:
 *       rec_id:
 *         type: integer
 *       publish_status:
 *         type: string
 */
//#region /breadcrumbs/set-publish-status : post
/**
 * @swagger
 * /breadcrumbs/set-publish-status:
 *   post:
 *     tags:
 *       - Breadcrumb
 *     description: Set publish status for a breadcrumb.
 *     summary: Set publish status for a breadcrumb.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Breadcrumb object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/breadcrumbs_set_publish_status'
 *     responses:
 *       200:
 *         description: Publish status set successfully
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/set-publish-status", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  const publish_status = req.body.publish_status;
  let sql = `call ciydb.breadcrumb_update_publish_status(${rec_id}, '${publish_status}');`;
  var response = await conn.getConnection(sql, res);

  res.send({ response: response[0] });
});
// #endregion

module.exports = router;
