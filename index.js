const express = require("express");
const router = express();
const user = require("./routes/user");
const systemUser = require("./routes/systemUser");
const vendor = require("./routes/vendor");
const store = require("./routes/store");
const breadcrums = require("./routes/breadcrumbs");
const category = require("./routes/category");
const sub_category = require("./routes/sub-category");
const base_category = require("./routes/base-category");
const sizes = require("./routes/size");
const utils = require("./util/util");
const products = require("./routes/products");
const packages = require("./routes/packages");
const payments = require("./routes/payments");
const orders = require("./routes/orders");
const states = require("./routes/states");
const ads = require("./routes/ads");
const tags = require("./routes/tags");
//const 
const proximity_ads = require("./routes/proximity_ads");
const notifications = require("./routes/notifications");
const money_distribution = require("./routes/money_distribution");
const bodyParser = require("body-parser");
var http = require("http");
const swaggerUI = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");
const path = require("path");
const brands = require("./routes/brands");
const hobby = require("./routes/hobby")
const events=require("./routes/events");
const feed=require("./routes/feed");

router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
router.use(bodyParser.json());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "CIY",
      version: "1.0.0",
      description: "CIY API information.",
    },
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
    host: "localhost:8080",
  },
  apis: ["./routes/*.js", "./util/util.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

router.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

router.use(cors());
router.use(express.json());
router.use("/user", user);
router.use("/system-user", systemUser);
router.use("/vendor", vendor);
router.use("/store", store);
router.use("/notifications", notifications);
router.use("/breadcrumbs", breadcrums);
router.use("/category", category);
router.use("/sub-category", sub_category);
router.use("/base-category", base_category);
router.use("/product", products);
router.use("/package", packages);
router.use("/payment", payments);
router.use("/size", sizes);
router.use("/utils", utils);
router.use("/ads", ads);
router.use("/tag", tags);
router.use("/states", states);
router.use("/order", orders);
router.use("/brands", brands);
router.use("/hobby", hobby);
router.use('/events',events);
router.use('/feed',feed);
router.use("/proximity_ads", proximity_ads);
router.use("/money_distribution", money_distribution);

router.use("/uploads", express.static(path.join(__dirname, "uploads")));

const httpServer = http.createServer(router);
httpServer.listen(8080, () => {
  console.log("Server listening on port 8080");
});
