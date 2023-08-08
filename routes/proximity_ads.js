const { response } = require("express");
const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

//#region swagger Proximity Ads  defination : defination
/**
 * @swagger
 * definitions:
 *   Proximity_Ads_Search:
 *     properties:
 *       page:
 *         type: integer
 *       size:
 *         type: integer
 *       filter:
 *         type: string
 *         default: 'All'
 *         enum:
 *          - All
 *          - Active
 *          - Inactive
 *       search:
 *         type: string
 *       orderCol:
 *         type: string
 *       order:
 *         type: integer
 *       approval_status:
 *         type: string
 *         default: 'All'
 *         enum:
 *          - All
 *          - Pending
 *          - Approved
 *          - Rejected
 */

//#endregion

/**
 * @swagger
 * definitions:
 *   Create_Proximity_Ads:
 *     properties:
 *       rec_id:
 *         type: integer
 *       store_id:
 *         type: integer
 *       user_id:
 *         type: integer
 *       ads_desc:
 *         type: string
 *       from_date:
 *         type: string
 *       to_date:
 *         type: string
 *       approval_status:
 *         type: string
 *         default: 'All'
 *         enum:
 *          - Pending
 *          - Approved
 *          - Rejected
 *       status:
 *         type: string
 *         enum:
 *          - Active
 *          - Inactive
 */
//#endregion

/**
 * @swagger
 * definitions:
 *   Update_Proximity_Ads:
 *     properties:
 *       rec_id:
 *         type: integer
 *       store_id:
 *         type: integer
 *       user_id:
 *         type: integer
 *       ads_desc:
 *         type: string
 *       from_date:
 *         type: string
 *       to_date:
 *         type: string
 *       approval_status:
 *         type: string
 *         default: 'All'
 *         enum:
 *          - Pending
 *          - Approved
 *          - Rejected
 *       status:
 *         type: string
 *         enum:
 *          - Active
 *          - Inactive
 */
//#endregion

//#region /proximity_ads : post
/**
 * @swagger
 * /proximity_ads:
 *   post:
 *     tags:
 *       - Proximity Ads
 *     description: Returns all proximity ads
 *     summary: create proximity ads
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Create_Proximity_Ads'
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
 *           $ref: '#/definitions/Create_Proximity_Ads'
 *     security:
 *       - Bearer: []
 */

router.post("/", auth.authenticateToken, async (req, res) => {
  const proximityAds = req.body;

  // const { err } = validate(artist);
  const { err } = proximityAds;
  if (err) return res.status(400).send(err.details[0].message);

  var sql = `SET @rec_id = 0; \   
      call proximity_ads_upsert(@rec_id, \
                    '${proximityAds.store_id}', \                  
                    '${req.user.rec_id}', \
                    '${proximityAds.ads_desc}', \                  
                    '${proximityAds.from_date}', \
                    '${proximityAds.to_date}', \
                    '${proximityAds.approval_status}',\
                    '${proximityAds.status}'); \                        
      SELECT @rec_id as rec_id;`;

  var last_inserted_id = 0;

  var result = await conn.getConnection(sql, res);

  result.forEach((element) => {
    if (element.constructor == Array) {
      last_inserted_id = element[0].rec_id;
    }
  });

  if (last_inserted_id == -1) {
    return error(res, 400, "Bad request", "Proximity ads already created");
  } else {
    return res.status(200).send({ rec_id: last_inserted_id });
  }
});
//#endregion

/**
 * @swagger
 * /proximity_ads/search:
 *   post:
 *     tags:
 *       - Proximity Ads
 *     description: Returns all Proximity ads list
 *     summary: Get all proximity ads list.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: proximity ads
 *         description: Proximity ads object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Proximity_Ads_Search'
 *     responses:
 *       200:
 *         description: An array of proximity ads
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
//#endregion
router.post("/search", auth.authenticateToken, async (req, res) => {
  const page = req.body.page;
  const size = req.body.size;
  const filter = req.body.filter;
  const search = req.body.search;
  const orderCol = req.body.orderCol;
  const order = req.body.order;
  const approval_status = req.body.approval_status;

  var proximityAdList;
  var countResult = "";

  let sql = `call proximity_ads_find_all_paged(${page}, ${size}, '${filter}', '${search}', '${orderCol}', '${order}','${req.user.rec_id}' ,'${approval_status}')`;
  let result = await conn.getConnection(sql, res);
  proximityAdList = result[0];
  sql = `SET @proximityAdCount = 0; \
              call proximity_ads_find_all_paged_count('${filter}', '${search}','${req.user.rec_id}','${approval_status}', @proximityAdCount);\
              SELECT @proximityAdCount as count;`;

  countResult = await conn.getConnection(sql, res);
  var count = 0;
  countResult.forEach((element) => {
    if (element.constructor === Array) {
      count = element[0].count;
    }
  });

  return res.status(200).send({
    proximityAdList: proximityAdList,
    count: count,
  });
});

//#endregion

//#region /proximity_ads/find_by_minor: post
/**
 * @swagger
 * /proximity_ads/find_by_minor:
 *   post:
 *     tags:
 *       - Proximity Ads
 *     description: Returns proximity ad gateway minor id
 *     summary: Returns proximity ad gateway minor id,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: minor_id
 *         in: body
 *         description: Minor ID
 *         required: true
 *         type: integer
 *         format: int32
 *     responses:
 *       200:
 *         description: offer found!
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *         //schema:
 *         //  $ref: '#/definitions/faq'
 */

router.post("/find_by_minor", auth.checkIfTokenExists, async (req, res) => {
  const minor_id = req.body.minor_id;
  console.log(req.body);

  const sql = `call proximity_ads_by_minor(${minor_id});`;

  var result = await conn.getConnection(sql, res);
  if (result[0].length == 0) {
    return res.status(400).send({ response: "No records found" });
  } else {
    return res.status(200).send(result[0]);
  }
  // return result
});

//#endregion

//#region /proximity_ads/{id} : delete
/**
 * @swagger
 * /proximity_ads/{id}:
 *   delete:
 *     tags:
 *       - Proximity Ads
 *     description: Delete given proximity ad
 *     summary: Delete given proximity ad.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A current banner ad
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.delete("/:id", auth.authenticateToken, async (req, res) => {
  const RecId = req.params.id;

  var sql = `call proximity_ads_delete(${RecId})`;

  var result = await conn.getConnection(sql, res);

  return res.status(200).send({ RecId: RecId });
});
//#endregion

//#region /proximity_ads/rec_id/{id}: get
/**
 * @swagger
 * /proximity_ads/rec_id/{id}:
 *   get:
 *     tags:
 *       - Proximity Ads
 *     description: Returns proximity ad by rec id
 *     summary: Get proximity ad by rec id.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Rec id
 *         required: true
 *         type: integer
 *         format: int32
 *     responses:
 *       200:
 *         description:  proximity by rec id
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

router.get("/rec_id/:id", auth.authenticateToken, async (req, res) => {
  const rec_id = req.params.id;

  const sql = `call proximity_ads_by_rec_id(${rec_id})`;

  var result = await conn.getConnection(sql, res);

  return res.status(200).send(result[0]); // return result
});

//#endregion

//#region /proximity_ads : put
/**
 * @swagger
 * /proximity_ads:
 *   put:
 *     tags:
 *       - Proximity Ads
 *     description: Update proximity ad
 *     summary: Update proximity ad.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Proximity ad object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Update_Proximity_Ads'
 *     responses:
 *       200:
 *         description: Successfully updated
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *     security:
 *       - Bearer: []
 */
router.put("/", auth.authenticateToken, async (req, res) => {
  const proximityAds = req.body;

  //  const { err } = validate(order);
  const { err } = proximityAds;
  if (err) return res.status(400).send(err.details[0].message);

  var sql = `SET @rec_id =${proximityAds.rec_id}; \   
      call proximity_ads_upsert(@rec_id, \
                    '${proximityAds.store_id}', \                  
                    '${proximityAds.user_id}', \
                    '${proximityAds.ads_desc}', \                  
                    '${proximityAds.from_date}', \
                    '${proximityAds.to_date}', \
                    '${proximityAds.approval_status}',\
                    '${proximityAds.status}'); \                        
      SELECT @rec_id as rec_id;`;

  var last_inserted_id = 0;
  //  console.log(sql);
  var result = await conn.getConnection(sql, res);

  result.forEach((element) => {
    if (element.constructor == Array) {
      last_inserted_id = element[0].rec_id;
    }
  });

  if (last_inserted_id == -1) {
    return error(res, 400, "Bad request", "proximity already added");
  } else {
    return res.status(200).send({ rec_id: last_inserted_id });
  }
});

//#endregion post (update proximity ads)
module.exports = router;
