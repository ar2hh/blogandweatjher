const express = require("express");
const axios = require("axios");

const router = express.Router();
const API_KEY = process.env.WEATHER_API_KEY;

// 🌍 WEATHER BY CITY
router.get("/:city", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: req.params.city,
          appid: API_KEY,
          units: "metric"
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(404).json({ message: "City not found" });
  }
});

// 🔍 LOCATION AUTOCOMPLETE
router.get("/search/:query", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: req.params.query,
          limit: 5,
          appid: API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json([]);
  }
});

module.exports = router;
