import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"
import App from "./App"
import Blog from "./Blog"

const is_blog = window.location.hostname.startsWith("blog.")

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {is_blog ? (
          <>
            <Route path="/" element={<Blog />} />
            <Route path="/:slug" element={<Blog />} />
          </>
        ) : (
          <Route path="*" element={<App />} />
        )}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
