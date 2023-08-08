const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   Hobby_get_top:
 *     properties:
 *       pageSize:
 *         type: integer
 */
//#region /hobby/get-top : get
/**
 * @swagger
 * /hobby/get-top:
 *   post:
 *     tags:
 *       - Hobby
 *     description: hobby find by id.
 *     summary: hobby find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: hobby
 *         description: hobby object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Hobby_get_top'
 *     responses:
 *       200:
 *         description: hobby data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/get-top", auth.checkIfTokenExists, (req, res) => {
  // const user = req.body;
  // const recId = user.recId;
  let sql = `call ciydb.hobby_get_top(${req.body.pageSize});`;
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
 *   Hobby_find_all_paged:
 *     properties:
 *       pageNo:
 *         type: integer
 *       pageSize:
 *         type: integer
 *       statusQuery:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 *           - All
 *       searchQuery:
 *         type: string
 *       orderBy:
 *         type: string
 *       order:
 *         type: integer
 */
//#region /hobby/find-all-paged : post
/**
 * @swagger
 * /hobby/find-all-paged:
 *   post:
 *     tags:
 *       - Hobby
 *     description: hobby data find paged data.
 *     summary: hobby find by paged.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: hobby
 *         description: hobby object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Hobby_find_all_paged'
 *     responses:
 *       200:
 *         description : hobby typed data retrieved with count.
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
  const user = req.body;
  const pageNo = user.pageNo;
  const page_size = user.pageSize;
  const status_query = user.statusQuery;
  const search_query = user.searchQuery;
  const orderBy_query = user.orderBy;
  const order_query = user.order;
  // return res.sendStatus(403);
  let sql = `call ciydb.hobby_find_all_paged('${pageNo}', '${page_size}', '${status_query}', '%${search_query}%', '${orderBy_query}', '${order_query}');`;
  const rows = await conn.getConnection(sql, res);
  return res.send({ rows: rows[0] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Hobby_find_by_id:
 *     properties:
 *       recId:
 *         type: integer
 */
//#region /hobby/find-by-id : post
/**
 * @swagger
 * /hobby/find-by-id:
 *   post:
 *     tags:
 *       - Hobby
 *     description: hobby find by id.
 *     summary: hobby find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: hobby
 *         description: Hobby object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Hobby_find_by_id'
 *     responses:
 *       200:
 *         description: Hobby data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-by-id", auth.checkIfTokenExists, (req, res) => {
  const user = req.body;
  const recId = user.recId;
  let sql = `call ciydb.hobby_find_by_id(${recId});`;
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
 *   Hobby_add:
 *     properties:
 *       recId:
 *         type: integer
 *       hobby_name:
 *         type: string
 *       hobby_logo:
 *         type: string
 *       hobby_mobileno:
 *         type: string
 *       hobby_phoneno:
 *         type: string
 *       hobby_email:
 *         type: string
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 */

//#region /hobby/upsert : post
/**
 * @swagger
 * /hobby/upsert:
 *   post:
 *     tags:
 *       - Hobby
 *     description: Add Hobby.
 *     summary: Add Hobby
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Hobby
 *         description: Hobby object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/hobby_add'
 *     responses:
 *       200:
 *         description: Hobby added successfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/upsert", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const recId = user.recId;
  const hobby_name = user.hobby_name;
  const hobby_logo = user.hobby_logo || "";
  const status = user.status;

  let sql = `SET @x = ${recId}; call ciydb.hobby_upsert(@x, '${hobby_name}', '${hobby_logo}', '${status}');`;
  console.log(sql);
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured" });
    }
    return res.status(200).send({ response: "Hobby added sucessfully." });
  });
});
// #endregion

/**
 * @swagger
 * /hobby/image/upsert:
 *   post:
 *     tags:
 *       - Hobby
 *     description: hobby image upsert by record Id.
 *     summary: hobby image upsert by record Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: hobby_id
 *         description: hobby_id
 *         in: query
 *         required: true
 *       - name: image_name
 *         description: image_name
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: hobby image uploaded.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/image/upsert", auth.authenticateToken, async (req, res) => {
  const hobby_id = req.body.hobby_id;
  const image_name = req.body.image_name;

  let sql = `call ciydb.hobby_image_upsert(${hobby_id}, '${image_name}');`;
  const response = await conn.getConnection(sql, res);
  return res.send({ response: response });
});
// #endregion

module.exports = router;
