const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const details = require("../util/details.json");
const sendMail = require("../util/email");
const path = require("path");

/**
 * @swagger
 * definitions:
 *   System_user_login:
 *     properties:
 *       user_name:
 *         type: string
 *       password:
 *         type: string
 */
//#region /system-user/login : post
/**
 * @swagger
 * /system-user/login:
 *   post:
 *     tags:
 *       - System User
 *     description: login for System User.
 *     summary: login for System user.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: System user
 *         description: System user object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/System_user_login'
 *     responses:
 *       200:
 *         description: Logged in successfully.
 *       204:
 *         description: Invalid credentials.
 *       404:
 *         description : Not Found
 */
router.post("/login", function (req, res) {
  var users = req.body;
  const username = users.user_name;
  const password = users.password;

  let sql = `call ciydb.system_user_find_by_username('${username}');`;
  console.log(sql);
  conn.connection.query(sql, function (error, result) {
    if (result[0].length === 0) {
      return res.status(204).send("User not Found");
    } else {
      var checkHash = bcrypt.compareSync(password, result[0][0].password);
      if (checkHash === false) {
        return res
          .status(204)
          .send({ message: "Enter correct username and password." });
      } else {
        const token = auth.generateAccessToken({
          rec_id: result[0][0].rec_id,
          role: result[0][0].role_id,
        });
        res.send({
          message: "User logged in.",
          token: token,
          role: result[0][0].role_id,
        });
      }
    }
  });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   System_user_find_all_paged:
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
 */
//#region /system-user/find-all-paged : post
/**
 * @swagger
 * /system-user/find-all-paged:
 *   post:
 *     tags:
 *       - System User
 *     description: system user by page and its count.
 *     summary: system user by page and its count.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: System user pagination
 *         description: System user pagination object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/System_user_find_all_paged'
 *     responses:
 *       200:
 *         description : get page count and paged data.
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
  let sql = `call ciydb.system_user_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order});`;
  const rows = await conn.getConnection(sql, res);

  sql = `SET @x = 0 ;call ciydb.system_user_find_all_paged_count('${filter}', '%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  return res.send({ rows: rows[0], count: count[2][0]["@x"] });
});
// #endregion

//#region /system-user/delete-by-id : delete
/**
 * @swagger
 * /system-user/delete-by-id:
 *   delete:
 *     tags:
 *       - System User
 *     description: Delete system user by Id.
 *     summary: delete system user by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: recId
 *         description: Record ID of item to be deleted.
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : Deleted System user by Id.
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
  let sql = `call ciydb.system_user_delete_by_id(${recId});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      res.send({ response: error + " occured." });
    }
    var response = "System User deleted.";
    res.send({ response: response });
  });
});
// #endregion

/**
 * @swagger
 * /system-user/find-by-id:
 *   get:
 *     tags:
 *       - System User
 *     description: Find system-user by Id.
 *     summary: system-user by Id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: recId
 *         description: System user object
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description : found system-user by record Id.
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
  const user = req.query;
  const recId = req.body.recId;
  let sql = `call ciydb.system_user_find_by_id(${recId});`;
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
 * /system-user/me:
 *   get:
 *     tags:
 *       - System User
 *     description: Get self profile.
 *     summary: Get your own profile.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description : Retreived profile.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/me", auth.authenticateToken, async (req, res) => {
  const rec_id = req.user.rec_id;
  let sql = `call ciydb.system_user_find_by_id(${rec_id});`;
  let sql_response = await conn.getConnection(sql, res);
  return res.send(sql_response[0]);
});
// #endregion

/**
 * @swagger
 * definitions:
 *   System_user_upsert:
 *     properties:
 *       rec_id:
 *         type: integer
 *       user_name:
 *         type: string
 *       name:
 *         type: string
 *       email_id:
 *         type: string
 *       mobile_no:
 *         type: string
 *       role_id:
 *         type: string
 *         enum:
 *           - Superadmin
 *           - Admin
 *           - Vendor
 *       password:
 *         type: string
 *       token:
 *         type: integer
 *       store_id:
 *         type: integer
 *       store_name:
 *         type: string
 *       logo:
 *         type: string
 *       store_type:
 *         type: string
 *       store_phoneno:
 *         type: string
 *       store_mobileno:
 *         type: string
 *       store_email_id:
 *         type: string
 *       gateway_id:
 *         type: string
 *       address1:
 *         type: string
 *       address2:
 *         type: string
 *       zipcode:
 *         type: string
 *       city:
 *         type: string
 *       state:
 *         type: integer
 *       status:
 *         type: string
 *         enum:
 *           - Active
 *           - Inactive
 */
//#region /system-user/upsert : post
/**
 * @swagger
 * /system-user/upsert:
 *   post:
 *     tags:
 *       - System User
 *     description: Add and update System user.
 *     summary: Add and update System user.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: System user
 *         description: System user object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/System_user_upsert'
 *     responses:
 *       200:
 *         description: system user updated.
 *       201:
 *         description: system user added.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
// router.post("/upsert", async (req, res) => {
//   const user = req.body;
//   const recId ="0";//user.rec_id;
//   const user_name ="Sahil Stores" //user.user_name;
//   const name ="Sahil" //user.name;
//   const status ="Active"// user.status;
//   const email_id = "er.sahilvij910@gmail.com";//ser.email_id;
//   const mobile_no ="9958394765" //user.mobile_no;
//   const role_id ="vendor" //user.role_id;
//   const password ="Sahil123" //user.password || "";
//   const token = user.token || "";
//   var store_id =130;//user.store_id || 0;

 

//   var hashed_pass = "";
//   if (password !== "") {
//     var salt = bcrypt.genSaltSync(10);
//     hashed_pass = bcrypt.hashSync(password, salt);
//   }

//   // if (role_id == "Vendor") {
//   //   let sql = `SET @x = ${store_id}; CALL store_upsert(@x, '${store_name}', '${logo}', '${store_type}', '${store_phoneno}', '${store_mobileno}', '${store_email_id}', '${gateway_id}', '${address1}', '${address2}', '${zipcode}', '${city}', ${state}, '${status}','${store_open_time}', '${store_close_time}'); SELECT @x;`
//   //   let sql_response = await conn.getConnection(sql, res);
//   //   console.log(sql_response[2][0]);
//   //   store_id = sql_response[2][0]['@x'];
//   // }
//   if (password.length < 1){
//     let prevPassSQL = `select password from ciydb.system_user where rec_id =${user.rec_id};`;
//     let tres = await conn.getConnection(prevPassSQL, res);
//     let pass = tres[0].password;
//     hashed_pass = pass;
//   }
//   let sql = `SET @x = ${recId}; call ciydb.system_user_upsert(@x, '${user_name}', '${name}', '${email_id}','${mobile_no}', '${role_id}', '${hashed_pass}', '${token}', ${store_id}, '${status}'); SELECT @x;`;
//   console.log("in this");
//   let sql_response = await conn.getConnection(sql, res);

//   if (recId === "0") {
//     // Send email to vendor
//     if (role_id == "Vendor") {
//       let regiration = path.join(
//         __dirname,
//         "../email_templates/vendor_registration.txt"
//       );
//       var eamil_body = fs.readFileSync(regiration, "utf8");
//       var loginLink = details.adminLoginLink;
//       eamil_body = eamil_body
//         .replace(/##Name##/g, user.name)
//         .replace(/##Email##/g, user.user_name)
//         .replace(/##Password##/g, user.password)
//         .replace(/##Link##/g, loginLink);

//       let mailOptions = {
//         from: details.manager_mail_id, // sender address
//         to: user.email_id, // list of receivers
//         subject: "CIY vendor login details", // Subject line
//         html: eamil_body,
//       };

//       var email_res = "";
//       await sendMail.sendMail(res, mailOptions, (info) => {
//         console.log(
//           `Vendor login details mail has sent and the id is ${info.messageId}`
//         );
//         //email_res = res.status(200).send(info);
//       });
//     }
//     //END Send email to vendor

//     var response = "User added successfully.";
//     return res
//       .status(201)
//       .send({ response: response, sql_response: sql_response[2][0]["@x"] });
//   } else {
//     var response = "User updated successfully.";
//     return res
//       .status(200)
//       .send({ response: response, sql_response: sql_response[2][0]["@x"] });
//   }
// });
// #endregion
router.post("/upsert", async (req, res) => {
  const user = req.body;
   const recId =user.rec_id;
  const user_name =user.user_name;
  const name =user.name;
  const status =user.status;
  const email_id =user.email_id;
  const mobile_no =user.mobile_no;
  const role_id =user.role_id;
  const password =user.password || "";
  const token = user.token || "";
  var store_id =user.store_id || 0;
  var hashed_pass = "";
  if (password !== "") {
    var salt = bcrypt.genSaltSync(10);
    hashed_pass = bcrypt.hashSync(password, salt);
  }

  if (password.length < 1) {
    let prevPassSQL = `select password from ciydb.system_user where rec_id = ${recId};`;
    let tres = await conn.getConnection(prevPassSQL, res);
    let pass = tres[0].password;
    hashed_pass = pass;
  }

  let sql = `SET @x = ${recId}; call ciydb.system_user_upsert(@x, '${user_name}', '${name}', '${email_id}', '${mobile_no}', '${role_id}', '${hashed_pass}', '${token}', ${store_id}, '${status}'); SELECT @x;`;
  let sql_response = await conn.getConnection(sql, res);

  if (recId === "0") { // Compare as a string
    // Send email to vendor
    if (role_id === "Vendor") { // Use strict equality (===)
      let regiration = path.join(__dirname, "../email_templates/vendor_registration.txt");
      var eamil_body = fs.readFileSync(regiration, "utf8");
      console.log("eamil_body",eamil_body);
      var loginLink = details.adminLoginLink;
      console.log("loginlink",loginLink);
      eamil_body = eamil_body
        .replace(/##Name##/g, name) // Use `name` variable instead of `user.name`
        .replace(/##Email##/g, user_name) // Use `user_name` variable instead of `user.user_name`
        .replace(/##Password##/g, password) // Use `password` variable instead of `user.password`
        .replace(/##Link##/g, loginLink);

      let mailOptions = {
        from: details.manager_mail_id,
        to: email_id,
        subject: "CIY vendor login details",
        html: eamil_body,
      };

      await sendMail.sendMail(res, mailOptions, (info) => {
        console.log(`Vendor login details mail has been sent, and the ID is ${info.messageId}`);
      });
    }

    var response = "User added successfully.";
    return res.status(201).send({ response: response, sql_response: sql_response[2][0]["@x"] });
  } else {
    var response = "User updated successfully.";
    return res.status(200).send({ response: response, sql_response: sql_response[2][0]["@x"] });
  }
});

/**
 * @swagger
 * definitions:
 *   System_user_update_password:
 *     properties:
 *      rec_id:
 *         type: integer
 *       password:
 *         type: string
 */
//#region /system-user/update-password: post
/**
 * @swagger
 * /system-user/update-password:
 *   post:
 *     tags:
 *       - System User
 *     description: Updated to new user password.
 *     summary: password updation.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: System user
 *         description: System user object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/System_user_update_password'
 *     responses:
 *       200:
 *         description : Updated Password.
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
    let sql = `call ciydb.system_user_update_password(${rec_id}, '${hashedPassword}');`;
    conn.connection.query(sql);
    return res.send({ response: "password changed" });
  } else {
    return res.send({ response: "System user incorrect." });
  }
});

/**
 * @swagger
 * definitions:
 *   System_user_update_token:
 *     properties:
 *      rec_id:
 *         type: integer
 *       token:
 *         type: string
 */
//#region /system-user/update-token: post
/**
 * @swagger
 * /system-user/update-token:
 *   post:
 *     tags:
 *       - System User
 *     description: Updated to new user token.
 *     summary: token updation.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: System user
 *         description: System user object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/System_user_update_token'
 *     responses:
 *       200:
 *         description : Updated token.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/update-token", auth.authenticateToken, (req, res) => {
  const rec_id = req.body.rec_id;
  const token = req.body.token;
  if (rec_id !== 0) {
    let sql = `call ciydb.system_user_update_token(${rec_id}, '${token}');`;
    conn.connection.query(sql);
    return res.send({ response: "token updated" });
  } else {
    return res.send({ response: "System user incorrect." });
  }
});

/**
 * @swagger
 * definitions:
 *   Update-profile:
 *     properties:
 *       name:
 *         type: string
 *       email_id:
 *         type: string
 *       mobile_no:
 *         type: string
 *       password:
 *         type: string
 *       profile_img:
 *         type: string
 */

//#region /system-user/update-profile : put
/**
 * @swagger
 * /system-user/update-profile:
 *   put:
 *     tags:
 *       - System User
 *     description: Update profile.
 *     summary: Update profile
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: profile
 *         description: Profile object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Update-profile'
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.put("/update-profile", auth.authenticateToken, async (req, res) => {
  var users = req.body;
  const rec_id = req.user.rec_id;
  const name = users.name;
  const mobile = users.mobile_no;
  const email = users.email_id;
  const password = users.password;
  const logo = users.profile_img;

  var hashedPassword = "";
  if (password !== "" && rec_id === 0) {
    var salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(password, salt);
  } else if (password !== "" && rec_id !== 0) {
    var salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(password, salt);
  }
  let sql = `SET @x = ${rec_id}; call ciydb.system_user_update_profile(@x, '${name}', '${email}', '${mobile}', '${logo}', '${hashedPassword}'); SELECT @x;`;
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

module.exports = router;
