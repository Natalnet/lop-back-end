const router = require("express").Router();
const WelcomeController = require("../app/controllers/welcomeController");
const { catchErrors } = require("../utils/errors/errors");

router.get("/", catchErrors(WelcomeController.hello));
router.get("/error", catchErrors(WelcomeController.error));

module.exports = (app) => app.use(router);
