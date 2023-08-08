const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   Brands_get_top:
 *     properties:
 *       pageSize:
 *         type: integer
 */
//#region /brands/get-top : get
/**
 * @swagger
 * /brands/get-top:
 *   post:
 *     tags:
 *       - Brands
 *     description: brand find by id.
 *     summary: brand find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand
 *         description: brand object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Brands_get_top'
 *     responses:
 *       200:
 *         description: brand data retrieved.
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
  let sql = `call ciydb.brands_get_top(${req.body.pageSize});`;
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
 *   Brands_find_all_paged:
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
//#region /brands/find-all-paged : post
/**
 * @swagger
 * /brands/find-all-paged:
 *   post:
 *     tags:
 *       - Brands
 *     description: brand data find paged data.
 *     summary: brand find by paged.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand
 *         description: brand object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Brand_find_all_paged'
 *     responses:
 *       200:
 *         description : brand typed data retrieved with count.
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
  let sql = `call ciydb.brands_find_all_paged('${pageNo}', '${page_size}', '${status_query}', '%${search_query}%', '${orderBy_query}', '${order_query}');`;
  const rows = await conn.getConnection(sql, res);
  return res.send({ rows: rows[0] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Brand_find_by_id:
 *     properties:
 *       recId:
 *         type: integer
 */
//#region /brands/find-by-id : post
/**
 * @swagger
 * /brands/find-by-id:
 *   post:
 *     tags:
 *       - Brands
 *     description: brand find by id.
 *     summary: brand find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand
 *         description: Brand object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Brand_find_by_id'
 *     responses:
 *       200:
 *         description: Brand data retrieved.
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
  let sql = `call ciydb.brands_find_by_id(${recId});`;
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
 *   Brand_add:
 *     properties:
 *       recId:
 *         type: integer
 *       brand_name:
 *         type: string
 *       brand_logo:
 *         type: string
 *       brand_mobileno:
 *         type: string
 *       brand_phoneno:
 *         type: string
 *       brand_email:
 *         type: string
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 */

//#region /brands/upsert : post
/**
 * @swagger
 * /brands/upsert:
 *   post:
 *     tags:
 *       - Brand
 *     description: Add Brand.
 *     summary: Add Brand
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Brand
 *         description: Brand object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/brand_add'
 *     responses:
 *       200:
 *         description: Brand added successfully.
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
  const brand_name = user.brand_name;
  const brand_logo = user.brand_logo || "";
  const brand_mobileno = user.brand_mobileno;
  const brand_email = user.brand_email;
  const status = user.status;

  let sql = `SET @x = ${recId}; call ciydb.brand_upsert(@x, '${brand_name}', '${brand_logo}','${brand_mobileno}', '${brand_email}', '${status}');`;
  console.log(sql);
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured" });
    }
    return res.status(200).send({ response: "Brand added sucessfully." });
  });
});
// #endregion

/**
 * @swagger
 * /brands/image/upsert:
 *   post:
 *     tags:
 *       - Brands
 *     description: brand image upsert by record Id.
 *     summary: brand image upsert by record Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand_id
 *         description: brand_id
 *         in: query
 *         required: true
 *       - name: image_name
 *         description: image_name
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: brand image uploaded.
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
  const brand_id = req.body.brand_id;
  const image_name = req.body.image_name;

  let sql = `call ciydb.brand_image_upsert(${brand_id}, '${image_name}');`;
  const response = await conn.getConnection(sql, res);
  return res.send({ response: response });
});
// #endregion

module.exports = router;
