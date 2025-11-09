import data from '../../src/data/projects.json'
import { useEffect, useState } from 'react'
import ProjectCard from '../../src/components/ProjectCard'

export default function Projects() {
  const [q, setQ] = useState("")
  const [tab, setTab] = useState("All")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  // --- Collect categories dynamically (handles multiple or single) ---
  const allCategories = data.projects.flatMap(p => {
    if (Array.isArray(p.category)) return p.category
    if (typeof p.category === "string" && p.category.trim() !== "") return [p.category]
    return []
  })

  const uniqueCategories = Array.from(new Set(allCategories.map(c => c.trim()))).sort((a, b) =>
    a.localeCompare(b)
  )

  // Add “Featured” if any project is featured
  const hasFeatured = data.projects.some(p => p.featured)
  const categories = hasFeatured ? ["Featured", ...uniqueCategories] : uniqueCategories

  // --- Filter + Sort logic ---
  const filtered = data.projects
    .filter(p => {
      const projectCats = Array.isArray(p.category)
        ? p.category.map(c => c.toLowerCase())
        : typeof p.category === "string"
        ? [p.category.toLowerCase()]
        : []

      const matchTab =
        tab === "All" ||
        (tab === "Featured" && p.featured) ||
        projectCats.includes(tab.toLowerCase())

      const searchText = (p.title + p.blurb + (p.tags || []).join(" ")).toLowerCase()
      const matchSearch = searchText.includes(q.toLowerCase())

      return matchTab && matchSearch
    })
    .sort((a, b) => {
      const orderA = a.order ?? Infinity
      const orderB = b.order ?? Infinity
      return orderA - orderB || a.title.localeCompare(b.title)
    })

  return (
    <>
      <div
        className={`transition-all duration-1000 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <section>
          {/* ---- header + filter ---- */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-5xl md:text-3xl font-display font-bold animated-gradient">
              Projects
            </h1>

            <div className="flex flex-wrap gap-2 relative">
              {["All", ...categories].map(t => {
                const count =
                  t === "All"
                    ? data.projects.length
                    : t === "Featured"
                    ? data.projects.filter(p => p.featured).length
                    : data.projects.filter(p => {
                        const cats = Array.isArray(p.category)
                          ? p.category.map(c => c.toLowerCase())
                          : typeof p.category === "string"
                          ? [p.category.toLowerCase()]
                          : []
                        return cats.includes(t.toLowerCase())
                      }).length

                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative px-3 py-1 rounded-xl border transition-all duration-300 ease-in-out ${
                      tab === t
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        : "border-white/10 text-white/80 hover:bg-white/5 hover:text-cyan-200"
                    }`}
                  >
                    {t}
                    {t !== "All" && ` (${count})`}
                    {tab === t && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)]"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ---- search ---- */}
          <div className="mt-6">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search projects…"
              className="w-full md:w-80 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-cyan-400 transition-all duration-300"
            />
          </div>

          {/* ---- project grid ---- */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {filtered.length === 0 && (
              <p className="text-white/60 col-span-full text-center py-10">
                No projects found for this category.
              </p>
            )}

            {filtered.map((p, i) => (
              <div
                key={p.slug}
                style={{ transitionDelay: `${i * 80}ms` }}
                className={`transition-all duration-700 ease-out transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
