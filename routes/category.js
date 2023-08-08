const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   Category_upsert:
 *     properties:
 *       recId:
 *         type: integer
 *       store_type_id:
 *         type: integer
 *       name:
 *         type: string
 *       status:
 *         type: string
 *         enum:
 *           - Active
 *           - Inactive
 */

//#region /category/upsert : post
/**
 * @swagger
 * /category/upsert:
 *   post:
 *     tags:
 *       - Category
 *     description: Add and update Category.
 *     summary: Add and update category.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Category
 *         description: Category object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Category_upsert'
 *     responses:
 *       200:
 *         description: category updated.
 *       201:
 *         description: category added.
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
  const recId = user.recId;
  const store_type_id = user.store_type_id || 0;
  const name = user.name;
  const status = user.status;
  let sql = `SET @x = ${recId}; call ciydb.categories_upsert(@x, ${store_type_id}, '${name}', '${status}'); SELECT @x`;
  const category_id = await conn.getConnection(sql, res);

  if (recId === 0) {
    var response = "Category added successfully.";
    return res
      .status(201)
      .send({ response: response, sql_response: category_id[2][0]["@x"] });
  } else {
    var response = "Category updated successfully.";
    return res
      .status(200)
      .send({ response: response, sql_response: category_id[2][0]["@x"] });
  }
});
// #endregion

/**
 * @swagger
 * /category/find-by-id:
 *   get:
 *     tags:
 *       - Category
 *     description: Find category by Id.
 *     summary: category by Id.
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
 *         description : Found category.
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
  const recId = req.body.recId;
  let sql = `call ciydb.category_by_id(${recId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = results[0];
    return res.send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * /category/find-by-store-id:
 *   get:
 *     tags:
 *       - Category
 *     description: Find category by store_id.
 *     summary: category by store_id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: store_id
 *         description: Store Id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found categories.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-by-store-id", auth.checkIfTokenExists, (req, res) => {
  console.log("/find-by-store-id Called");
  const recId = req.body.store_id;
  let sql = `SELECT p.subcategory_id, sc.name from ciydb.products p left join subcategories sc on sc.rec_id =  p.subcategory_id where p.store_id=${recId} and p.status="Active";`;
  // let sql = `SELECT * from ciydb.products  where brand_id=${recId} ;`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var categoryList = [];
    var tempList = [];
    results.forEach((x) => {
      if (!tempList.includes(x["subcategory_id"])) {
        tempList.push(x["subcategory_id"]);
        categoryList.push({
          sub_category_id: x["subcategory_id"],
          sub_category_name: x["name"],
        });
      }
    });
    var response = categoryList;
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * /category/find-by-brand-id:
 *   get:
 *     tags:
 *       - Category
 *     description: Find category by brand_id.
 *     summary: category by brand_id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand_id
 *         description: Brand Id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found categories.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
 router.post("/find-by-brand-id", auth.checkIfTokenExists, (req, res) => {
  console.log("/find-by-brand-id Called");
  const recId = req.body.brand_id;
  let sql = `SELECT p.subcategory_id, sc.name from ciydb.products p left join subcategories sc on sc.rec_id =  p.subcategory_id where p.brand_id=${recId} and p.status="Active";`;
  // let sql = `SELECT * from ciydb.products  where brand_id=${recId} ;`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var categoryList = [];
    var tempList = [];
    results.forEach((x) => {
      if (!tempList.includes(x["subcategory_id"])) {
        tempList.push(x["subcategory_id"]);
        categoryList.push({
          sub_category_id: x["subcategory_id"],
          sub_category_name: x["name"],
        });
      }
    });
    var response = categoryList;
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * /category/find-by-brand-id:
 *   get:
 *     tags:
 *       - Category
 *     description: Find category by brand_id.
 *     summary: category by brand_id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: brand_id
 *         description: Brand Id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Found categories.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/find-by-hobby-id", auth.checkIfTokenExists, (req, res) => {
  console.log("/find-by-hobby-id Called");
  const recId=req.body.hobby_id;
  //let sql = `SELECT p.subcategory_id, sc.name from ciydb.products p left join subcategories sc on sc.rec_id =  p.subcategory_id where p.hobby_id=${recId} and p.status="Active";`;
  let sql = `
  SELECT
    p.subcategory_id,
    sc.name,
    sc.image
  FROM
    ciydb.products p
    LEFT JOIN subcategories sc ON sc.rec_id = p.subcategory_id
  WHERE
    p.hobby_id = ${recId}
    AND p.status = "Active";
`;

  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var categoryList = [];
    var tempList = [];
    results.forEach((x) => {
      if (!tempList.includes(x["subcategory_id"])) {
        tempList.push(x["subcategory_id"]);
        categoryList.push({
          sub_category_id: x["subcategory_id"],
          sub_category_name: x["name"],
          image_url: x["image"] // Add the image URL property
        });
      }
    });
    
    var response = categoryList;
    return res.status(200).send({ response: response });
  });
});
// #endregion

var catsAll = [];

//#region /category/get-all-recursive : get
/**
 * @swagger
 * /category/get-all-recursive:
 *   get:
 *     tags:
 *       - Category
 *     description: Get All Categories Recursively.
 *     summary: Get All Categories Recursively.
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
router.get("/get-all-recursive", auth.checkIfTokenExists, async (req, res) => {
  // const recId = req.query.recId;
  // let sql = `call ciydb.categories_delete(${recId});`;

  let sql = `call ciydb.category_list_0();`;
  var catArray = [];
  // catsAll = [];
  var response = await conn.getConnection(sql, res);
  // console.log(response);
  var cArray = Object.values(JSON.parse(JSON.stringify(response[0])));
  // console.log(cArray);
  if (cArray.length == 0) {
    return res.status(200).send({ response: response[0] });
  } else {
    if (catsAll.length > 0) {
      console.log("Using cache for categories recursive");
      return res.send(catsAll);
    } else {
      for (var i = 0; i < cArray.length; i++) {
        let element2 = cArray[i];
        // if (element2.prod_count > 0) {
        let sql2 = `call ciydb.category_list_1(${element2.c0_id});`;
        var response2 = await conn.getConnection(sql2, res);
        var cArray2 = Object.values(JSON.parse(JSON.stringify(response2[0])));
        var tempB = [];
        for (var j = 0; j < cArray2.length; j++) {
          let element3 = cArray2[j];

          // if (element3.prod_count > 0) {
          let sql3 = `call ciydb.category_list_2(${element3.c1_id});`;
          var response3 = await conn.getConnection(sql3, res);
          var cArray3 = Object.values(JSON.parse(JSON.stringify(response3[0])));

          var tempA = [];
          for (var k = 0; k < cArray3.length; k++) {
            let element4 = cArray3[k];
            // if (element4.prod_count > 0) {
            tempA.push(element4); 
            // }
          }
          element3.subbase = tempA;
          tempB.push(element3);
          // }
        }
        element2.sub = tempB;
        catArray.push(element2);
        // }
      }
      catsAll = catArray;
      return res.send(catArray);
    }
  }

  // conn.connection.query(sql, function (error, results) {
  //   if (error) {
  //     return res.status(400).send({ response: error + " occured." });
  //   }

  //   var response = "Category id deleted.";
  //   return res.status(200).send({ response: response });
  // });
});
// #endregion

var catsAll2 = [];

//#region /category/get-all-recursive-withprods : get
/**
 * @swagger
 * /category/get-all-recursive-withprods:
 *   get:
 *     tags:
 *       - Category
 *     description: Get All Categories Recursively which has products.
 *     summary: Get All Categories Recursively which has products.
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
router.get("/get-all-recursive-withprods", auth.checkIfTokenExists, async (req, res) => {
  let sql = `call ciydb.category_list_0();`;
  var catArray = [];
  var response = await conn.getConnection(sql, res);
  var cArray = Object.values(JSON.parse(JSON.stringify(response[0])));

  if (cArray.length == 0) {
    return res.status(200).send({ response: response[0] });
  } else {
    if (catsAll2.length > 0) {
      console.log("Using cache for categories recursive");
      return res.send(catsAll2);
    } else {
      for (var i = 0; i < cArray.length; i++) {
        let element2 = cArray[i];
        let sql2 = `call ciydb.category_list_1(${element2.c0_id});`;
        var response2 = await conn.getConnection(sql2, res);
        var cArray2 = Object.values(JSON.parse(JSON.stringify(response2[0])));
        var tempB = [];
        for (var j = 0; j < cArray2.length; j++) {
          let element3 = cArray2[j];
          let sql3 = `call ciydb.category_list_2(${element3.c1_id});`;
          var response3 = await conn.getConnection(sql3, res);
          var cArray3 = Object.values(JSON.parse(JSON.stringify(response3[0])));
          var tempA = [];
          for (var k = 0; k < cArray3.length; k++) {
            let element4 = cArray3[k];
            let sql4 = `call ciydb.category_products(${element4.c2_id});`;
            var response4 = await conn.getConnection(sql4, res);
            var prodArray = Object.values(JSON.parse(JSON.stringify(response4[0])));
            element4.products = prodArray;
            tempA.push(element4);
          }
          element3.subbase = tempA;
          tempB.push(element3);
        }
        element2.sub = tempB;
        catArray.push(element2);
      }
      catsAll2 = catArray;
      return res.send(catArray);
    }
  }
});

// #endregion

//#region /category/delete-by-id : delete
/**
 * @swagger
 * /category/delete-by-id:
 *   delete:
 *     tags:
 *       - Category
 *     description: Delete category by Id.
 *     summary: delete category by Id.
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
 *         description : Deleted category by Id.
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
  let sql = `call ciydb.categories_delete(${recId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send({ response: error + " occured." });
    }
    var response = "Category id deleted.";
    return res.status(200).send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   Category_find_all_paged:
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
//#region /category/find-all-paged : post
/**
 * @swagger
 * /category/find-all-paged:
 *   post:
 *     tags:
 *       - Category
 *     description: category by page and its count.
 *     summary: category by page and its count.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Category
 *         description: Category object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Category_find_all_paged'
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
  let sql = `call ciydb.category_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order});`;
  const rows = await conn.getConnection(sql, res);

  sql = `SET @x = 0 ;call ciydb.category_find_all_paged_count('${filter}', '%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  return res.send({ rows: rows[0], count: count[2][0]["@x"] });
});
// #endregion

/**
 * @swagger
 * /category/list:
 *   get:
 *     tags:
 *       - Category
 *     description: list of categories.
 *     summary: list of categories.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: recId
 *         description: Category
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description : list of category retrieved.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/list", auth.authenticateToken, (req, res) => {
  let sql = `call ciydb.category_list();`;
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
