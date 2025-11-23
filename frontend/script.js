const addBtn = document.getElementById("addBtn");
const targetInput = document.getElementById("target");
const codeInput = document.getElementById("code");
const formMsg = document.getElementById("formMsg");
const linksTbody = document.getElementById("linksTbody");
const filterInput = document.getElementById("filterInput");
const refreshBtn = document.getElementById("refreshBtn");

const BASE = window.BASE_URL || "";

function shortDisplay(s, n = 80) {
  return s.length > n ? s.slice(0, n - 3) + "..." : s;
}

async function loadLinks() {
  linksTbody.innerHTML = '<tr><td colspan="5" class="small">Loading…</td></tr>';
  try {
    const res = await fetch("/api/links");
    const rows = await res.json();
    renderRows(rows);
  } catch (e) {
    linksTbody.innerHTML =
      '<tr><td colspan="5" class="small">Failed to load</td></tr>';
  }
}

function renderRows(rows) {
  const q = filterInput.value.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (!q) return true;
    return (
      (r.code && r.code.toLowerCase().includes(q)) ||
      (r.target && r.target.toLowerCase().includes(q))
    );
  });

  if (filtered.length === 0) {
    linksTbody.innerHTML =
      '<tr><td colspan="5" class="empty">No links found.</td></tr>';
    return;
  }

  linksTbody.innerHTML = "";
  filtered.forEach((r) => {
    const tr = document.createElement("tr");

    const codeTd = document.createElement("td");
    codeTd.textContent = r.code;
    tr.appendChild(codeTd);

    const targetTd = document.createElement("td");
    const a = document.createElement("a");
    a.href = r.target;
    a.target = "_blank";
    a.textContent = shortDisplay(r.target, 80);
    targetTd.appendChild(a);
    tr.appendChild(targetTd);

    const clicksTd = document.createElement("td");
    clicksTd.textContent = r.clicks;
    tr.appendChild(clicksTd);

    const lastTd = document.createElement("td");
    lastTd.textContent = r.last_clicked || "—";
    tr.appendChild(lastTd);

    const actTd = document.createElement("td");
    actTd.className = "actions";
    const statsA = document.createElement("a");
    statsA.href = `/code/${r.code}`;
    statsA.textContent = "Stats";
    statsA.style.marginRight = "8px";
    actTd.appendChild(statsA);
    const openA = document.createElement("a");

    openA.href = `/${r.code}`;
    openA.target = "_blank";
    openA.textContent = "Open";
    openA.style.marginRight = "8px";
    actTd.appendChild(openA);
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(
          `${window.location.origin}/${r.code}`
        );
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
      } catch {
        alert("Copy failed");
      }
    };
    actTd.appendChild(copyBtn);
    const delBtn = document.createElement("button");
    delBtn.style.marginLeft = "8px";
    delBtn.className = "copy-btn";
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      if (!confirm(`Delete ${r.code}?`)) return;
      const resp = await fetch(`/api/links/${encodeURIComponent(r.code)}`, {
        method: "DELETE",
      });
      if (resp.status === 204) {
        loadLinks();
      } else {
        alert("Delete failed");
      }
    };
    actTd.appendChild(delBtn);

    tr.appendChild(actTd);

    linksTbody.appendChild(tr);
  });
}

document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";
  addBtn.disabled = true;
  const target = targetInput.value.trim();
  const code = codeInput.value.trim();

  try {
    const u = new URL(target);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      formMsg.textContent = "Only http/https URLs allowed";
      addBtn.disabled = false;
      return;
    }
  } catch {
    formMsg.textContent = "Invalid URL";
    addBtn.disabled = false;
    return;
  }
  if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) {
    formMsg.textContent = "Code must be 6-8 alphanumeric characters";
    addBtn.disabled = false;
    return;
  }

  try {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, code: code || undefined }),
    });
    if (res.status === 409) {
      formMsg.textContent = "Code already exists";
    } else if (res.status === 400) {
      const json = await res.json();
      formMsg.textContent = json.error || "Invalid input";
    } else if (res.status === 201) {
      const json = await res.json();
      formMsg.textContent = `Created: ${json.code}`;
      targetInput.value = "";
      codeInput.value = "";
      loadLinks();
    } else {
      formMsg.textContent = "Failed to create";
    }
  } catch (err) {
    console.error(err);
    formMsg.textContent = "Server error";
  } finally {
    addBtn.disabled = false;
  }
});

filterInput.addEventListener("input", () => loadLinks());
refreshBtn.addEventListener("click", () => loadLinks());

loadLinks();
