const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * definitions:
 *   state_list:
 */
//#region /states/list : get
/**
 * @swagger
 * /states/list:
 *   get:
 *     tags:
 *       - states
 *     description: List of all states.
 *     summary: state list.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: states
 *         description: states object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: states list retrieved.
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
  let sql = `call ciydb.state_list();`;
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
