const express = require('express');
const router = express.Router();
const conn = require("../connection");
const auth = require("../middleware/auth");

router.get('/getallfeed', (req, res) => {
  let sql = 'SELECT rec_id, image_link , image_name FROM Feed '; // Add rec_id to the query
  conn.connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error retrieving events:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const feedData = results.map((result) => ({
        rec_id: result.rec_id,
        image_link: result.image_link,
        image_name: result.image_name
      }));
      res.json({ feed: feedData }); // Update the response object
    }
  });
});
router.get('/getonfeed', (req, res) => {
  const rec_id = req.query.rec_id; // Access rec_id from query parameter
  console.log("hitted rec_id", rec_id);
  let sql = `
    SELECT 
      Feed.rec_id, 
      Feed.image_link, 
      Feed.image_name, 
      users.user_name,
      image_tags.x_coordinate,
      image_tags.y_coordinate,
      image_tags.productId,
      image_tags.storeId,
      image_tags.storeName
    FROM 
      Feed
    JOIN 
      users ON Feed.user_id = users.rec_id
    LEFT JOIN
      image_tags ON Feed.rec_id = image_tags.image_id
    WHERE 
      Feed.rec_id = ?
  `; // Join the Feed, Users, and image_tags tables and add WHERE clause to filter by rec_id

  conn.connection.query(sql, [rec_id], (error, results) => {
    if (error) {
      console.error('Error retrieving events:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const feedData = results.reduce((acc, result) => {
        const existingFeedItem = acc.find((item) => item.rec_id === result.rec_id);
        if (existingFeedItem) {
          existingFeedItem.image_tags.push({
            x_coordinate: result.x_coordinate,
            y_coordinate: result.y_coordinate,
            productId: result.productId,
            storeId: result.storeId,
            storeName: result.storeName,
          });
        } else {
          acc.push({
            rec_id: result.rec_id,
            image_link: result.image_link,
            image_name: result.image_name,
            user_name: result.user_name,
            image_tags: [
              {
                x_coordinate: result.x_coordinate,
                y_coordinate: result.y_coordinate,
                productId: result.productId,
                storeId: result.storeId,
                storeName: result.storeName,
              },
            ],
          });
        }
        return acc;
      }, []);
      res.json({ feed: feedData }); // Update the response object
    }
  });
});

module.exports = router;
