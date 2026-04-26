const I18N = {
  en: {
    "άτομα": "people",
    "Ηλεκτρική άγκυρα": "Electric anchor",
    "Μουσικό σύστημα": "Sound system",
    "Ντους": "Shower",
    "Υδραυλικό τιμόνι": "Hydraulic steering",
    "Δεν φορτώθηκε ο στόλος. Δοκίμασε refresh ή έλεγξε το fleet-data.json.":
      "Couldn't load the fleet. Try refreshing or check fleet-data.json."
  }
};
const PAGE_LANG = (document.documentElement.lang || "el").toLowerCase().slice(0, 2);
const t = (s) => (I18N[PAGE_LANG] && I18N[PAGE_LANG][s]) || s;

document.addEventListener("DOMContentLoaded", () => {
  const speedRoot = document.getElementById("speedboats");
  const licRoot = document.getElementById("licence-free");

  // only for fleet.html (αν δεν υπάρχουν τα containers, βγαίνει)
  if (!speedRoot && !licRoot) return;

  loadFleet()
    .then((data) => {
      if (speedRoot) renderBoats(speedRoot, data.speedboats || []);
      if (licRoot) renderBoats(licRoot, data.licenceFree || []);

      // Gets the dots / auto-rotate / lightbox for new cards
      window.Nireus?.initCardCarousels?.();
    })
    .catch((err) => {
      console.error("Fleet load error:", err);
      const msg = document.createElement("p");
      msg.textContent = t("Δεν φορτώθηκε ο στόλος. Δοκίμασε refresh ή έλεγξε το fleet-data.json.");
      msg.style.textAlign = "center";
      msg.style.marginTop = "12px";
      (speedRoot || licRoot || document.body).appendChild(msg);
    });
});

async function loadFleet() {
  const res = await fetch("fleet-data.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load fleet-data.json (${res.status})`);
  return res.json();
}

function renderBoats(root, boats) {
  root.innerHTML = "";
  const frag = document.createDocumentFragment();
  boats.forEach((boat) => frag.appendChild(makeBoatCard(boat)));
  root.appendChild(frag);
}

function makeBoatCard(boat) {
  const article = document.createElement("article");
  article.className = "card";

  // IMG WRAP
  const imgWrap = document.createElement("div");
  imgWrap.className = "img";

  const images = Array.isArray(boat.images) ? boat.images : [];
  images.forEach((im) => {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = im.src;
    img.alt = im.alt || "";
    imgWrap.appendChild(img);
  });

  // BODY
  const body = document.createElement("div");
  body.className = "body";

  // Title layout: name centered + specs κάτω
  const head = document.createElement("div");
  head.className = "boat-head";

  const nameEl = document.createElement("h3");
  nameEl.className = "boat-name";
  nameEl.textContent = boat.name || "Boat";

  const specsEl = document.createElement("div");
  specsEl.className = "boat-specs";
  const peopleText = (boat.people ?? "") !== "" ? `${boat.people} ${t("άτομα")}` : "";
  specsEl.textContent = [boat.length || "", peopleText, boat.hp || ""].filter(Boolean).join(" • ");

  head.appendChild(nameEl);
  head.appendChild(specsEl);

  // FEATURES
  const ul = document.createElement("ul");
  ul.className = "features";
  (boat.features || []).forEach((f) => {
    const li = document.createElement("li");
    li.textContent = t(f);
    ul.appendChild(li);
  });

  body.appendChild(head);
  body.appendChild(ul);

  article.appendChild(imgWrap);
  article.appendChild(body);

  return article;
}
