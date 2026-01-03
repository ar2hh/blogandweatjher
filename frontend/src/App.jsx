import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
const MAX_CHARS = 15000;

/* ================= VALID CITY CHECK ================= */
const isLikelyValidCity = (input) => {
  if (!input) return false;

  const invalidRegions = [
    "kashmir",
    "punjab",
    "haryana",
    "rajasthan",
    "kerala",
    "tamil nadu",
    "uttar pradesh",
    "bihar",
    "gujarat",
    "maharashtra",
    "india"
  ];

  const cleaned = input.split(",")[0].trim().toLowerCase();

  if (invalidRegions.includes(cleaned)) return false;
  if (!/[a-zA-Z]{3,}/.test(cleaned)) return false;

  return true;
};

export default function App() {
  const navigate = useNavigate();

  /* ================= BLOG STATES ================= */
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  /* ================= WEATHER STATES ================= */
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = localStorage.getItem("username");

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  /* ================= FETCH BLOGS ================= */
  useEffect(() => {
    axios.get(`${API}/api/blogs`).then(res => setBlogs(res.data));
  }, []);

  /* ================= AUTOCOMPLETE ================= */
  useEffect(() => {
    if (!isUserTyping || city.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API}/api/weather/search/${city}`,
          { signal: controller.signal }
        );
        setSuggestions(res.data);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [city, isUserTyping]);

  /* ================= BLOG ACTIONS ================= */
  const addBlog = async () => {
    if (!title || !content) {
      alert("Please fill all fields");
      return;
    }

    if (content.length > MAX_CHARS) {
      alert("Blog content cannot exceed 15000 characters");
      return;
    }

    const res = await axios.post(`${API}/api/blogs`, {
      title,
      content,
      author: user
    });

    setBlogs([res.data, ...blogs]);
    setTitle("");
    setContent("");
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    await axios.delete(`${API}/api/blogs/${id}`);
    setBlogs(blogs.filter(b => b._id !== id));
  };

  /* ================= WEATHER FETCH (VALIDATED) ================= */
  const getWeather = async () => {
    if (!city) {
      alert("Please enter a city name");
      return;
    }

    if (!isLikelyValidCity(city)) {
      alert(
        "Please select a valid city (not a region or state).\nExample: Srinagar, IN or Mumbai, IN"
      );
      return;
    }

    setLoading(true);
    setWeather(null);

    try {
      const res = await axios.get(`${API}/api/weather/${city}`);
      setWeather(res.data);
    } catch {
      alert("Weather data not available for this location");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🌤 Blog & Weather App</h1>

      <p style={{ textAlign: "center" }}>
        Logged in as <b>{user}</b>
      </p>

      {/* ================= BLOG SECTION ================= */}
      <div className="card">
        <h2>📝 Blog Platform</h2>

        <input
          placeholder="Blog title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Write your blog (max 15000 characters)..."
          value={content}
          maxLength={MAX_CHARS}
          onChange={e => setContent(e.target.value)}
        />

        <p style={{ fontSize: "12px", textAlign: "right", color: "#555" }}>
          {content.length} / {MAX_CHARS}
        </p>

        <button onClick={addBlog}>Add Blog</button>

        <div className="blog-list">
          {blogs.map(blog => (
            <div className="blog-card" key={blog._id}>
              <h3>{blog.title}</h3>

              <p style={{ whiteSpace: "pre-wrap" }}>{blog.content}</p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "12px"
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  ✍️{" "}
                  <span
                    style={{
                      textDecoration: "underline",
                      textUnderlineOffset: "3px"
                    }}
                  >
                    {blog.author}
                  </span>
                </span>

                {blog.author === user && (
                  <button
                    style={{ background: "#dc2626" }}
                    onClick={() => deleteBlog(blog._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= WEATHER SECTION ================= */}
      <div className="card">
        <h2>🌦 Weather App</h2>

        <div style={{ position: "relative" }}>
          <input
            placeholder="Start typing a city..."
            value={city}
            onChange={e => {
              setCity(e.target.value);
              setIsUserTyping(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0 && isUserTyping) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowDropdown(false);
                setIsUserTyping(false);
              }, 150);
            }}
          />

          {showDropdown && suggestions.length > 0 && (
            <ul className="dropdown">
              {suggestions.map((s, i) => (
                <li
                  key={`${s.name}-${i}`}
                  onMouseDown={() => {
                    setIsUserTyping(false);
                    setCity(`${s.name},${s.country}`);
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                >
                  {s.name}, {s.country}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={getWeather}>
          {loading ? "Loading..." : "Get Weather"}
        </button>

        {weather && (
          <div className="weather-card">
            <h3 className="weather-title">
              {weather.name}, {weather.sys.country}
            </h3>

            <div className="weather-main">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="icon"
              />
              <div>
                <div className="weather-temp">
                  {weather.main.temp}°C
                </div>
                <div className="weather-desc">
                  {weather.weather[0].description}
                </div>
              </div>
            </div>

            <div className="weather-stats">
              <div>🤔 <span>Feels like</span> <b>{weather.main.feels_like}°C</b></div>
              <div>💧 <span>Humidity</span> <b>{weather.main.humidity}%</b></div>
              <div>🌬 <span>Wind</span> <b>{weather.wind.speed} m/s</b></div>
              <div>🔽 <span>Pressure</span> <b>{weather.main.pressure} hPa</b></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
