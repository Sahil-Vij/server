const express = require("express");
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

router.post("/find-all-paged", auth.authenticateToken, async (req, res) => {
  const page = req.body.pageNo;
  const size = req.body.pageSize;
  const filter = req.body.statusQuery;
  const search = req.body.searchQuery;
  const orderCol = req.body.orderBy;
  const order = req.body.order;
  let sql = `call ciydb.ads_package_find_all_paged(${page}, ${size}, '${filter}', '%${search}%', '${orderCol}', ${order});`;
  const rows = await conn.getConnection(sql, res);

  sql = `call ciydb.ads_package_find_all_paged_count('${filter}', '%${search}%', @x); SELECT @x;`;
  const count = await conn.getConnection(sql, res);

  res.send({ rows: rows[0], count: count[1][0]["@x"] });
});

router.post("/delete-by-id", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const rec_id = user.rec_id;
  let sql = `call ciydb.ads_package_delete(${rec_id});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      res.send({ response: error + " occured." });
    }
    var response = "Package is deleted.";
    res.send({ response: response });
  });
});

router.post("/find-by-id", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const rec_id = user.rec_id;
  let sql = `call ciydb.ads_package_by_id(${rec_id});`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      res.send({ response: error + " occured." });
    }
    var response = results[0];
    res.send({ response: response });
  });
});

router.post("/upsert", auth.authenticateToken, (req, res) => {
  const user = req.body;
  const rec_id = user.rec_id;
  const package_name = user.package_name;
  const ad_no = user.ad_no;
  const pricing = user.pricing;
  const gst = user.gst;
  const seq = user.seq;
  const status = user.status;
  let sql = `SET @x = ${rec_id}; call ciydb.ads_package_upsert(@x,'${package_name}', ${ad_no}, ${pricing}, ${gst}, ${seq}, '${status}');`;
  console.log(sql);
  conn.connection.query(sql, function (error, results) {
    if (error) {
      res.send({ response: error + " occured." });
    }
    if (rec_id === 0) {
      var response = "Package added successfully.";
      res.send({ response: response });
    } else {
      var response = "Package updated successfully.";
      res.send({ response: response });
    }
  });
});
router.get("/list", auth.authenticateToken, (req, res) => {
  let sql = `call ciydb.ads_package_get_list();`;
  conn.connection.query(sql, function (error, results) {
    if (error) {
      res.send({ response: error + " occured." });
    }
    var response = results[0];
    res.send({ response: response });
  });
});

module.exports = router;
