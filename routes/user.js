const express = require("express");
const router = express.Router();
const passwordHash = require("password-hash");
const conn = require("../connection");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
var groupBy = require("group-by");
const join = require("array-join").join;
const { json } = require("body-parser");
const e = require("express");
const { response } = require("express");

/**
 * @swagger
 * definitions:
 *   User_add:
 *     properties:
 *       rec_id:
 *         type: integer
 *       username:
 *         type: string
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       mobile:
 *         type: string
 *       address1:
 *         type: string
 *       address2:
 *         type: string
 *       status:
 *         type: string
 *         enum:
 *          - Active
 *          - Inactive
 *       password:
 *         type: string
 *       city:
 *         type: string
 *       state:
 *         type: integer
 *       zipcode:
 *         type: string
 *       token:
 *         type: string
 */

//#region /user/add-user : post
/**
 * @swagger
 * /user/add-user:
 *   post:
 *     tags:
 *       - User
 *     description: Add user.
 *     summary: Add user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User_add'
 *     responses:
 *       201:
 *         description: User added successfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 */

/**
 * @swagger
 * definitions:
 *   Set_Default_Address:
 *     properties:
 *       rec_id:
 *         type: integer
 *       user_id:
 *         type: integer
 */
//#endregion

router.post("/add-user", async (req, res) => {
  var users = req.body;
  const rec_id = users.rec_id;
  const username = users.username;
  const password = users.password;
  const name = users.name;
  const mobile = users.mobile;
  const email = users.email;
  const address1 = users.address1;
  const address2 = users.address2;
  const city = users.city;
  const state = users.state;
  const zipcode = users.zipcode;
  const token = users.token;
  const status = users.status;

  var hashedPassword = "";
  if (password !== "" && rec_id === 0) {
    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);
  } else if (password !== "" && rec_id !== 0) {
    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);
  }
  let sql = `SET @x = ${rec_id}; call ciydb.users_upsert(@x, '${username}', '${hashedPassword}', '${name}', '${mobile}', '${email}', '${address1}', '${address2}', '${city}', ${state}, '${zipcode}' ,'${token}' ,'${status}'); SELECT @x;`;
  const upsert_id = await conn.getConnection(sql, res);
  if (upsert_id[2][0]["@x"] === -1) {
    return res.send({
      response: "User failed to login. Try with different username.",
      sql_response: upsert_id[2][0]["@x"],
    });
  } else {
    return res.status(201).send({ message: "User added successfully." });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   User_update:
 *     properties:
 *       username:
 *         type: string
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       mobile:
 *         type: string
 *       address1:
 *         type: string
 *       address2:
 *         type: string
 *       status:
 *         type: string
 *         enum:
 *          - Active
 *          - Inactive
 *       password:
 *         type: string
 *       city:
 *         type: string
 *       state:
 *         type: integer
 *       zipcode:
 *         type: string
 *       token:
 *         type: string
 */

//#region /user/update-user : put
/**
 * @swagger
 * /user/update-user:
 *   put:
 *     tags:
 *       - User
 *     description: Update user.
 *     summary: Update user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User_update'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.put("/update-user", auth.authenticateToken, async (req, res) => {
  var users = req.body;
  const rec_id = req.user.rec_id;
  const username = users.username;
  const password = users.password;
  const name = users.name;
  const mobile = users.mobile;
  const email = users.email;
  const address1 = users.address1;
  const address2 = users.address2;
  const city = users.city;
  const state = users.state;
  const zipcode = users.zipcode;
  const token = users.token;
  const status = users.status;
  var hashedPassword = "";
  if (password !== "" && rec_id === 0) {
    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);
  } else if (password !== "" && rec_id !== 0) {
    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);
  }
  let sql = `SET @x = ${rec_id}; call ciydb.users_upsert(@x, '${username}', '${hashedPassword}', '${name}', '${mobile}', '${email}', '${address1}', '${address2}', '${city}', ${state}, '${zipcode}' ,'${token}' ,'${status}'); SELECT @x;`;
  const upsert_id = await conn.getConnection(sql, res);
  if (upsert_id[2][0]["@x"] === -1) {
    return res.send({
      response: "User failed to login. Try with different username.",
      sql_response: upsert_id[2][0]["@x"],
    });
  } else {
    return res.status(201).send({
      message: "User updated successfully.",
      sql_response: upsert_id[2][0]["@x"],
    });
  }
});
// #endregion

//#region /user/delete/{id} : delete
/**
 * @swagger
 * /user/delete/{id}:
 *   delete:
 *     tags:
 *       - User
 *     description: Delete a user.
 *     summary: Delete user.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: User object
 *         in: body
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: user deleted.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.delete("/delete/:id", auth.authenticateToken, (req, res) => {
  const recId = req.params.id;
  let sql = `call ciydb.users_delete_by_id(${recId});`;
  conn.connection.query(sql);
  return res.status(200).send({ message: "User deleted." });
});

// #endregion

/**
 * @swagger
 * definitions:
 *   users_login:
 *     properties:
 *       mobile_no:
 *         type: string
 *       password:
 *         type: string
 */
//#region /user/login : post
/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - User
 *     description: login for users.
 *     summary: login for user.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/users_login'
 *     responses:
 *       200:
 *         description: login user
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/login", async function (req, res) {
  var users = req.body;
  var mobile_no = users.mobile_no;
  //mobile_no = mobile_no.slice(3);

  var login_type = users.login_type;
  var mail_id = users.email;
  var password = users.password;
  if (login_type == "Mail") {
    let sql = `select * from users where email_id = "${mail_id}" and status="Active"`;
    let users = await conn.getConnection(sql, res);
    if (users.length < 1) return res.status(404).json({message:"User not Found"});
    var checkHash = bcrypt.compareSync(password, users[0].password);
    if (!checkHash) return res.status(401).json({message:"Invalid Password"});
    const token = auth.generateAccessToken({
      rec_id: users[0].rec_id,
      user_type: "Web",
    });
    return res.json({message:"Logged in successfully",token});
  } else if (login_type == "Social") {
    let sql = `call ciydb.users_find_by_email('${mobile_no}');`;
    conn.connection.query(sql, function (error, result) {
      if (error) {
        return res.status(400).send({ message: "error occured " + error });
      }
      if (result[0].length === 0) {
        return res.status(403).send({ message: "Enter correct username" });
      } else {
        // No more need for checking passwords as users will login via OTP

        // var checkHash = bcrypt.compareSync(password, result[0][0].password);
        // if (checkHash === false) {
        //   return res
        //     .status(403)
        //     .send({ message: "Enter correct username and password." });
        // } else {

        const token = auth.generateAccessToken({
          rec_id: result[0][0].rec_id,
          user_type: "Mobile",
        });
        return res
          .status(200)
          .send({ message: "User logged in.", token: token });
      }
    });
  } else {
    let sql = `call ciydb.users_find_by_mobile('${mobile_no}');`;
    conn.connection.query(sql, function (error, result) {
      if (error) {
        return res.status(400).send({ message: "error occured " + error });
      }
      if (result[0].length === 0) {
        return res.status(403).send({ message: "Enter correct username" });
      } else {
        // No more need for checking passwords as users will login via OTP

        // var checkHash = bcrypt.compareSync(password, result[0][0].password);
        // if (checkHash === false) {
        //   return res
        //     .status(403)
        //     .send({ message: "Enter correct username and password." });
        // } else {

        const token = auth.generateAccessToken({
          rec_id: result[0][0].rec_id,
          user_type: "Mobile",
        });
        return res
          .status(200)
          .send({ message: "User logged in.", token: token });
      }
    });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_find_all_paged:
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
//#region /user/find-all-paged : post
/**
 * @swagger
 * /user/find-all-paged:
 *   post:
 *     tags:
 *       - User
 *     description: Find all users and count of users.
 *     summary: All users and total count.,
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
 *         description: user find all paged and count
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
  console.log(req.body);
  const page = req.body.page;
  const size = req.body.size;
  const filter = req.body.filter;
  const search = req.body.search;
  const orderCol = req.body.orderCol;
  const order = req.body.order;

  let sql = `call ciydb.users_find_all_paged(${page}, ${size}, '${filter}', '%${search}%' ,'${orderCol}', ${order});`;
  const response = await conn.getConnection(sql, res);
  let sqlQuery = `SET @x = 0; call ciydb.users_find_all_paged_count('${filter}', '%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sqlQuery, res);
  return res
    .status(200)
    .send({ response: response[0], count: count[2][0]["@x"] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_find_by_Id:
 */
//#region /user/find-by-id : post
/**
 * @swagger
 * /user/find-by-id:
 *   post:
 *     tags:
 *       - User
 *     description: Find a user by rec id.
 *     summary: user by id,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: user find by Id
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
  const recId = req.user.rec_id;
  let sql = `call ciydb.users_find_by_id(${recId});`;
  conn.connection.query(sql, function (error, results) {
    var response = results[0];
    if (response.length > 0) {
      return res.status(200).send({ response: response });
    } else {
      return res.status(204).send({ response: [] });
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_favorites_by_userId:
 */
//#region /user/favorites-by-userid : post
/**
 * @swagger
 * /user/favorites-by-userid:
 *   post:
 *     tags:
 *       - User
 *     description: Find a users favorites by user id.
 *     summary: favorites by user id,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: favorites found!
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.get("/favorites-by-userid", auth.authenticateToken, async (req, res) => {
  const recId = req.user.rec_id;
  let sqlQuery = `call ciydb.favourite_store_by_user_id(${recId});`;
  const store = await conn.getConnection(sqlQuery, res);
  let sql = `call ciydb.favourite_product_by_user_id(${recId});`;
  const product = await conn.getConnection(sql, res);
  var sortedObject = groupBy(product[0], "store_name");
  var storeArray = Object.values(JSON.parse(JSON.stringify(store[0])));
  storeArray.forEach((element) => {
    if (Object.keys(sortedObject).includes(element["store_name"])) {
      element["favorite_products"] = sortedObject[element["store_name"]];
    } else {
      element["favorite_products"] = [];
    }
  });
  return res.send({ response: storeArray });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_fav_prods_by_userId:
 */
//#region /user/fav-prods-by-userid :
/**
 * @swagger
 * /user/fav-prods-by-userid:
 *   post:
 *     tags:
 *       - User
 *     description: Find a users favorites products by user id.
 *     summary: fav products by user id,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: favorites found!
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.get("/fav-prods-by-userid", auth.authenticateToken, async (req, res) => {
  const recId = req.user.rec_id;

  // const recId = req.body.rec_id;
  // let sqlQuery = `call ciydb.favourite_store_by_user_id(${recId});`;
  // const store = await conn.getConnection(sqlQuery, res);
  let sql = `call ciydb.favourite_product_by_user_id(${recId});`;
  const product = await conn.getConnection(sql, res);
  // var sortedObject = groupBy(product[0], "store_name");
  // var storeArray = Object.values(JSON.parse(JSON.stringify(store[0])));
  // storeArray.forEach((element) => {
  //   if (Object.keys(sortedObject).includes(element["store_name"])) {
  //     element["favorite_products"] = sortedObject[element["store_name"]];
  //   } else {
  //     element["favorite_products"] = [];
  //   }
  // });
  return res.send({ response: product[0] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   update_password:
 *     properties:
 *       rec_id:
 *         type: integer
 *       password:
 *         type: integer
 */

//#region /user/update-password: post
/**
 * @swagger
 * /user/update-password:
 *   post:
 *     tags:
 *       - User
 *     description: update password or change password for users.
 *     summary: update password for users.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/update_password'
 *     responses:
 *       200:
 *         description: password updated
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/update-password", auth.authenticateToken, (req, res) => {
  const rec_id = req.body.rec_id;
  const password = req.body.password;
  var hashedPassword = "";
  if (rec_id !== 0) {
    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);
    let sql = `call ciydb.users_update_password(${rec_id}, '${hashedPassword}');`;
    conn.connection.query(sql);
    return res.send({ response: "password changed" });
  } else {
    return res.send({ response: "user incorrect." });
  }
});

// #endregion

/**
 * @swagger
 * definitions:
 *   user_cart_add:
 *     properties:
 *       product_id:
 *         type: integer
 *       quantity:
 *         type: integer
 */
//#region /user/cart-add : post
/**
 * @swagger
 * /user/cart-add:
 *   post:
 *     tags:
 *       - Cart
 *     description: Add to cart using product id.
 *     summary: Add to cart.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cart
 *         description: Cart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_cart_add'
 *     responses:
 *       201:
 *         description: product added in cart succesfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.post("/cart-add", auth.authenticateToken, async (req, res) => {
  const user_id = req.user.rec_id;
  const cart_Id = req.body.recId;
  const product_id = req.body.product_id;
  const quantity = req.body.quantity;
  const price_mode = req.body.priceMode;
  const pricing_id = req.body.pricingId;
  let sql = `SET @x = ${cart_Id} ; call ciydb.cart_upsert(@x, ${user_id} , ${product_id}, '${price_mode}', ${pricing_id}, ${quantity}); SELECT @x;`;
  const count = await conn.getConnection(sql, res);
  if (count[2][0]["@x"] === -1) {
    return res
      .status(404)
      .send({ response: "Something went wrong, please contact support team" });
  } else {
    return res.status(201).send({
      response: "product added in cart succesfully.",
      cart_Id: count[2][0]["@x"],
    });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_cart_add_quantity:
 *     properties:
 *       cart_id:
 *         type: integer
 *       quantity:
 *         type: integer
 */
//#region /user/cart-add-quantity : post
/**
 * @swagger
 * /user/cart-add-quantity:
 *   post:
 *     tags:
 *       - Cart
 *     description: Add to cart using product id.
 *     summary: Add to cart.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cart
 *         description: Cart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_cart_add_quantity'
 *     responses:
 *       200:
 *         description: product added in cart succesfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.post("/cart-add-quantity", auth.authenticateToken, async (req, res) => {
  // const user_id = req.user.rec_id;
  var cart_id = req.body.cart_id;
  // const product_id = req.body.product_id;
  var quantity = req.body.quantity;
  // const price_mode = req.body.priceMode;
  // const pricing_id = req.body.pricingId;
  let sql = `call ciydb.cart_add_quantity(${cart_id},${quantity});`;
  const count = await conn.getConnection(sql, res);
  if (count[0].length < 1) {
    return res
      .status(404)
      .send({ response: "Something went wrong, please contact support team" });
  } else {
    return res.status(200).send({
      message: "product added in cart succesfully.",
      response: count[0],
    });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_cart_update:
 *     properties:
 *       cart_id:
 *         type: integer
 *       user_id:
 *         type: integer
 *       product_id:
 *         type: integer
 *       quantity:
 *         type: integer
 */
//#region /user/cart-update : put
/**
 * @swagger
 * /user/cart-update:
 *   put:
 *     tags:
 *       - Cart
 *     description: update to cart using product id.
 *     summary: update to cart.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: cart
 *         description: Cart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_cart_update'
 *     responses:
 *       200:
 *         description: product updated in cart succesfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.put("/cart-update", auth.authenticateToken, async (req, res) => {
  const user_id = req.user.rec_id;
  const cart_Id = req.body.cart_id;
  const product_id = req.body.product_id;
  const quantity = req.body.quantity;
  let sql = `SET @x = ${cart_Id} ; call ciydb.cart_upsert(@x, ${user_id} , ${product_id} , ${quantity}); SELECT @x;`;
  const count = await conn.getConnection(sql, res);
  if (count[2][0]["@x"] === -1) {
    return res.status(404).send({
      response: "No matching recID found",
    });
  } else {
    return res.status(200).send({
      response: "product updated in cart succesfully.",
      sql_response: count[2][0]["@x"],
    });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_cart_find_by_id:
 *     properties:
 *       user_id:
 *         type: integer
 */
//#region /user/cart-find-by-user-id : get
/**
 * @swagger
 * /user/cart-find-by-user-id:
 *   get:
 *     tags:
 *       - Cart
 *     description: list of cart by user Id.
 *     summary: list of cart by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Cart
 *         description: Cart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_cart_find_by_id'
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
router.get(
  "/cart-find-by-user-id",
  auth.authenticateToken,
  async (req, res) => {
    const user_id = req.user.rec_id;
    // console.log(req.user);
    let sql = `call ciydb.cart_by_user_id(${user_id});`;
    var response = await conn.getConnection(sql, res);
    return res.send({ response: response[0] });
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   user_cart_find_value_by_id:
 */
//#region /user/cart-find-value-by-user-id : get
/**
 * @swagger
 * /user/cart-find-value-user-id:
 *   get:
 *     tags:
 *       - Cart
 *     description: value of cart by user Id.
 *     summary: value of cart by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Cart
 *         description: Cart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_cart_find_value_by_id'
 *     responses:
 *       200:
 *         description : value retrieved.
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
  "/cart-find-value-by-user-id",
  auth.authenticateToken,
  async (req, res) => {
    const user_id = req.user.rec_id;
    var total_gst = 0;
    var total_cart_count = 0;
    // console.log(req.user);
    let sql = `call ciydb.cart_by_user_id(${user_id});`;
    var response = await conn.getConnection(sql, res);
    var cartArray = Object.values(JSON.parse(JSON.stringify(response[0])));
    if (cartArray.length == 0) {
      return res.status(200).send({ response: response[0] });
    } else {
      cartArray.forEach((element) => {
        // console.log(element);
        var current_price = 0;
        if (
          element["Percentage_Discount"] > 0 &&
          element["Percentage_Discount"] != null &&
          parseFloat(element["price"]) > 0
        ) {
          current_price =
            parseFloat(element["price"]) >
            parseFloat(element["Percentage_Discount"])
              ? parseFloat(element["Percentage_Discount"])
              : parseFloat(element["price"]);
        } else {
          current_price = parseFloat(element["price"]);
        }

        if (element["quantity"] > 1) {
          current_price *= element["quantity"];
          total_gst += element["gst"] * element["quantity"];
        } else {
          total_gst += element["gst"];
          // current_price = parseFloat(element["price"]);
        }
        total_cart_count += current_price;
        // console.log(total_cart_count);
      });
      return res.send({
        total_gst: total_gst.toFixed(2),
        total_price: total_cart_count.toFixed(2),
        shipping: total_cart_count.toFixed(2) <= 500 ? 50 : 0,
      });
    }
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   user_cart_count:
 */
//#region /user/cart-count : get
/**
 * @swagger
 * /user/cart-count:
 *   get:
 *     tags:
 *       - Cart
 *     description: count of cart by user Id.
 *     summary: count of cart by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Cart
 *         description: Cart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_cart_count'
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
router.get("/cart-count", auth.authenticateToken, async (req, res) => {
  const user_id = req.user.rec_id;
  let sql = `call ciydb.cart_by_user_id(${user_id});`;
  var response = await conn.getConnection(sql, res);
  var cartCount = response[0].length;
  return res.send({ response: cartCount });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_cart_delete_by_id:
 *     properties:
 *       cart_id:
 *         type: integer
 */
//#region /user/cart-delete-by-id : post
/**
 * @swagger
 * /user/cart-delete-by-id:
 *   get:
 *     tags:
 *       - Cart
 *     description: Delete product from cart by cart Id
 *     summary: Delete product from cart by cart Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Cart
 *         description: Cart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_cart_delete_by_id'
 *     responses:
 *       200:
 *         description : Product Deleted.
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
  "/user_cart_delete_by_id",
  auth.authenticateToken,
  async (req, res) => {
    const user_id = req.user.rec_id;
    const cart_id = req.body.cart_Id;
    let sql = `SET @x = ${cart_id} ; call ciydb.cart_delete(@x); SELECT @x;`;
    const count = await conn.getConnection(sql, res);
    if (count[2][0]["@x"] === -1) {
      return res.status(404).send({
        response: "No matching recID found",
      });
    } else {
      return res.status(200).send({
        response: "product updated in cart succesfully.",
        sql_response: count[2][0]["@x"],
      });
    }
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   user_address_add:
 *     properties:
 *       name:
 *         type: string
 *       address1:
 *         type: string
 *       address2:
 *         type: string
 *       city:
 *         type: string
 *       landmark:
 *         type: string
 *       state:
 *         type: integer
 *       country:
 *         type: integer
 *       phone_no:
 *         type: string
 *       zip_code:
 *          type: string
 *       is_default:
 *          type: integer
 */
//#region /user/user_address_add : post
/**
 * @swagger
 * /user/user_address_add:
 *   post:
 *     tags:
 *       - User
 *     description: Add a users new address.
 *     summary: Add a users new address,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_address_add'
 *     responses:
 *       200:
 *         description: User address added
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.post("/user_address_add", auth.authenticateToken, async (req, res) => {
  const rec_id = 0;
  const user_id = req.user.rec_id;
  const name = req.body.name;
  const address1 = req.body.address1;
  const address2 = req.body.address2;
  const city = req.body.city;
  const landmark = req.body.landmark;
  const state = req.body.state;
  const country = req.body.country;
  const phone_no = req.body.phone_no;
  const zip_code = req.body.zip_code;
  const is_default = req.body.is_default;
  const status = "Active";

  let sql = `SET @x = ${rec_id} ; call ciydb.user_address_upsert(@x, ${user_id}, '${name}', '${address1}', '${address2}' ,'${city}', '${landmark}', ${state}, ${country}, '${phone_no}', '${zip_code}', ${is_default}, '${status}'); SELECT @x;`;

  const response = await conn.getConnection(sql, res);
  if (response[2][0]["@x"] === -1) {
    return res.status(404).send({
      response: "There was an error, please contact support team",
    });
  } else {
    return res.status(200).send({ response: "User added succesfully" });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_address_update:
 *     properties:
 *       rec_id:
 *         type: integer
 *       name:
 *         type: string
 *       address1:
 *         type: string
 *       address2:
 *         type: string
 *       city:
 *         type: string
 *       landmark:
 *         type: string
 *       state:
 *         type: integer
 *       country:
 *         type: integer
 *       phone_no:
 *         type: string
 *       zip_code:
 *          type: string
 *       is_default:
 *          type: integer
 */
//#region /user/user_address_update : put
/**
 * @swagger
 * /user/user_address_update:
 *   put:
 *     tags:
 *       - User
 *     description: Updates users address.
 *     summary:  Updates users address,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_address_update'
 *     responses:
 *       200:
 *         description: User address updated,
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */

router.put("/user_address_update", auth.authenticateToken, async (req, res) => {
  const rec_id = req.body.rec_id;
  const user_id = req.user.rec_id;
  const name = req.body.name;
  const address1 = req.body.address1;
  const address2 = req.body.address2;
  const city = req.body.city;
  const landmark = req.body.landmark;
  const state = req.body.state;
  const country = req.body.country;
  const phone_no = req.body.phone_no;
  const zip_code = req.body.zip_code;
  const is_default = req.body.is_default;
  const status = "Active";

  let sql = `SET @x = ${rec_id} ; call ciydb.user_address_upsert(@x, ${user_id}, '${name}', '${address1}', '${address2}' ,'${city}', '${landmark}', ${state}, ${country}, '${phone_no}', '${zip_code}', ${is_default}, '${status}'); SELECT @x;`;

  const response = await conn.getConnection(sql, res);
  if (response[2][0]["@x"] === -1) {
    return res.status(404).send({
      response: "There was an error, please contact support team",
    });
  } else {
    return res.status(200).send({ response: "User added succesfully" });
  }
});
// #endregion

/**
 * @swagger
 * definitions:
 *   user_address_delete:
 *     properties:
 *       rec_id:
 *         type: integer
 */
//#region /user/user_address_delete : delete
/**
 * @swagger
 * /user/user_address_delete:
 *   delete:
 *     tags:
 *       - User
 *     description: Deletes users address.
 *     summary:  Deletes users address,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user_address_delete'
 *     responses:
 *       200:
 *         description: User address deleted,
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
  "/user_address_delete",
  auth.authenticateToken,
  async (req, res) => {
    const rec_id = req.body.rec_id;
    let sql = `call ciydb.user_address_delete(${rec_id});`;
    const response = await conn.getConnection(sql, res);
    return res.status(200).send({ message: "User address deleted." });
  }
);
// #endregion

//#region /user/user_address_find_all : get
/**
 * @swagger
 * /user/user_address_find_all:
 *   get:
 *     tags:
 *       - User
 *     description: Gets all user address.
 *     summary:  Gets all user address,
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User address found,
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
  "/user_address_find_all",
  auth.authenticateToken,
  async (req, res) => {
    const user_id = req.user.rec_id;
    let sql = `call ciydb.user_address_by_user_id(${user_id});`;
    const response = await conn.getConnection(sql, res);
    console.log(response);
    return res.status(200).send({ response: response[0] });
  }
);
// #endregion

//#region /user/set_default_address : put
/**
 * @swagger
 * /user/set_default_address:
 *   put:
 *     tags:
 *       - User
 *     description: Set default address
 *     summary: Set default address
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Set_Default_Address'
 *     responses:
 *       200:
 *         description: An array of system users
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *         schema:
 *           $ref: '#/definitions/Set_Default_Address'
 *     security:
 *       - Bearer: []
 */

router.put("/set_default_address", auth.authenticateToken, async (req, res) => {
  const defaultAddress = req.body;

  // const { err } = validate(artist);
  const { err } = defaultAddress;
  if (err) return res.status(400).send(err.details[0].message);

  var sql = `SET @rec_id = 0; \   
    call user_address_set_default(@rec_id, \                
                  '${defaultAddress.user_id}' \
                 ); \                        
    SELECT @rec_id as rec_id;`;

  var last_inserted_id = 0;

  var result = await conn.getConnection(sql, res);

  result.forEach((element) => {
    if (element.constructor == Array) {
      last_inserted_id = element[0].rec_id;
    }
  });

  if (last_inserted_id == -1) {
    return error(res, 400, "Bad request", "User address already created");
  } else {
    return res.status(200).send({ rec_id: last_inserted_id });
  }
});
//#endregion

module.exports = router;
