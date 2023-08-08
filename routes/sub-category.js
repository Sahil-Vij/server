const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   Sub_category_upsert:
 *     properties:
 *       rec_id:
 *         type: integer
 *       name:
 *         type: string
 *       cat_id:
 *         type: integer
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 */
//#region /sub-category/upsert : post
/**
 * @swagger
 * /sub-category/upsert:
 *   post:
 *     tags:
 *       - Sub-Category
 *     description: Sub-category add or update.
 *     summary: Sub-category upsert.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sub-category
 *         description: Sub-category object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Sub_category_upsert'
 *     responses:
 *       200:
 *         description : category updated successfully.
 *       201:
 *         description : category added successfully.
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
  const cat_id = user.cat_id;
  const status = user.status;
  let sql = `SET @x = ${rec_id}; call ciydb.sub_categories_upsert(@x, '${name}', ${cat_id}, '${status}');`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.send({ response: error + " occured." });
    } else if (rec_id === 0) {
      var response = "Sub-Category added successfully.";
      return res.status(201).send({ response: response });
    } else {
      var response = "Sub-Category updated successfully.";
      return res.status(200).send({ response: response });
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Sub-category_find_by_id:
 *     properties:
 *       rec_id:
 *         type: integer
 */
//#region /sub-category/find-by-id : get
/**
 * @swagger
 * /sub-category/find-by-id:
 *   get:
 *     tags:
 *       - Sub-Category
 *     description: Sub-category find by record id.
 *     summary: Sub-category find by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: Sub-category ID
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : category record by Id.
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
  const rec_id = req.body.rec_id;
  let sql = `call ciydb.sub_category_by_id(${rec_id});`;
  console.log(sql);
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = results[0];
    return res.status(200).send({ response: response });
  });
});
// #endregion

//#region /sub-category/delete-by-id : delete
/**
 * @swagger
 * /sub-category/delete-by-id:
 *   delete:
 *     tags:
 *       - Sub-Category
 *     description: Sub-category delete by record id.
 *     summary: Sub-category delete.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: Sub-category ID
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : record deleted.
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
  const rec_id = req.query.rec_id;
  let sql = `call ciydb.sub_categories_delete(${rec_id});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = "Category id deleted.";
    return res.status(200).send({ response: response });
  });
});
// #endregion

//  /**
//  * @swagger
//  * definitions:
//  *   Sub_category_list:
//  *     properties:
//  *       cat_id:
//  *         type: integer
//  */
// //#region /sub-category/list : get
// /**
//  * @swagger
//  * /sub-category/list:
//  *   get:
//  *     tags:
//  *       - Sub-Category
//  *     description: Sub-category list of all data.
//  *     summary: Sub-category list.
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: sub-category
//  *         description: Sub-category object
//  *         in: body
//  *         required: true
//  *         schema:
//  *           $ref: '#/definitions/Sub_category_list'
//  *     responses:
//  *       200:
//  *         description : list of sub-category.
//  *       401:
//  *         description : Unauthorized
//  *       403:
//  *         description : Forbidden
//  *       404:
//  *         description : Not Found
//  *     security:
//  *       - Bearer: []
//  */
// router.get('/list',auth.authenticateToken, (req, res) => {
//     const user = req.body;
//     const cat_id = user.cat_id;
//     let sql = `call ciydb.sub_category_list(${cat_id});`;
//     conn.connection.query(sql, function(error, results){
//         if (error) { return res.status(400).send({'response' : error + " occured."}); }
//         var response = results[0]
//         return res.send({'response' : response});
//     });
//   });
// // #endregion

/**
 * @swagger
 * definitions:
 *   Sub_category_find_all_paged:
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
 *       orderCol:
 *         type: string
 *       order:
 *         type: integer
 */
//#region /sub-category/find-all-paged : post
/**
 * @swagger
 * /sub-category/find-all-paged:
 *   post:
 *     tags:
 *       - Sub-Category
 *     description: Sub-category data find paged data with count.
 *     summary: Sub-category find by paged and find by count .
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sub-category
 *         description: Sub-category object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Sub_category_find_all_paged'
 *     responses:
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
  let sql = `call ciydb.sub_category_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order})`;
  const rows = await conn.getConnection(sql, res);

  sql = `SET @x = 0; call ciydb.sub_category_find_all_paged_count('${filter}', '%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  return res.status(200).send({ rows: rows[0], count: count[2][0]["@x"] });
});
// #endregion

module.exports = router;
