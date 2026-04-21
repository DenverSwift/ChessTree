(function () {
  const input = document.getElementById('helpSearch');
  const findBtn = document.getElementById('helpFindBtn');
  const nextBtn = document.getElementById('helpNextBtn');
  const status = document.getElementById('helpSearchStatus');

  if (!input || !findBtn || !nextBtn || !status) {
    return;
  }

  function runFind() {
    const query = input.value.trim();
    if (!query) {
      status.textContent = 'Введіть текст для пошуку.';
      return;
    }

    const found = window.find(query, false, false, true, false, false, false);
    status.textContent = found ? 'Збіг знайдено.' : 'Збігів не знайдено.';
  }

  findBtn.addEventListener('click', runFind);
  nextBtn.addEventListener('click', runFind);
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      runFind();
    }
  });
})();
