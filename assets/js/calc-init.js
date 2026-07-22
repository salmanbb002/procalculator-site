(function () {
  const wrap = document.querySelector('[data-static-calc]');
  if (!wrap) return;
  const toolId = wrap.getAttribute('data-static-calc');
  const tool = getToolById(toolId);
  if (!tool) return;
  const formPanel = wrap.querySelector('[data-form-panel]');
  const resultPanel = wrap.querySelector('[data-result-panel]');
  if (tool.functional && CALCULATORS[tool.id]) {
    CALCULATORS[tool.id].render(formPanel, resultPanel);
  }
})();
