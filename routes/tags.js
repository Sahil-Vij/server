const { response } = require("express");
const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

//#region /tag/find-by-id : get
/**
 * @swagger
 * /tag/find-by-id:
 *   get:
 *     tags:
 *       - Tags
 *     description: Find a tag by its ID.
 *     summary: Find a tag by its ID.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Tag found
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.get("/find-by-id", auth.authenticateToken, async (req, res) => {
  const rec_id = req.query.id;
  let sql = `call ciydb.tags_by_id(${rec_id});`;
  var response = await conn.getConnection(sql);
  res.send({ response: response[0] });
});

//#region /tag/delete-by-id : delete
/**
 * @swagger
 * /tag/delete-by-id:
 *   delete:
 *     tags:
 *       - Tags
 *     description: Delete a tag by its ID.
 *     summary: Delete a tag by its ID.
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
 *         description: Tag deleted successfully
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.delete("/delete-by-id", auth.authenticateToken, async (req, res) => {
  const rec_id = req.query.rec_id;
  let sql = `call ciydb.tags_delete(${rec_id});`;
  var response = await conn.getConnection(sql);
  res.send({ response: response[0] });
});

/**
 * @swagger
 * definitions:
 *   tags_find_all_paged:
 *     properties:
 *       pageNo:
 *         type: integer
 *       pageSize:
 *         type: integer
 *       filter:
 *         type: string
 *       searchQuery:
 *         type: string
 *       orderBy:
 *         type: string
 *       order:
 *         type: integer
 */
//#region /tag/find-all-paged : post
/**
 * @swagger
 * /tag/find-all-paged:
 *   post:
 *     tags:
 *       - Tags
 *     description: Find paged listing of tags.
 *     summary: Find page-wise records of tags for listing and get the total count of all records for pagination.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/tags_find_all_paged'
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

router.post("/find-all-paged", auth.authenticateToken, async (req, res) => {
  const page = req.body.pageNo;
  const size = req.body.pageSize;
  const filter = req.body.filter;
  const search = req.body.searchQuery;
  const orderCol = req.body.orderBy;
  const order = req.body.order;
  var user_id = req.body.user_id;
  if (user_id == 0) user_id = req.user.rec_id;
  let sql = `call ciydb.tags_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order});`;
  const rows = await conn.getConnection(sql, res);

  sql = `call ciydb.tags_find_all_paged_count('${filter}', '%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  res.send({ rows: rows[0], count: count[1][0]["@x"] });
});

/**
 * @swagger
 * definitions:
 *   upsert:
 *     properties:
 *       rec_id:
 *         type: integer
 *       name:
 *         type: string
 *       status:
 *         type: string
 *         enum:
 *          - Active
 *          - Inactive
 */
//#region /tag/upsert : post
/**
 * @swagger
 * /tag/upsert:
 *   post:
 *     tags:
 *       - Tags
 *     description: Add/Edit any tag.
 *     summary: Add/Edit any tag.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/upsert'
 *     responses:
 *       200:
 *         description: Upsert successful
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
  const rec_id = req.body.rec_id;
  const name = req.body.name;
  const status = req.body.status;
  let sql = `SET @x = ${rec_id}; call ciydb.tags_upsert(@x, '${name}', '${status}'); SELECT @x;`;
  var response = await conn.getConnection(sql, res);

  return res.send({ response: response });
});

module.exports = router;
