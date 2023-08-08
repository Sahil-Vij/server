const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   Size_upsert:
 *     properties:
 *       rec_id:
 *         type: integer
 *       name:
 *         type: string
 *       sub_cat_id:
 *         type: integer
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 */
//#region /size/upsert : post
/**
 * @swagger
 * /size/upsert:
 *   post:
 *     tags:
 *       - Size
 *     description: Add/update size.
 *     summary: Add/update size.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: size
 *         description: Size object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Size_upsert'
 *     responses:
 *       200:
 *         description: Added/updated size successfully.
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
  const rec_id = user.rec_id;
  const name = user.name;
  const sub_category_id = user.sub_cat_id;
  const status = user.status;
  let sql = `SET @x = ${rec_id}; call ciydb.sizes_upsert(@x, '${name}', ${sub_category_id}, '${status}');`;
  console.log(sql);
  conn.connection.query(sql, function (error, results) {
    if (error) {
      res.send({ response: error + " occured." });
    } else if (rec_id === 0) {
      var response = "Size added successfully.";
      return res.send({ response: response });
    } else {
      var response = "Size updated successfully.";
      return res.send({ response: response });
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Size_find_by_id:
 *     properties:
 *       rec_id:
 *         type: integer
 */
//#region /size/find-by-id : post
/**
 * @swagger
 * /size/find-by-id:
 *   post:
 *     tags:
 *       - Size
 *     description: size find by Id.
 *     summary: size find by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: size
 *         description: Size object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Size_find_by_id'
 *     responses:
 *       200:
 *         description: Record retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-by-id", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const rec_id = user.rec_id;
  let sql = `call ciydb.sizes_by_id(${rec_id});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.send({ response: error + " occured." });
    } else {
      var response = results[0];
      return res.send({ response: response });
    }
  });
});

// #endregion

/**
 * @swagger
 * definitions:
 *   Size_delete_by_id:
 *     properties:
 *       rec_id:
 *         type: integer
 */

//#region /size/delete-by-id : post
/**
 * @swagger
 * /size/delete-by-id:
 *   post:
 *     tags:
 *       - Size
 *     description: size delete by Id.
 *     summary: size delete by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: size
 *         description: Size object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Size_delete_by_id'
 *     responses:
 *       200:
 *         description: Size record Id deleted.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/delete-by-id", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const rec_id = user.rec_id;
  let sql = `call ciydb.sizes_delete(${rec_id});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.send({ response: error + " occured." });
    } else {
      var response = "Category id deleted.";
      return res.send({ response: response });
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Size_find_all_paged:
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
//#region /size/find-all-paged : post
/**
 * @swagger
 * /size/find-all-paged:
 *   post:
 *     tags:
 *       - Size
 *     description: size find all paged and count.
 *     summary: size find all paged and count.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: size
 *         description: Size object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Size_find_all_paged'
 *     responses:
 *       200:
 *         description: Size data and count retrieved.
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
  let sql = `call ciydb.sizes_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order});`;
  const rows = await conn.getConnection(sql, res);

  sql = `SET @x = 0;call ciydb.sizes_find_all_paged_count('${filter}', '%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);
  return res.send({ rows: rows[0], count: count[2][0]["@x"] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Sub-Category list:
 */
//#region /size/sub-cat-list : get
/**
 * @swagger
 * /size/sub-cat-list:
 *   get:
 *     tags:
 *       - Size
 *     description: list of sub categories.
 *     summary: list of sub categories.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Size
 *         description: Size object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description : list retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/sub-cat-list", auth.authenticateToken, (req, res) => {
  let sql = `call ciydb.sub_category_list();`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.send({ response: error + " occured." });
    }
    var response = results[0];
    return res.send({ response: response });
  });
});
// #endregion

module.exports = router;
