const express = require("express");

const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");
var groupBy = require("group-by");
const log4js = require("log4js");
const path = require("path");

const filepath = path.join(__dirname, "../error_logs/" + "_logs.txt");
const fs = require("fs");
const { decode } = require("jsonwebtoken");



//#region /product/get-all-colors : get
/**
 * @swagger
 * /product/get-all-colors:
 *   get:
 *     tags:
 *       - Product
 *     description: Get all colors options for Products.
 *     summary: Get all colors options for Products.
 *     produces:
 *       - application/json
 *     parameters:
 *
 *
 *     responses:
 *       200:
 *         description : Success
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get(
  "/get-all-colors",
  auth.checkIfTokenExists,
  async (req, res) => {

    let sql = `select c.rec_id, c.name, c.value from ciydb.colors c where c.status="Active" order by c.name;`;
    const rows = await conn.getConnection(sql, res);
    return res.send({ rows: rows });

    // // const recId = req.query.recId;
    // // let sql = `call ciydb.categories_delete(${recId});`;
    // if (catsAll2 && catsAll2.length > 0) {
    //   console.log("Using cache for categories recursive");
    //   return res.send(catsAll2);
    // } 
    // let sql = `call ciydb.category_list_0();`;
    // var catArray = [];
    // // catsAll2 = [];
    // var response = await conn.getConnection(sql, res);
    // // console.log(response);
    // var cArray = Object.values(JSON.parse(JSON.stringify(response[0])));
    // // console.log(cArray);
    // if (cArray.length == 0) {
    //   return res.status(200).send({ response: response[0] });
    // } else {
    //     for (var i = 0; i < cArray.length; i++) {
    //       let element2 = cArray[i];
    //       if (element2.prod_count > 0) {
    //         let sql2 = `call ciydb.category_list_1(${element2.c0_id});`;
    //         var response2 = await conn.getConnection(sql2, res);
    //         var cArray2 = Object.values(
    //           JSON.parse(JSON.stringify(response2[0]))
    //         );
    //         var tempB = [];
    //         for (var j = 0; j < cArray2.length; j++) {
    //           let element3 = cArray2[j];

    //           if (element3.prod_count > 0) {
    //             let sql3 = `call ciydb.category_list_2(${element3.c1_id});`;
    //             var response3 = await conn.getConnection(sql3, res);
    //             var cArray3 = Object.values(
    //               JSON.parse(JSON.stringify(response3[0]))
    //             );
    //             // console.log

    //             var tempA = [];
    //             for (var k = 0; k < cArray3.length; k++) {
    //               let element4 = cArray3[k];
    //               // console.log(element4);
    //               if (element4.prod_count > 0) {
    //                 // console.log("In or");
    //                 tempA.push(element4);
    //               }
    //             }
    //             element3.subbase = tempA;
    //             tempB.push(element3);
    //           }
    //         }
    //         element2.sub = tempB;
    //         catArray.push(element2);
    //       }

    //     catsAll2 = catArray;
    //     return res.send(catArray);
    //   }
    // }
  }
);
// #endregion


/**
 * @swagger
 * definitions:
 *   pricing_info:
 *     type: array
 *     items:
 *         type: object
 *         properties:
 *           rec_id:
 *              type: integer
 *           price:
 *              type: integer 
 *           color:
 *              type: string
 *           size:
 *              type: integer
 */
/**
 * @swagger
 * definitions:
 *   Product_upsert:
 *     properties:
 *       rec_id:
 *          type: integer
 *       name:
 *          type: string
 *       product_code:
 *          type: string
 *       desc:
 *          type: string
 *       store_id:
 *          type: integer
 *       cat_id:
 *          type: integer
 *       sub_cat_id:
 *          type: integer
 *       product_price:
 *          type: integer
 *       pricing:
 *          $ref: '#/definitions/pricing_info'
 *       pricing_mode:
 *          type: string
 *       brand_name:
 *          type: string
 *       percent_discount:
 *          type: integer
 *       gst:
 *          type: integer
 *       status:
 *          type: string
 *          enum:
 *           - Active
 *           - Inactive
 *           - Delete
 *       approval_status:
 *          type: string
 *          default: 'Pending'
 *          enum:
 *           - Approved
 *           - Rejected
 *           - Pending
 */
//#region /product/upsert : post
/**
 * @swagger
 * /product/upsert:
 *   post:
 *     tags:
 *       - Product
 *     description: Add and update products.
 *     summary: Add and update products.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product_upsert'
 *     responses:
 *       200:
 *         description: product added/updated successfully.
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
  const name = req.body.name.toString().replace(/'/g, "\\'");
  const product_code = req.body.product_code;
  const desc = req.body.desc.toString().replace(/'/g, "\\'");
  var store_id = req.body.store_id;
  const cat_id = req.body.cat_id;
  const sub_cat_id = req.body.sub_cat_id;
  const base_cat_id = req.body.base_cat_id;
  const color_id = req.body.color_id;
  const pricing = req.body.pricing || [];
  const product_price = req.body.product_price;
  const pricing_mode = req.body.pricing_mode;
  const brand_id = req.body.brand_id;
  const percent_discount = req.body.percent_discount;
  const gst = req.body.gst;
  const status = req.body.status;
  var approval_status = req.body.approval_status;

  if (req.user.role === "Vendor") {
    role_id = req.user.rec_id;
    let sqlstoreId = `select store_id from ciydb.system_user where rec_id =${role_id};`;
    let storeresponse = await conn.getConnection(sqlstoreId, res);
    store_id = storeresponse[0].store_id;
    approval_status = "Pending";
  }

  let sql = `SET @x = ${rec_id}; call ciydb.products_upsert(@x, '${name}', ${store_id}, '${product_code}', '${desc}', ${cat_id}, ${sub_cat_id}, ${base_cat_id}, ${color_id},${product_price}, '${pricing_mode}', '${brand_id}', ${percent_discount}, ${gst}, '${status}', '${approval_status}'); SELECT @x;`;
  var inserted_id = await conn.getConnection(sql, res);
  inserted_id = inserted_id[2][0]["@x"];

  sql = `CALL pricing_clear_by_product_id(${rec_id});`;
  await conn.getConnection(sql, res);

  for (element of pricing) {
    if (element.price == 0 || element.size == 0) continue;
    let pricing_sql = `SET @x = ${element.rec_id}; call ciydb.pricing_upsert(@x, ${inserted_id}, ${element.price}, '${element.color}', ${element.size});`;
    await conn.getConnection(pricing_sql, res);
  }

  if (rec_id === 0) {
    var response = "Product added successfully.";
    return res.send({ response: response, inserted_id: inserted_id });
  } else {
    response = "Product updated successfully.";
    return res.send({ response: response, inserted_id: inserted_id });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Product_find_by_id:
 *     properties:
 *       rec_id:
 *         type: integer
 */
//#region /product/find-by-id : post
/**
 * @swagger
 * /product/find-by-id:
 *   post:
 *     tags:
 *       - Product
 *     description: product find by record Id.
 *     summary: product by record Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product_find_by_id'
 *     responses:
 *       200:
 *         description: product retrievied.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-by-id", auth.checkIfTokenExists, async (req, res) => {
  const rec_id = req.body.rec_id;
  const user_type = req.user.user_type;
  const user_id = req.user.rec_id;
  if (user_type == "Mobile") {
    var sql = `call ciydb.products_by_id(${rec_id}, ${user_id});`;
  } else {
    var sql = `call ciydb.products_by_id(${rec_id}, -1);`;
  }
  response = await conn.getConnection(sql, res);
  response = response[0][0];
  sql = `call ciydb.product_image_by_product_id(${rec_id})`;
  img_response = await conn.getConnection(sql, res);
  if (response !== undefined) response["images"] = img_response[0];

  sql = `call ciydb.system_user_get_vendor_details(${req.user.rec_id});`;
  var user_details = await conn.getConnection(sql);
  return res.send({ response: response, user_details: user_details[0][0] });
});
// #endregion

/**
 * @swagger
 * /product/by-brand-subcat:
 *   post:
 *     tags:
 *       - Product
 *     description: product by brand and subcategory
 *     summary: brand find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand_id
 *         description: brand object
 *         in: body
 *         required: true
 *       - name: subcat_id
 *         description: brand object
 *         in: body
 *         required: true
 *
 *     responses:
 *       200:
 *         description: product data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/by-brand-subcat", auth.checkIfTokenExists, (req, res) => {
  console.log("/prod-by-subcat");
  const brand_id = req.body.brand_id;
  const subcat_id = req.body.subcat_id;
  const userId = req.user.rec_id;
  let sql = `call ciydb.products_by_brand_subcat(${brand_id},${subcat_id},${userId});`;
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
 * /product/by-store-subcat:
 *   post:
 *     tags:
 *       - Product
 *     description: product by store and subcategory
 *     summary: store find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand_id
 *         description: store object
 *         in: body
 *         required: true
 *       - name: subcat_id
 *         description: store object
 *         in: body
 *         required: true
 *
 *     responses:
 *       200:
 *         description: product data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/by-store-subcat", auth.checkIfTokenExists, (req, res) => {
  console.log("/prod-by-store-subcat");
  const brand_id = req.body.store_id;
  const subcat_id = req.body.subcat_id;
  const userId = req.user.rec_id;
  let sql = `call ciydb.products_by_store_subcat(${brand_id},${subcat_id},${userId});`;
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
 * /product/by-basecat:
 *   post:
 *     tags:
 *       - Product
 *     description: product by store and subcategory
 *     summary: store find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand_id
 *         description: store object
 *         in: body
 *         required: true
 *       - name: subcat_id
 *         description: store object
 *         in: body
 *         required: true
 *
 *     responses:
 *       200:
 *         description: product data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/by-basecat", auth.checkIfTokenExists, (req, res) => {
  console.log("/prod-by-basecat");
  const cat_id = req.body.basecat_id;
  const userId = req.user.rec_id;
  let sql = `call ciydb.products_by_basecat(${cat_id},${userId});`;
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

/**
 * @swagger
 * /product/by-subcat:
 *   post:
 *     tags:
 *       - Product
 *     description: product by store and subcategory
 *     summary: store find by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand_id
 *         description: store object
 *         in: body
 *         required: true
 *       - name: subcat_id
 *         description: store object
 *         in: body
 *         required: true
 *
 *     responses:
 *       200:
 *         description: product data retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/by-subcat", auth.checkIfTokenExists, (req, res) => {
  console.log("/prod-by-subcat");
  const cat_id = req.body.subcat_id;
  const userId = req.user.rec_id;
  let sql = `call ciydb.products_by_subcat(${cat_id},${userId});`;
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

/**
 * @swagger
 * definitions:
 *   Product_delete_by_id:
 *     properties:
 *       rec_id:
 *         type: integer
 */
//#region /product/delete-by-id : post
/**
 * @swagger
 * /product/delete-by-id:
 *   post:
 *     tags:
 *       - Product
 *     description: product delete by record Id.
 *     summary: product delete by record Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product_delete_by_id'
 *     responses:
 *       200:
 *         description: product deleted.
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
  const rec_id = req.body.rec_id;
  let sql = `call ciydb.products_delete(${rec_id});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.send({ response: error + " occured." });
    } else {
      var response = "Product id deleted.";
      return res.send({ response: response });
    }
  });
});
// #endregion

/**
 * @swagger
 * /product/image/upsert:
 *   post:
 *     tags:
 *       - Product
 *     description: product image upsert by record Id.
 *     summary: product image upsert by record Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: rec_id
 *         in: query
 *         required: true
 *       - name: product_id
 *         description: product_id
 *         in: query
 *         required: true
 *       - name: image_name
 *         description: image_name
 *         in: query
 *         required: true
 *       - name: type
 *         description: image type (Main/Side)
 *         in: query
 *         required: true
 *       - name: status
 *         description: image status
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: product image uploaded.
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
  const rec_id = req.body.rec_id;
  const product_id = req.body.product_id;
  const image_name = req.body.image_name;
  const type = req.body.type;
  const status = req.body.status;

  let sql = `SET @x = ${rec_id}; call ciydb.product_image_upsert(@x, ${product_id}, '${image_name}', '${type}', '${status}');`;
  const response = await conn.getConnection(sql, res);
  return res.send({ response: response });
});
// #endregion

/**
 * @swagger
 * /product/image/delete-by-id:
 *   delete:
 *     tags:
 *       - Product
 *     description: product image delete by record Id.
 *     summary: product image delete by record Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: rec_id
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: product image deleted.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.delete(
  "/image/delete-by-id",
  auth.authenticateToken,
  async (req, res) => {
    const rec_id = req.body.rec_id;
    let sql = `call ciydb.product_image_delete(${rec_id});`;
    await conn.getConnection(sql, res);
    return res.status(200).send({ message: "Image deleted successfully" });
  }
);
// #endregion

/**
 * @swagger
 * /product/image/find-by-id:
 *   get:
 *     tags:
 *       - Product
 *     description: product image find by product Id.
 *     summary: product image find by product Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: rec_id
 *         description: product id
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: product image found.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/image/find-by-id", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  let sql = `call ciydb.product_image_by_product_id(${rec_id});`;
  const imagesRes = await conn.getConnection(sql, res);
  return res.status(200).send({ images: imagesRes[0] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Product_find_by_storeid:
 *     properties:
 *       store_id:
 *         type: integer
 */
//#region /product/find-by-storeId : post
/**
 * @swagger
 * /product/find-by-storeId:
 *   post:
 *     tags:
 *       - Product
 *     description: find products by store Id.
 *     summary: find products by store Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product_find_by_storeid'
 *     responses:
 *       200:
 *         description: products found.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-by-storeId", auth.checkIfTokenExists, (req, res) => {
  const user_id = req.user.rec_id;
  const store_id = req.body.store_id;
  let sql = `call ciydb.products_by_store_id(${store_id}, ${user_id});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.send({ response: error + " occured." });
    } else {
      var response = "Products found";
      var sortedArray = groupBy(results[0], "category_name");
      return res.send({ message: response, response: sortedArray });
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Product_add_to_favourite:
 *     properties:
 *       rec_id:
 *         type: integer
 *       product_id:
 *         type: integer
 *       store_id:
 *         type: integer
 *       user_id:
 *         type: integer
 *       status:
 *         type: string
 *           enum:
 *             - Active
 *
 */
//#region /product/add-to-favourite : post
/**
 * @swagger
 * /product/add-to-favourite:
 *   post:
 *     tags:
 *       - Product
 *     description: add product to favourite by product id.
 *     summary: add product to favourite by product id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product_add_to_favourite'
 *     responses:
 *       201:
 *         description: Product added to favourite.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/add-to-favourite", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  const product_id = req.body.product_id;
  const store_id = req.body.store_id;
  const status = req.body.status;
  const user_id = req.user.rec_id;
  let sql = `SET @x = ${rec_id}; call ciydb.favourite_product_upsert(@x, ${product_id},${store_id},${user_id},'${status}'); SELECT @x;`;
  const count = await conn.getConnection(sql, res);
  if (count[2][0]["@x"] === -1) {
    return res
      .status(404)
      .send({ response: "Please enter the correct rec_id" });
  } else {
    return res.send({
      response: "Product added to favourite",
      rec_id: count[2][0]["@x"],
    });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Product_delete_from_favourite:
 *     properties:
 *       rec_id:
 *         type: integer
 *       product_id:
 *         type: integer
 *       store_id:
 *         type: integer
 *       status:
 *         type: string
 *           enum:
 *             - Inactive
 */
//#region /product/delete-from-favourite : post
/**
 * @swagger
 * /product/delete-from-favourite:
 *   post:
 *     tags:
 *       - Product
 *     description: delete product from favourite by product id.
 *     summary: add product to favourite by product id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product_delete_from_favourite'
 *     responses:
 *       200:
 *         description: Product deleted from favourites.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Please enter the correct rec_id
 *     security:
 *       - Bearer: []
 */
router.delete(
  "/delete-from-favourite",
  auth.authenticateToken,
  async (req, res) => {
    const user_id = req.user.rec_id;
    const product_id = req.body.product_id;
    let sql = `SET @x = ${product_id}; call ciydb.favourite_product_delete(@x, ${user_id}); SELECT @x;`;
    const count = await conn.getConnection(sql, res);
    if (count[2][0]["@x"] === -1) {
      return res
        .status(404)
        .send({ response: "Please enter the correct rec_id" });
    } else {
      return res.send({
        response: "Product removed from favourite",
        rec_id: count[2][0]["@x"],
      });
    }
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   Products_find_all_paged:
 *     properties:
 *       pageNo:
 *         type: integer
 *       pageSize:
 *         type: integer
 *       statusQuery:
 *         type: string
 *       searchQuery:
 *         type: string
 *       orderBy:
 *         type: string
 *       order:
 *         type: integer
 *       role:
 *         type: string
 *         enum:
 *           - Superadmin
 *           - Admin
 *           - Vendor
 *       store_id:
 *         type: integer
 *       from_date:
 *         type: string
 *       to_date:
 *         type: string
 */
//#region /product/find-all-paged : post
/**
 * @swagger
 * /product/find-all-paged:
 *   post:
 *     tags:
 *       - Product
 *     description: product find all paged and count.
 *     summary: product find all paged and count.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Products_find_all_paged'
 *     responses:
 *       200:
 *         description: Product data and count retrieved.
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
  const filter = req.body.statusQuery;
  const search = req.body.searchQuery;
  const orderCol = req.body.orderBy;
  const order = req.body.order;
  const role = req.body.role;
  var store_id = req.body.store_id | -1;
  var from_date = req.body.from_date || "2019-01-01";
  // const from_date = "2019-01-01";
  var to_date =
    req.body.to_date || new Date().toISOString().slice(0, 19).replace("T", " ");

  let role_id = -1;
  console.log(req.user);
  if (req.user.role === "Vendor") {
    role_id = req.user.rec_id;
    let sqlstoreId = `select store_id from ciydb.system_user where rec_id =${role_id};`;
    let storeresponse = await conn.getConnection(sqlstoreId, res);
    store_id = storeresponse[0].store_id;
  }

  if (role === "User") {
    role_id = req.user.rec_id;
  }

  let sql = `call ciydb.products_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order}, ${role_id}, ${store_id}, '${from_date}', '${to_date}');`;
  const rows = await conn.getConnection(sql, res);
  console.log(rows[0].length);
  sql = `SET @x = 0; call ciydb.products_find_all_paged_count('${filter}', '%${search}%', ${role_id}, ${store_id}, '${from_date}', '${to_date}', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);
  let nrows = rows[0]
  if (nrows.length !== count[2][0]["@x"]){
    let trows = [];
    nrows = rows[0].filter((e,i)=>{
      if(trows.includes(e.rec_id)){
        return false;
      }else{
        trows.push(e.rec_id);
        return true;
      }   
    });
  }
  return res.send({ rows: nrows, count: count[2][0]["@x"] });
});
// #endregion


/**
 * @swagger
 * definitions:
 *   Products_find_all_paged_advanced:
 *     properties:
 *       pageNo:
 *         type: integer
 *       pageSize:
 *         type: integer
 *       statusQuery:
 *         type: string
 *       searchQuery:
 *         type: string
 *       orderBy:
 *         type: string
 *       order:
 *         type: integer
 *       role:
 *         type: string
 *         enum:
 *           - Superadmin
 *           - Admin
 *           - Vendor
 *       store_id:
 *         type: integer
 *       from_date:
 *         type: string
 *       to_date:
 *         type: string
 */
//#region /product/find-all-paged-advanced : post
/**
 * @swagger
 * /product/find-all-paged-advanced:
 *   post:
 *     tags:
 *       - Product
 *     description: product find all paged and count.
 *     summary: product find all paged and count.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Product object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Products_find_all_paged_advanced'
 *     responses:
 *       200:
 *         description: Product data and count retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-all-paged-advanced", auth.checkIfTokenExists, async (req, res) => {
  const page = req.body.pageNo;
  const size = req.body.pageSize;
  const filter = req.body.statusQuery;
  const search = req.body.searchQuery;
  const orderCol = req.body.orderBy;
  const order = req.body.order;
  const role = req.body.role;
  const store_id = req.body.store_id || -1;
  const brand_ids = req.body.brand_ids || "";
  const color_ids = req.body.color_ids || "";
  const min_price = req.body.min_price || -1;
  const max_price = req.body.max_price || -1;
  const min_star = req.body.min_star || -1;
  const from_date = req.body.from_date || "2019-01-01";
  // const from_date = "2019-01-01";
  var to_date =
    req.body.to_date || new Date().toISOString().slice(0, 19).replace("T", " ");

  let role_id = -1;
  console.log(req.user);
  if (role === "Vendor") {
    role_id = req.user.rec_id;
    let sqlstoreId = `select store_id from ciydb.system_user where rec_id =${role_id};`;
    let storeresponse = await conn.getConnection(sqlstoreId, res);
    store_id = storeresponse[0].store_id;
  }

  if (role === "User") {
    role_id = req.user.rec_id;
  }

  let sql = `call ciydb.products_all_advanced(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order}, ${role_id}, ${store_id}, '${brand_ids}' , '${color_ids}' , ${min_price} , ${max_price} , ${min_star} ,'${from_date}', '${to_date}');`;
  const rows = await conn.getConnection(sql, res);

  sql = `SET @x = 0; call ciydb.products_all_advanced_count(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order}, ${role_id}, ${store_id}, '${brand_ids}' , '${color_ids}' , ${min_price} , ${max_price} , ${min_star} ,'${from_date}', '${to_date}', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  return res.send({ rows: rows[0], count: count[2][0]["@x"] });
});
// #endregion


// /**
//  * @swagger
//  * definitions:
//  *   Product_price_upsert:
//  *     properties:
//  *       rec_id:
//  *         type: integer
//  *       name:
//  *         type: string
//  *       product_code:
//  *          type: string
//  *       desc:
//  *          type: string
//  *       cat_id:
//  *          type: integer
//  *       sub_cat_id:
//  *          type: integer
//  *       price:
//  *          type: integer
//  *       price_mode:
//  *          type: string
//  *       brand_name:
//  *          type: string
//  *       percent_discount:
//  *          type: integer
//  *       gst:
//  *          type: integer
//  *       status:
//  *          type: string
//  *          enum:
//  *           - Active
//  *           - Inactive
//  */
// //#region /product/pricing/upsert : post
// /**
//  * @swagger
//  * /product/pricing/upsert:
//  *   post:
//  *     tags:
//  *       - Product
//  *     description: product price add and update.
//  *     summary: product price add and update.
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: product
//  *         description: Product object
//  *         in: body
//  *         required: true
//  *         schema:
//  *           $ref: '#/definitions/Product_price_upsert'
//  *     responses:
//  *       200:
//  *         description: product price added/updated sucessfully.
//  *       401:
//  *         description : Unauthorized
//  *       403:
//  *         description : Forbidden
//  *       404:
//  *         description : Not Found
//  *     security:
//  *       - Bearer: []
//  */
// router.post('/pricing/upsert', auth.authenticateToken, (req, res) => {
//     const rec_id = req.body.rec_id;
//     const product_id = req.body.product_id;
//     const price = req.body.price;
//     const color = req.body.color;
//     const size = req.body.size;

//     let sql = `SET @x = ${rec_id}; call ciydb.pricing_upsert(@x, ${product_id}, ${price}, ${color}, ${size}); `;

//     conn.connection.query(sql, function (error, results) {
//         if (error) {
//             return res.send({ 'response': error + " occured." });
//         } else if (rec_id === 0) {
//             var response = "Product added successfully."
//             return res.send({ 'response': response });
//         } else {
//             var response = "Product updated successfully."
//             return res.send({ 'response': response });
//         }
//     });
// });
// // #endregion

/**
 * @swagger
 * definitions:
 *   product_size_list:
 */
//#region /product/size-list : get
/**
 * @swagger
 * /product/size-list:
 *   get:
 *     tags:
 *       - Product
 *     description: list of product size list.
 *     summary: list of product size list.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Product
 *         description: Product object
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
router.get("/size-list", auth.authenticateToken, async (req, res) => {
  const rec_id = req.query.rec_id;

  let sql = `call ciydb.sizes_by_sub_category_id(${rec_id});`;
  response = await conn.getConnection(sql, res);
  return res.send(response[0]);
});
// #endregion

router.post("/bulkUpload", auth.authenticateToken, async (req, res) => {
  const user_id = req.user.rec_id;

  if (filepath) {
    try {
      fs.truncateSync(filepath, 0);
      //file removed
    } catch (err) {
      console.error(err);
    }
  }
  var logger = log4js.getLogger();
  log4js.configure({
    appenders: { logfile: { type: "file", filename: filepath } },
    categories: { default: { appenders: ["logfile"], level: "debug" } },
  });

  logger = log4js.getLogger("logfile");

  let sql1 = `select store_id from ciydb.system_user where rec_id =${user_id};`;
  var response1 = await conn.getConnection(sql1, res);

  var data = req.body.products;
  // catId =req.body.catId;
  // subCatId= req.body.subCatId;
  const approval_status = "Pending";
  const rec_id = 0;
  const rec_count = 0;
  for (let index = 0; index < data.length; index++) {
    logger.info("Record: " + (index + 1).toString());
    let catSql = `select rec_id from ciydb.categories where name ='${data[index].Category}';`;
    var catIdRes = await conn.getConnection(catSql, res);
    if (catIdRes.length == 0) {
      logger.error("Wrong Category");
    } else {
      var catId = catIdRes[0].rec_id;

      let subCatSql = `select rec_id from ciydb.subcategories where name ='${data[index].Subcategory}' &&  category_id ='${catId}';`;
      var subCatIdRes = await conn.getConnection(subCatSql, res);
      if (subCatIdRes.length == 0) {
        logger.error("Wrong Sub Category");
      } else {
        var subCatId = subCatIdRes[0].rec_id;

        let sql = `SET @x = ${rec_id}; call ciydb.products_upsert(@x, '${data[index].Product_Name}', '${response1[0].store_id}', '${data[index].Product_Code}', '${data[index].Description}', ${catId}, ${subCatId}, ${data[index].Price}, '${data[index].pricing_mode}', '${data[index].Brand_Name}', ${data[index].Percent_Discount}, ${data[index].gst}, '${data[index].Status}', '${approval_status}'); SELECT @x;`;

        var inserted_id = await conn.getConnection(sql, res);
        rec_count = rec_count + 1;
        inserted_id = inserted_id[2][0]["@x"];
        for (let i = 1; i <= 15; i++) {
          if (
            data[index]["price" + i] &&
            data[index]["color" + i] &&
            data[index]["size" + i]
          ) {
            let sizeSql = `select rec_id from ciydb.sizes where name ='${data[index].size1}' && sub_category_id ='${subCatId}';`;
            let sizeidRes = await conn.getConnection(sizeSql, res);
            if (sizeidRes.length == 0) {
              logger.error("Wrong Size");
            } else {
              let sizeid = sizeidRes[0].rec_id;

              const rec_id = 0;
              let pricing_sql = `SET @x = ${rec_id}; call ciydb.pricing_upsert(@x, ${inserted_id}, ${data[index].price1}, '${data[index].color1}', ${sizeid});`;
              await conn.getConnection(pricing_sql, res);
            }
          }
        }
      }
    }
  }
  logger.info(rec_count + " Records are inserted");

  var files = fs.createReadStream(filepath);
  res.writeHead(200, {
    "Content-disposition": "attachment; filename=log.txt",
  });
  files.pipe(res);

  //  return res.sendFile(filepath);

  // const mainarray=[];
  // let element=[];
  // for (let index = 0; index < data.length; index++) {
  //   element=[];
  //   element.push(data[index].Product_Name);
  //   element.push(response1[0].store_id);
  //   element.push(data[index].Product_Code);
  //   element.push(data[index].Description);
  //   element.push(data[index].Category);
  //   element.push(data[index].Sub_Category);
  //   element.push(data[index].Price);
  //   element.push(1);
  //   element.push(data[index].Brand_Name);
  //   element.push(1);
  //   element.push(data[index].gst);
  //   element.push(data[index].Status);
  //   element.push(null);
  //   element.push(null);
  //   mainarray.push(element);
  // }

  // let sql  = "INSERT INTO `products`(`name`,\
  //                                 `store_id`,\
  //                                 `product_code`,\
  //                                 `desc`,\
  //                                 `category_id`,\
  //                                 `subcategory_id`,\
  //                                 `price`,\
  //                                 `price_mode`,\
  //                                 `brand_name`,\
  //                                 `Percentage_Discount`,\
  //                                 `gst`,\
  //                                 `status`,\
  //                                 `time_created`,\
  //                                 `time_modified`) VALUES ?";
  // console.log("sql: "+sql);
  // response = await conn.getConnection(sql, res, mainarray);
  // return res.send({message:"Inserted"});
});

//#region /product/sub-cat-list : get
/**
 * @swagger
 * /product/sub-cat-list:
 *   get:
 *     tags:
 *       - Product
 *     description: List of sub categories by Category ID.
 *     summary: List of sub categories by Category ID.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cat_id
 *         description: cat_id
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
router.get("/sub-cat-list", auth.authenticateToken, async (req, res) => {
  const cat_id = req.query.cat_id;

  let sql = `call ciydb.sub_cat_list_by_cat_id(${cat_id});`;
  response = await conn.getConnection(sql, res);
  return res.send({ response: response[0] });
});
// #endregion

//#region /product/review-by-prod-id : get
/**
 * @swagger
 * /product/review-by-prod-id:
 *   get:
 *     tags:
 *       - Product
 *     description: List of reviews by product ID.
 *     summary: List of reviews by product ID.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: prod_id
 *         description: Product ID
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
router.post("/review-by-prod-id", auth.authenticateToken, async (req, res) => {
  const p_id = req.body.prod_id;

  let sql = `call ciydb.reviews_by_product_id(${p_id});`;
  response = await conn.getConnection(sql, res);
  return res.status(200).send({ response: response[0] });
});
// #endregion

//#region /product/review-images-by-prod-id : get
/**
 * @swagger
 * /product/review-images-by-prod-id:
 *   get:
 *     tags:
 *       - Product
 *     description: List of reviews images by product ID.
 *     summary: List of reviews images by product ID.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: prod_id
 *         description: Product ID
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
router.post(
  "/review-images-by-prod-id",
  auth.authenticateToken,
  async (req, res) => {
    const p_id = req.body.prod_id;

    let sql = `call ciydb.review_images_by_product_id(${p_id});`;
    response = await conn.getConnection(sql, res);
    return res.status(200).send({ response: response[0] });
  }
);
// #endregion

module.exports = router;
