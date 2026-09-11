const STEPS_PER_MOBILE_PAGE = 4;
const MOBILE_PAGE_COUNT = 4;

export function stepsForPage(page) {
  const safePage = Math.min(MOBILE_PAGE_COUNT - 1, Math.max(0, page));
  const start = safePage * STEPS_PER_MOBILE_PAGE;
  return Array.from({ length: STEPS_PER_MOBILE_PAGE }, (_, index) => start + index);
}

export function pageForStep(step) {
  const safeStep = Math.min(15, Math.max(0, step));
  return Math.floor(safeStep / STEPS_PER_MOBILE_PAGE);
}
