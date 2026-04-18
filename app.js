const oddsByLevel = {
  2: [100, 0, 0, 0, 0],
  3: [75, 25, 0, 0, 0],
  4: [55, 30, 15, 0, 0],
  5: [45, 33, 20, 2, 0],
  6: [25, 40, 30, 5, 0],
  7: [19, 30, 35, 15, 1],
  8: [18, 25, 32, 22, 3],
  9: [10, 20, 25, 35, 10],
  10: [5, 10, 20, 40, 25]
};

const state = {
  targets: [
    { name: "Tướng carry", cost: 3 },
    { name: "Tank chính", cost: 4 }
  ]
};

const els = {
  level: document.querySelector("#level"),
  gold: document.querySelector("#gold"),
  cost: document.querySelector("#cost"),
  needed: document.querySelector("#needed"),
  rolls: document.querySelector("#rolls"),
  slotRate: document.querySelector("#slotRate"),
  hitRate: document.querySelector("#hitRate"),
  adviceText: document.querySelector("#adviceText"),
  targetName: document.querySelector("#targetName"),
  targetCost: document.querySelector("#targetCost"),
  addTarget: document.querySelector("#addTarget"),
  targetList: document.querySelector("#targetList")
};

function clampNumber(value, min, max) {
  const number = Number(value);
  if (Number.isNaN(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function formatPercent(value) {
  if (value >= 99.5) return "99%+";
  if (value <= 0) return "0%";
  return `${Math.round(value)}%`;
}

function chanceForAtLeastOne(slotChance, rolls) {
  const shopSlots = rolls * 5;
  const missChance = Math.pow(1 - slotChance / 100, shopSlots);
  return (1 - missChance) * 100;
}

function getAdvice(level, cost, gold, hitRate, needed) {
  if (gold < 10) return "Vàng thấp. Chỉ roll nếu cần giữ máu hoặc sắp thua vòng quan trọng.";
  if (needed >= 3 && gold < 30) return "Bạn còn thiếu nhiều bản. Giữ vàng để lên kinh tế rồi roll ở mốc cấp đẹp hơn.";
  if (cost >= 4 && level < 8) return "Tướng 4-5 vàng thường đáng tìm hơn ở cấp 8 trở lên. Ưu tiên giữ máu và lên cấp.";
  if (hitRate > 85 && needed <= 2) return "Cửa tìm tướng đang ổn. Có thể roll từng nhịp nhỏ, dừng khi còn mốc vàng an toàn.";
  if (level <= 6 && cost <= 2) return "Nếu đang reroll tướng rẻ, roll chậm trên 50 vàng sẽ ổn hơn roll cạn.";
  return "Roll theo nhịp 2-4 lượt rồi dừng xem bàn. Đừng để hụt mốc vàng khi chưa bắt buộc phải all-in.";
}

function updateSummary() {
  const level = clampNumber(els.level.value, 2, 10);
  const gold = clampNumber(els.gold.value, 0, 200);
  const cost = clampNumber(els.cost.value, 1, 5);
  const needed = clampNumber(els.needed.value, 1, 9);
  const rolls = Math.floor(gold / 2);
  const slotRate = oddsByLevel[level][cost - 1];
  const hitRate = chanceForAtLeastOne(slotRate, rolls);

  els.rolls.textContent = String(rolls);
  els.slotRate.textContent = `${slotRate}%`;
  els.hitRate.textContent = formatPercent(hitRate);
  els.adviceText.textContent = getAdvice(level, cost, gold, hitRate, needed);
}

function renderTargets() {
  els.targetList.innerHTML = "";

  state.targets.forEach((target, index) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    const remove = document.createElement("button");

    text.innerHTML = `${target.name}<br><small>${target.cost} vàng</small>`;
    remove.type = "button";
    remove.textContent = "Xóa";
    remove.addEventListener("click", () => {
      state.targets.splice(index, 1);
      renderTargets();
    });

    item.append(text, remove);
    els.targetList.append(item);
  });
}

function addTarget() {
  const name = els.targetName.value.trim();
  const cost = clampNumber(els.targetCost.value, 1, 5);
  if (!name) return;

  state.targets.unshift({ name, cost });
  els.targetName.value = "";
  renderTargets();
}

["change", "input"].forEach((eventName) => {
  [els.level, els.gold, els.cost, els.needed].forEach((el) => {
    el.addEventListener(eventName, updateSummary);
  });
});

els.addTarget.addEventListener("click", addTarget);
els.targetName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTarget();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

updateSummary();
renderTargets();
