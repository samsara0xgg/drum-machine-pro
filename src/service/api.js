// Pattern-sharing API. Same-origin: the Vite dev server proxies /api to Express.

export async function savePattern(snapshot) {
  const res = await fetch("/api/patterns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });
  if (!res.ok) throw new Error(`save failed: ${res.status}`);
  const { slug } = await res.json();
  return slug;
}

export async function loadPattern(slug) {
  const res = await fetch(`/api/patterns/${slug}`);
  if (!res.ok) throw new Error(`load failed: ${res.status}`);
  return res.json();
}
