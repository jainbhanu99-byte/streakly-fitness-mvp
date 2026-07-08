/* Shop tab — split out of Garden. Reuses SHOP_ITEMS, shop-buy handler,
   itemOwned/equippedItem helpers defined in app.js. */
const SHOP_SECTIONS = [
  { type: 'freeze', label: 'Freezes' },
  { type: 'pot', label: 'Pots' },
  { type: 'background', label: 'Backgrounds' },
  { type: 'decoration', label: 'Decorations' }
];

function shopItemHTML(item) {
  const g = state.garden;
  const owned = itemOwned(item.id);
  const equipped = item.type !== 'freeze' && g.equipped[item.type] === item.id;
  let btnLabel, btnClass, disabled = '';
  if (item.type === 'freeze') { btnLabel = 'Buy · ' + item.cost; btnClass = ''; if (g.balance < item.cost) disabled = 'disabled'; }
  else if (equipped) { btnLabel = 'Equipped'; btnClass = 'equipped'; disabled = 'disabled'; }
  else if (owned) { btnLabel = 'Equip'; btnClass = 'owned'; }
  else { btnLabel = 'Buy · ' + item.cost; btnClass = ''; if (g.balance < item.cost) disabled = 'disabled'; }
  return `<div class="shop-item">
    <span class="emoji">${item.emoji}</span>
    <div class="name">${item.name}</div>
    <button class="${btnClass}" ${disabled} data-action="shop-buy" data-id="${item.id}">${btnLabel}</button>
  </div>`;
}

function renderShopHTML() {
  const g = state.garden;
  const sections = SHOP_SECTIONS.map(section => {
    const items = SHOP_ITEMS.filter(i => i.type === section.type);
    if (!items.length) return '';
    return `<div class="section-label" style="margin-top:18px;">${section.label}</div>
      <div class="shop-grid">${items.map(shopItemHTML).join('')}</div>`;
  }).join('');
  return `
    <div class="header"><div><h1>Shop</h1><div class="subtitle">${g.balance} points to spend</div></div></div>
    <div class="screen">${sections}</div>
    ${bottomNavHTML('shop')}
  `;
}
