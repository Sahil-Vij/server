const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   Money_distribution_find_all_paged:
 *     properties:
 *       page:
 *         type: integer
 *       size:
 *         type: integer
 *       search:
 *         type: string
 *       orderBy:
 *         type: string
 *       order:
 *         type: integer
 *       store_id:
 *         type: integer
 *       to_date:
 *         type: string
 *       from_date:
 *         type: string
 */
//#region /money_distribution/distribution/find_all_paged : post
/**
 * @swagger
 * /money_distribution/distribution/find_all_paged:
 *   post:
 *     tags:
 *       - Money Distribution
 *     description: money distribution list and count of money distribution.
 *     summary: All money distribution list and count of money distribution.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Money_distribution_find_all_paged'
 *     responses:
 *       200:
 *         description: money distribution list and count of money distribution
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
  "/distribution/find_all_paged",
  auth.authenticateToken,
  async (req, res) => {
    const page = req.body.page;
    const size = req.body.size;
    const search = req.body.search;
    const orderBy = req.body.orderBy;
    const order = req.body.order;
    const vendor_id = req.user.rec_id;
    const store_id = req.body.store_id;
    const to_date = req.body.to_date;
    const from_date = req.body.from_date;
    let sql = `CALL money_distribution_find_all_paged(${page}, ${size}, '%${search}%' ,'${orderBy}', ${order}, ${vendor_id}, ${store_id},'${from_date}','${to_date}');`;
    const response = await conn.getConnection(sql, res);
    let sqlQuery = `SET @x = 0; CALL money_distribution_find_all_paged_count( '%${search}%', ${vendor_id}, ${store_id},'${from_date}','${to_date}', @x); SELECT @x;`;
    const count = await conn.getConnection(sqlQuery, res);
    res.send({ response: response[0], count: count[2][0]["@x"] });
  }
);
// #endregion

/**
 * @swagger
 * definitions:
 *   Add_money_distribution:
 *     properties:
 *       rec_id:
 *         type: integer
 *       amount:
 *         type: integer
 *       date:
 *         type: string
 *       transaction_id:
 *         type: string
 *       comment:
 *         type: string
 *       status:
 *         type: string
 *         enum:
 *          - Active
 *          - Inactive
 */
//#endregion
//#region /money_distribution : post
/**
 * @swagger
 * /money_distribution:
 *   post:
 *     tags:
 *       - Money Distribution
 *     description: Returns all money distribution
 *     summary: Add money distribution
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Add_money_distribution'
 *     responses:
 *       200:
 *         description: An array of money distribution
 *       401:
 *         description : Unauthorized
 *       403:
 *         description : Forbidden
 *       404:
 *         description : Not Found
 *         schema:
 *           $ref: '#/definitions/Add_money_distribution'
 *     security:
 *       - Bearer: []
 */

router.post("/", auth.authenticateToken, async (req, res) => {
  const moneyDistribution = req.body;
  const { err } = moneyDistribution;
  if (err) return res.status(400).send(err.details[0].message);

  var sql = `SET @rec_id = 0; \   
        call money_distribution_upsert(@rec_id, \                 
                      '${req.user.rec_id}', \ 
                      '${moneyDistribution.amount}', \                  
                      '${moneyDistribution.date}', \
                      '${moneyDistribution.transaction_id}', \
                      '${moneyDistribution.comment}',\
                      '${moneyDistribution.status}'); \                        
        SELECT @rec_id as rec_id;`;

  var last_inserted_id = 0;

  var result = await conn.getConnection(sql, res);

  result.forEach((element) => {
    if (element.constructor == Array) {
      last_inserted_id = element[0].rec_id;
    }
  });

  if (last_inserted_id == -1) {
    return error(res, 400, "Bad request", "Money distribution already created");
  } else {
    return res.status(200).send({ rec_id: last_inserted_id });
  }
});
//#endregion

/**
 * @swagger
 * definitions:
 *   Update_Money_distribution_details:
 *     properties:
 *       rec_id:
 *         type: integer
 *       amount:
 *         type: integer
 *       date:
 *         type: string
 *       transaction_id:
 *         type: string
 *       comment:
 *         type: string
 *       status:
 *         type: string
 *         enum:
 *          - Active
 *          - Inactive
 */
//#endregion

//#region /money_distribution : put
/**
 * @swagger
 * /money_distribution:
 *   put:
 *     tags:
 *       - Money Distribution
 *     description: Update money distribution details
 *     summary: Update money distribution details.,
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: product
 *         description: Money distribution object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Update_Money_distribution_details'
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
  const moneyDistribution = req.body;

  //  const { err } = validate(order);
  const { err } = moneyDistribution;
  if (err) return res.status(400).send(err.details[0].message);

  var sql = `SET @rec_id =${moneyDistribution.rec_id}; \   
    call money_distribution_upsert(@rec_id, \                 
        '${req.user.rec_id}', \ 
        '${moneyDistribution.amount}', \                  
        '${moneyDistribution.date}', \
        '${moneyDistribution.transaction_id}', \
        '${moneyDistribution.comment}',\
        '${moneyDistribution.status}'); \                        
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
    return error(res, 400, "Bad request", "Money distribution already added");
  } else {
    return res.status(200).send({ rec_id: last_inserted_id });
  }
});
//#endregion

//#region /money_distribution/rec_id/{id}: get
/**
 * @swagger
 * /money_distribution/rec_id/{id}:
 *   get:
 *     tags:
 *       - Money Distribution
 *     description: Returns money distribution by rec id
 *     summary: Get money distribution by rec id.,
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
 *         description:  money distribution by rec id
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

  const sql = `call money_distribution_by_rec_id(${rec_id})`;

  var result = await conn.getConnection(sql, res);

  return res.status(200).send(result[0]); // return result
});
//#endregion
module.exports = router;
