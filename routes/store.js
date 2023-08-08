const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

//#region /store/get-nearest : get
/**
 * @swagger
 * /store/get-nearest
 *   get:
 *     tags:
 *       - Store
 *     description: List of nearest stores based on pin code.
 *     summary: nearest stores based on pin code.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: pin_code
 *         description: Pin Code
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : List retrieved.
 *       401:
 *         description : Unauthorized.
 *       403:
 *         description : Forbidden.
 *       404:
 *         description : Not Found.
 *     security:
 *       - Bearer: []
 */
router.post("/get-nearest", auth.checkIfTokenExists, async (req, res) => {
  const p_id = req.body.pin_code;

  let sql = `call ciydb.stores_near_by_pincode(${p_id});`;
  response = await conn.getConnection(sql, res);
  return res.status(200).send({ response: response[0] });
});
// #endregion

/**
 * @swagger
 * /store/find-by-category-id:
 *   get:
 *     tags:
 *       - Category
 *     description: Find stores by ctg_id.
 *     summary: stores by ctg_id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: ctg_id
 *         description: Category Id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found stores.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/find-by-category-id", auth.authenticateToken, (req, res) => {
  const ctgId = req.query.ctg_id;

  let sql = `SELECT * from ciydb.products where category_id=${ctgId};`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var storeList = [];
    results.forEach((x) => {
      if (!storeList.includes(x["store_id"])) {
        storeList.push(x["store_id"]);
      }
    });
    var response = storeList;
    return res.send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Store_add:
 *     properties:
 *       recId:
 *         type: integer
 *       store_name:
 *         type: string
 *       store_type:
 *         type: string
 *       store_mobileno:
 *         type: string
 *       store_phoneno:
 *         type: string
 *       store_email:
 *         type: string
 *       gateway_id:
 *         type: string
 *       address1:
 *         type: string
 *       address2:
 *         type: string
 *       zip_code:
 *         type: string
 *       city:
 *         type: string
 *       state:
 *         type: integer
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 */

//#region /store/add : post
/**
 * @swagger
 * /store/add:
 *   post:
 *     tags:
 *       - Store
 *     description: Add store.
 *     summary: Add store
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_add'
 *     responses:
 *       200:
 *         description: Store added successfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/add", (req, res) => {
  console.log("it is being called");
  const user = req.body;
  console.log('user', user);
  const store_name = user.store_name;
  const store_logo = user.store_logo;
  const store_type = user.store_type;
  const store_mobileno = user.store_mobileno;
  const store_phoneno = user.store_phoneno;
  const store_email = user.store_email;
  const gateway_id = user.gateway_id;
  const address1 = user.address1;
  const address2 = user.address2;
  const zip_code = user.zip_code;
  const city = user.city;
  const state = user.state;
  const status = user.status;
  const store_open_time = user.store_open_time;
  const store_close_time = user.store_close_time;

  let sql = `SELECT rec_Id FROM store ORDER BY rec_Id DESC LIMIT 1`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occurred" });
    } else {
      console.log("sql", results);
    }
    // Generate the new recId
    const rec_Id = results.length > 0 ? results[0].rec_Id + 1 : 1;

    sql = `SET @x = ${rec_Id}; call ciydb.store_upsert(@x, '${store_name}', '${store_logo}','${store_type}', '${store_phoneno}', '${store_mobileno}', '${store_email}', '${gateway_id}', '${address1}', '${address2}', '${zip_code}', '${city}', ${state}, '${status}', '${store_open_time}', '${store_close_time}');`;
    console.log(sql);
    conn.connection.query(sql, function (error, results) {
      if (error) {
        return res.status(400).send({ response: error + " occurred" });
      } else {
        console.log("Stored procedure results:", results);
        // Return the rec_Id in the response
        return res.status(200).send({ response: "Store added successfully.", rec_Id });
      }
    });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Store_find_by_id:
 *     properties:
 *       recId:
 *         type: integer
 */
//#region /store/find-by-id : post
/**
 * @swagger
 * /store/find-by-id:
 *   post:
 *     tags:
 *       - Store
 *     description: store find by id.
 *     summary: store find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_find_by_id'
 *     responses:
 *       200:
 *         description: Store data retrieved.
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
  let sql = `call ciydb.store_find_by_id(${recId});`;
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
 *   Store_delete_by_id:
 *     properties:
 *       recId:
 *         type: integer
 */
//#region /store/delete-by-id : post
/**
 * @swagger
 * /store/delete-by-id:
 *   post:
 *     tags:
 *       - Store
 *     description: store delete by id.
 *     summary: store delete by record id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_delete_by_id'
 *     responses:
 *       200:
 *         description: store data deleted.
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
  const recId = user.recId;
  let sql = `call ciydb.store_delete_by_id(${recId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      res.send({ response: error + " occured." });
    }
    var response = "Store id deleted.";
    res.send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   store_type_add:
 *     properties:
 *       recId:
 *         type: integer
 *       store_type:
 *          type: string
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 *           - Delete
 */
//#region /store/type/upsert : post
/**
 * @swagger
 * /store/type/upsert:
 *   post:
 *     tags:
 *       - Store
 *     description: store type add and update.
 *     summary: store type upsert
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/store_type_add'
 *     responses:
 *       200:
 *         description: store type data updated.
 *       201:
 *         description: store type data added.
 *       401:
 *         description : Unauthorized
 *       400:
 *         description : error
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/type/upsert", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const store_type = user.store_type;
  const recId = user.recId;
  const status = user.status;
  let sql = `SET @x = ${recId}; call ciydb.store_type_upsert(@x, '${store_type}', '${status}');`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }

    if (recId === 0) {
      return res
        .status(201)
        .send({ response: "Store type added successfully." });
    } else {
      return res.send({ response: "Store type updated successfully." });
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   ar_offer_upsert:
 *     properties:
 *       rec_Id:
 *         type: integer
 *       store_id:
 *          type: integer
 *       offer_description:
 *          type: string
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 */
//#region /store/ar/upsert : post
/**
 * @swagger
 * /store/ar/upsert:
 *   post:
 *     tags:
 *       - Store
 *     description: store ar offers add and update.
 *     summary: store ar offer upsert
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ar_offer_upsert'
 *     responses:
 *       200:
 *         description: store ar offer data updated.
 *       201:
 *         description: store ar offer data added.
 *       401:
 *         description : Unauthorized
 *       400:
 *         description : error
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/ar/upsert", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const store_id = user.store_id;
  const recId = user.rec_Id;
  const offer_description = user.offer_description;
  const status = user.status;
  let sql = `SET @x = ${recId}; call ciydb.ar_offer_upsert(@x, '${store_id}', '${offer_description}', '${status}');`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    if (recId === 0) {
      return res
        .status(201)
        .send({ response: "Store type added successfully." });
    } else {
      return res
        .status(200)
        .send({ response: "Store type updated successfully." });
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   ar_offer_delete:
 *     properties:
 *       rec_Id:
 *         type: integer
 */
//#region /store/ar/delete : delete
/**
 * @swagger
 * /store/ar/delete:
 *   delete:
 *     tags:
 *       - Store
 *     description: store ar offers data delete by record Id.
 *     summary: store ar offers data delete by record Id .
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ar_offer_delete'
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

router.delete("/ar/delete", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const recId = user.rec_Id;
  let sql = `call ciydb.ar_offer_delete(${recId});`;
  console.log(sql);
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.send({ response: error + " occured." });
    }
    var response = "Store ar offer deleted.";
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   ar_offer_find_all:
 */
//#region /store/ar/find_all : get
/**
 * @swagger
 * /store/ar/find_all:
 *   get:
 *     tags:
 *       - Store
 *     description: store ar offers all data.
 *     summary: store ar offers list
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: store ar offers data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/ar/find_all", auth.authenticateToken, (req, res) => {
  let sql = `call ciydb.ar_offers_find_all();`;
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
 *   Store_find_all_paged:
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
//#region /store/find-all-paged : post
/**
 * @swagger
 * /store/find-all-paged:
 *   post:
 *     tags:
 *       - Store
 *     description: store data find paged data.
 *     summary: store find by paged.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_find_all_paged'
 *     responses:
 *       200:
 *         description : Store typed data retrieved with count.
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
  const user_id = req.user.rec_id;
  const user = req.body;
  const pageNo = user.pageNo;
  const page_size = user.pageSize;
  const status_query = user.statusQuery;
  const search_query = user.searchQuery;
  const orderBy_query = user.orderBy;
  const order_query = user.order;
  // return res.sendStatus(403);
  let sql = `call ciydb.store_find_all_paged('${pageNo}', '${page_size}', '${status_query}', '%${search_query}%', '${orderBy_query}', '${order_query}', '${user_id}');`;
  const rows = await conn.getConnection(sql, res);
  return res.send({ rows: rows[0] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   store-type list:
 */
//#region /store/type/list : get
/**
 * @swagger
 * /store/type/list:
 *   get:
 *     tags:
 *       - Store
 *     description: store type all data.
 *     summary: store type list
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: store type data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/type/list", auth.authenticateToken, (req, res) => {
  let sql = `call ciydb.store_type_list();`;
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
 *   store-find-coordinates:
 */
//#region /store/find-all-coordinates : get
/**
 * @swagger
 * /store/find-all-coordinates:
 *   get:
 *     tags:
 *       - Store
 *     description: get all CIY stores coordinates.
 *     summary: get all CIY stores coordinates
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: store coordinates data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/find-all-coordinates", auth.checkIfTokenExists, (req, res) => {
  let sql = `call ciydb.store_coordinates_find_all();`;
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
 *   Store_type_find_by_id:
 *     properties:
 *       recId:
 *         type: integer
 */
//#region /store/type/find-by-id : post
/**
 * @swagger
 * /store/type/find-by-id:
 *   post:
 *     tags:
 *       - Store
 *     description: store type data find by record Id.
 *     summary: store type find by Id .
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_type_find_by_id'
 *     responses:
 *       200:
 *         description: store type data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.post("/type/find-by-id", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const recId = user.recId;
  let sql = `call ciydb.store_type_find_by_id(${recId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      res.status(400).send({ response: error + " occured." });
    }
    var response = results[0];
    return res.send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Store_type_delete_by_id:
 *     properties:
 *       recId:
 *         type: integer
 */
//#region /store/type/delete-by-id : post
/**
 * @swagger
 * /store/type/delete-by-id:
 *   post:
 *     tags:
 *       - Store
 *     description: store type data delete by record Id.
 *     summary: store type delete by Id .
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_type_delete_by_id'
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

router.post("/type/delete-by-id", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const recId = user.recId;
  let sql = `call ciydb.store_type_delete_by_id(${recId});`;
  console.log(sql);
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.send({ response: error + " occured." });
    }
    var response = "Store type id deleted.";
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Store_type_find_all_paged:
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
//#region /store/type/find-all-paged : post
/**
 * @swagger
 * /store/type/find-all-paged:
 *   post:
 *     tags:
 *       - Store
 *     description: store type data find paged data with count.
 *     summary: store type find by paged and find by count .
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_type_find_all_paged'
 *     responses:
 *       200:
 *         description : Store typed data retrieved with count.
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
  "/type/find-all-paged",
  auth.authenticateToken,
  async (req, res) => {
    const user = req.body;
    const pageNo = user.pageNo;
    const page_size = user.pageSize;
    const status_query = user.statusQuery;
    const search_query = user.searchQuery;
    const orderBy_query = user.orderBy;
    const order_query = user.order;

    let sql = `call ciydb.store_type_find_all_paged(${pageNo}, ${page_size}, '${status_query}', '%${search_query}%', '${orderBy_query}', '${order_query}');`;
    const rows = await conn.getConnection(sql, res);

    sql = `SET @x = 0; call ciydb.store_type_find_all_paged_count('${status_query}', '%${search_query}%', @x); SELECT @x;`;
    const count = await conn.getConnection(sql, res);
    return res.send({ rows: rows[0], count: count[2][0]["@x"] });
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   Store_favourite_upsert:
 *     properties:
 *       product_id:
 *         type: integer
 *       store_id:
 *         type: integer
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 *           - All
 *       rec_id:
 *         type: integer
 */
//#region /store/favourite-upsert : post
/**
 * @swagger
 * /store/favourite-upsert:
 *   post:
 *     tags:
 *       - Store
 *     description: Favourite store add and update.
 *     summary: Favourite store add/update.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_favourite_upsert'
 *     responses:
 *       201:
 *         description : Favourite Store added.
 *       200:
 *         description : Favourite Store updated.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/favourite-upsert", auth.authenticateToken, async (req, res) => {
  const user = req.body;
  const product_id = user.product_id;
  const store_id = user.store_id;
  const user_id = req.user.rec_id;
  const status = user.status;
  const rec_id = user.rec_id;

  let sql = `SET @x = ${rec_id}; call ciydb.favourite_store_upsert(@x, ${product_id}, ${store_id}, ${user_id}, '${status}'); SELECT @x;`;
  const rows = await conn.getConnection(sql, res);
  if (rec_id === 0) {
    return res.status(201).send({ response: "Favourite Shore added" });
  } else {
    return res.status(200).send({ response: "Favourite Shore updated" });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Store_favourite_upsert:
 *     properties:
 *       id:
 *         type: integer
 */
//#region /store/favourite-delete/{id} : delete
/**
 * @swagger
 * /store/favourite-delete/{id}:
 *   delete:
 *     tags:
 *       - Store
 *     description: Favourite store delete by record id.
 *     summary: Favourite store delete.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store
 *         description: Store object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Store_favourite_upsert'
 *     responses:
 *       200:
 *         description : Store favourite deleted.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Store favourite does not exist.
 *     security:
 *       - Bearer: []
 */
router.delete("/favourite-delete", auth.authenticateToken, async (req, res) => {
  const user_id = req.user.rec_id;
  const store_id = req.body.store_id;
  let sql = `SET @x = ${store_id}; call ciydb.favourite_store_delete(@x, ${user_id}); SELECT @x;`;
  const rows = await conn.getConnection(sql, res);
  if (rows[2][0]["@x"] === -1) {
    return res
      .status(404)
      .send({ response: "Store favourite does not exist." });
  } else {
    return res.status(201).send({ response: "Store favourite deleted" });
  }
});
// #endregion

//#region/store/get_active_stores/list: get
/**
 * @swagger
 * /store/get_active_stores/list:
 *   get:
 *     tags:
 *       - Store
 *     description: Returns list of active store names
 *     summary: Get list of active store names.,
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description:  List of active store names
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *         //schema:
 *         //  $ref: '#/definitions/faq'
 *     security:
 *       - Bearer: []
 */

router.get(
  "/get_active_stores/list",
  auth.authenticateToken,
  async (req, res) => {
    //const rec_id = req.params.id;

    const sql = `call get_store()`;

    var result = await conn.getConnection(sql, res);

    return res.status(200).send(result[0]); // return result
  }
);

//#endregion

module.exports = router;
