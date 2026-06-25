import { CONFIG_KEY_PANEL_POS } from './constants.js';
import { GM_setValue } from './gm.js';

export function makePanelDraggable(panel, handle) {
  if (window.innerWidth <= 700) {
    return;
  }
  let offsetX,
    offsetY,
    isDragging = false;
  const onMouseDown = (e) => {
    if (e.target.closest('.panel-header-actions')) return;
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    panel.style.left = `${e.clientX - offsetX}px`;
    panel.style.top = `${e.clientY - offsetY}px`;
  };
  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    GM_setValue(CONFIG_KEY_PANEL_POS, { x: panel.style.left, y: panel.style.top });
  };
  handle.addEventListener('mousedown', onMouseDown);
}
