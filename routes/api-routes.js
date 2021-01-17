const router = require("express").Router();
const record = require("../models/record.js");

router.post("/api/record", ({ body }, res) => {
    record.create(body)
        .then(dbRecord => {
            res.json(dbRecord);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

router.post("/api/record/bulk", ({ body }, res) => {
    record.insertMany(body)
        .then(dbRecord => {
            res.json(dbRecord);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

router.get("/api/record", (req, res) => {
    record.find({})
        .sort({ date: -1 })
        .then(dbRecord => {
            res.json(dbRecord);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

module.exports = router;
