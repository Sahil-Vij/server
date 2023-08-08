const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");
var moment = require("moment");
const join = require("array-path-join");
const details = require("../util/details.json");
const sendMail = require("../util/email");
const fs = require("fs");
const { query } = require("express");
const groupBy = require("group-by");
/**
 * @swagger
 * definitions:
 *   Ads_Payment:
 *     properties:
 *       user_name:
 *         type: string
 *       rec_id:
 *         type: integer
 */
//#endregion
//#region /ads/find-by-id : get
/**
 * @swagger
 * /ads/find-by-id:
 *   get:
 *     tags:
 *       - Ads
 *     description: Find an ad by its ID.
 *     summary: Find an ad by its ID.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: rec_id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Ad found
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
  let sql = `call ciydb.ads_by_id(${rec_id});`;
  var response = await conn.getConnection(sql);

  sql = `call ciydb.system_user_get_vendor_details(${req.user.rec_id});`;
  var user_details = await conn.getConnection(sql);
  if (response[0].length > 0)
    response[0][0]["dates"] = response[0][0]["dates"].split(",");
  res.send({ response: response[0], user_details: user_details[0][0] });
});
// #endregion

//#region /ads/delete-by-id : delete
/**
 * @swagger
 * /ads/delete-by-id:
 *   delete:
 *     tags:
 *       - Ads
 *     description: Delete an ad by its ID.
 *     summary: Delete an ad by its ID.
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
 *         description: Ad deleted successfully
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
  let sql = `call ciydb.ads_delete(${rec_id});`;
  let response = await conn.getConnection(sql);
  return res.status(200).send({ response: response[0] });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   ads_find_all_paged:
 *     properties:
 *       pageNo:
 *         type: integer
 *       pageSize:
 *         type: integer
 *       filter:
 *         type: string
 *         enum:
 *          - All
 *          - Approved
 *          - Rejected
 *          - Pending
 *          - Draft
 *       searchQuery:
 *         type: string
 *       orderBy:
 *         type: string
 *       order:
 *         type: integer
 *       user_id:
 *         type: integer
 */
//#region /ads/find-all-paged : post
/**
 * @swagger
 * /ads/find-all-paged:
 *   post:
 *     tags:
 *       - Ads
 *     description: Find paged listing of ads.
 *     summary: Find page-wise records of ads for listing and get the total count of all records for pagination.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ads_find_all_paged'
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
router.post("/find-all-paged", auth.checkIfTokenExists, async (req, res) => {
  const page = req.body.pageNo;
  const size = req.body.pageSize;
  const filter = req.body.filter;
  const search = req.body.searchQuery;
  const orderCol = req.body.orderBy;
  const order = req.body.order;
  var user_id = req.body.user_id;
  if (user_id == 0) user_id = req.user.rec_id;
  let sql = `call ciydb.ads_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order}, ${user_id});`;
  var rows = await conn.getConnection(sql, res);

  //  AN: Who wrote this?

  // rows[0].forEach(element => {
  //   element['image'] = element['image'].split('/');
  //   element['image'].splice(1, 0, "thumbnails");
  //   element['image'] = join(element['image']);
  //   console.log(element['image']);
  // });

  sql = `call ciydb.ads_find_all_paged_count('${filter}', '%${search}%', ${user_id}, @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  if (user_id == -2) {
    var sortedArray = groupBy(rows[0], "package_name");
    res.send({ rows: sortedArray, count: count[1][0]["@x"] });
  } else {
    res.send({ rows: rows[0], count: count[1][0]["@x"] });
  }
});
// #endregion

//#region /ads/get-packages : get
/**
 * @swagger
 * /ads/get-packages:
 *   get:
 *     tags:
 *       - Ads
 *     description: Get the list of all available packages.
 *     summary: Get the list of all available packages.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Packages found
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/get-packages", auth.authenticateToken, async (req, res) => {
  let sql = `call ciydb.ads_package_get_list();`;
  const rows = await conn.getConnection(sql, res);
  res.send({ response: rows[0] });
});
// #endregion

//#region /ads/get-available-slots : get
/**
 * @swagger
 * /ads/get-available-slots:
 *   get:
 *     tags:
 *       - Ads
 *     description: Get a list of dates with availability for slot booking for advertising.
 *     summary: Get a list of dates with availability for slot booking for advertising.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: package_id
 *         description: package_id
 *         type: integer
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Availability list found
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.get("/get-available-slots", auth.authenticateToken, async (req, res) => {
  var package_id = req.query.package_id;
  today = new Date();
  // today.setDate(today.getDate() + 1); // Uncomment to change this to start from tomorrow
  tomorrow = moment(today.toISOString().slice(0, 10));
  one_month_later = moment(
    new Date(today.setMonth(today.getMonth() + 1)).toISOString().slice(0, 10)
  );

  let sql = `call ciydb.ads_package_get_slots_by_package_id(${package_id});`;
  var default_slot_count = await conn.getConnection(sql, res);
  default_slot_count = default_slot_count[0][0]["ad_no"];

  sql = `call ciydb.ads_date_availability_by_package_id(${package_id});`;
  var rows = await conn.getConnection(sql, res);
  var response = [];

  for (
    var m = moment(tomorrow);
    m.isBefore(one_month_later);
    m.add(1, "days")
  ) {
    iter_date = m.format("YYYY-MM-DD");
    wasMatchFound = false;
    rows[0].forEach((element) => {
      if (element["date"].toISOString().slice(0, 10) == iter_date) {
        wasMatchFound = true;
        response.push({ date: iter_date, slots: element["slots_available"] });
      }
    });
    if (!wasMatchFound) {
      response.push({ date: iter_date, slots: default_slot_count });
    }
  }

  res.send({ response: response });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   upsert:
 *     properties:
 *       rec_id:
 *         type: integer
 *       ad_name:
 *         type: string
 *       user_id:
 *         type: integer
 *       dates:
 *         type: array
 *       store_id:
 *         type: integer
 *       image:
 *         type: string
 *       package_id:
 *         type: integer
 *       package_price:
 *         type: integer
 *       total:
 *         type: integer
 *       publish_status:
 *         type: string
 *       is_draft:
 *         type: integer
 *       status:
 *         type: string
 *         enum:
 *          - Active
 *          - Inactive
 */
//#region /ads/upsert : post
/**
 * @swagger
 * /ads/upsert:
 *   post:
 *     tags:
 *       - Ads
 *     description: Add/Edit any ad.
 *     summary: Add/Edit any ad.
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
  const user_id = req.user.rec_id;

  const rec_id = req.body.rec_id;
  const ad_name = req.body.ad_name;
  const dates = req.body.dates;
  const store_id = req.body.store_id;
  const image = req.body.image;
  const package_id = req.body.package_id;
  const package_price = req.body.package_price;
  const total = req.body.total;
  const publish_status = req.body.publish_status;
  const is_draft = req.body.is_draft;
  const status = req.body.status;
  let sql = `SET @x = ${rec_id}; call ciydb.ads_upsert(@x, '${ad_name}', ${user_id}, ${store_id}, '${image}', ${package_id}, ${package_price}, ${total}, ${is_draft}, '${publish_status}', '${status}'); SELECT @x;`;
  var response = await conn.getConnection(sql, res);
  var inserted_id = response[2][0]["@x"];

  if (rec_id > 0) {
    sql = `call ciydb.ads_date_clear_by_ad_id(${rec_id});`;
    await conn.getConnection(sql, res);
  }

  for (let i = 0; i < dates.length; i++) {
    sql = `SET @x = 0; call ciydb.ads_date_upsert(@x, '${dates[i]}', ${inserted_id}, 'Active'); SELECT @x;`;
    await conn.getConnection(sql, res);
  }
  if (rec_id == 0)
    return res.send({ response: "Ad added successfully", rec_id: inserted_id });
  else return res.send({ response: "Ad updated successfully" });
});
// #endregion

/**
 * @swagger
 * definitions:
 *   insert_rejection_reason:
 *     properties:
 *       ad_id:
 *         type: integer
 *       rejection_message:
 *         type: string
 */
//#region /ads/insert_rejection_reason : put
/**
 * @swagger
 * /ads/insert_rejection_reason:
 *   put:
 *     tags:
 *       - Ads
 *     description: Put a rejection reason for any advertisement.
 *     summary: Put a rejection reason for any advertisement.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/insert_rejection_reason'
 *     responses:
 *       200:
 *         description: Reason added successfully
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.put(
  "/insert_rejection_reason",
  auth.authenticateToken,
  async (req, res) => {
    const ad_id = req.body.ad_id;
    const rejection_message = req.body.rejection_message;
    let sql = `SET @x = 0; call ciydb.ad_rejection_reason_upsert(@x, '${rejection_message}', ${ad_id}); SELECT @x;`;
    var response = await conn.getConnection(sql, res);

    res.send({ response: response[0] });
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   store_analytics_add:
 *     properties:
 *       ad_id:
 *         type: integer
 */
//#region /ads/store_analytics_add : post
/**
 * @swagger
 * /ads/store_analytics_add:
 *   post:
 *     tags:
 *       - Ads
 *     description: Add ad analytics for ad.
 *     summary: Add ad analytics for ad.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/store_analytics_add'
 *     responses:
 *       200:
 *         description: Analytics updated succesfully
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
  "/store_analytics_add",
  auth.checkIfTokenExists,
  async (req, res) => {
    var user_id = req.user.rec_id;
    const ad_id = req.body.ad_id;
    if (user_id == -1) {
      user_id = null;
    }
    let sql = `SET @x = 0; call ciydb.store_ad_analytics_upsert(@x, ${ad_id}, ${user_id}); SELECT @x;`;
    var response = await conn.getConnection(sql, res);
    if (response[2][0]["@x"] === -1) {
      res
        .status(404)
        .send({
          response: "Something went wrong, please contact support team",
        });
    } else {
      res.status(200).send({
        response: "Data recorded successfully",
        rec_id: response[2][0]["@x"],
      });
    }
  }
);
// #endregion

/**
 * @swagger
 * /ads/get_rejection_reason_by_id:
 *   get:
 *     tags:
 *       - Ads
 *     description: Get rejection reasons by ad_id.
 *     summary: Get rejection reasons by ad_id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: ad_id
 *         description: ad_id
 *         in: query
 *         required: true
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
router.get(
  "/get_rejection_reason_by_id",
  auth.authenticateToken,
  async (req, res) => {
    const ad_id = req.query.ad_id;
    let sql = `call ciydb.ad_rejection_reason_by_ad_id(${ad_id});`;
    var response = await conn.getConnection(sql, res);

    res.send({ response: response[0] });
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   set_publish_status:
 *     properties:
 *       ad_id:
 *         type: integer
 *       rejection_message:
 *         type: string
 */
//#region /ads/set_publish_status : post
/**
 * @swagger
 * /ads/set_publish_status:
 *   post:
 *     tags:
 *       - Ads
 *     description: Set publish status for an ad.
 *     summary: Set publish status for an ad.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/set_publish_status'
 *     responses:
 *       200:
 *         description: Publish status set successfully
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.post("/set_publish_status", auth.authenticateToken, async (req, res) => {
  const ad_id = req.body.ad_id;
  const is_rejected = req.body.is_rejected;
  var is_draft = 0;
  var publish_status = "Yes";
  if (is_rejected) {
    is_draft = 1;
    publish_status = "No";
  }
  let sql = `call ciydb.ads_update_publish_status(${ad_id}, ${is_draft}, '${publish_status}');`;
  var response = await conn.getConnection(sql, res);

  res.send({ response: response[0] });
});
// #endregion
//#region /ads/ads_payment : post
/**
 * @swagger
 * /ads/ads_payment:
 *   post:
 *     tags:
 *       - Ads
 *     description: Get mail to proceed for ads payment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Ads_Payment'
 *     responses:
 *       200:
 *         description: Successfully created
 *     security:
 *       - Bearer: []
 */
router.post("/ads_payment", async (req, res) => {
  // const user_name = req.body.user_name;

  const ads_id = req.body.ads_id;
  const store_id = req.body.store_id;

  const sql = `call ads_get_payment_link_data(${ads_id},${store_id});`;
  let userResponse = await conn.getConnection(sql, res);
  console.log(userResponse[0][0].email_id);
  const token = auth.generateAccessToken({
    rec_id: userResponse[0][0].rec_id,
    role: userResponse[0][0].role_id,
  });

  if (userResponse[0][0].total == 0) {
    var eamil_body = fs.readFileSync(
      "./email_templates/ads_paymentwithoutpayment.txt",
      "utf8"
    );
    eamil_body = eamil_body.replace(/##Respondent##/g, userResponse[0][0].name);
    let mailOptions = {
      from: details.manager_mail_id, // sender address
      to: userResponse[0][0].email_id, // list of receivers
      subject: "CIY ad's payment", // Subject line
      html: eamil_body,
    };
    console.log(mailOptions);
    sendMail.sendMail(res, mailOptions, (info) => {
      console.log(`Mail has been sent and the id is ${info.messageId}`);
      return res.status(200).send(info);
    });
  } else {
    const resetLink = `${details.frontEndResetLink}/${ads_id}?token=${token}`;

    var eamil_body = fs.readFileSync(
      "./email_templates/ads_payment.txt",
      "utf8"
    );
    eamil_body = eamil_body
      .replace(/##Respondent##/g, userResponse[0][0].name)
      .replace(/##Email##/g, userResponse[0][0].email_id)
      .replace(/##Link##/g, resetLink);

    let mailOptions = {
      from: details.manager_mail_id, // sender address
      to: userResponse[0][0].email_id, // list of receivers
      subject: "CIY ad's payment", // Subject line
      html: eamil_body,
    };
    console.log(mailOptions);
    sendMail.sendMail(res, mailOptions, (info) => {
      console.log(`Mail has been sent and the id is ${info.messageId}`);
      return res.status(200).send(info);
    });
  }
});
//#endregion

module.exports = router;
