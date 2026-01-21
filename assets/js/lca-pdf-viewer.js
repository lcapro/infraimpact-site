document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.querySelector('.lca-example__viewer');
  if (!viewer) {
    return;
  }

  const pdfSource = viewer.dataset.pdfSrc;
  if (!pdfSource || !window.pdfjsLib) {
    return;
  }

  const canvas = viewer.querySelector('.lca-example__canvas');
  const loading = viewer.querySelector('.lca-example__loading');
  const error = viewer.querySelector('.lca-example__error');
  const pageNumberEl = viewer.querySelector('[data-page-number]');
  const pageCountEl = viewer.querySelector('[data-page-count]');
  const prevBtn = viewer.querySelector('[data-action="prev"]');
  const nextBtn = viewer.querySelector('[data-action="next"]');
  const zoomOutBtn = viewer.querySelector('[data-action="zoom-out"]');
  const zoomInBtn = viewer.querySelector('[data-action="zoom-in"]');
  const canvasWrap = viewer.querySelector('.lca-example__canvas-wrap');

  if (!canvas || !canvasWrap) {
    return;
  }

  const ctx = canvas.getContext('2d');
  let pdfDoc = null;
  let pageNum = 1;
  let scale = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let resizeTimer = null;

  const showLoading = () => {
    if (loading) {
      loading.classList.add('is-visible');
    }
  };

  const hideLoading = () => {
    if (loading) {
      loading.classList.remove('is-visible');
    }
  };

  const showError = (message) => {
    if (error) {
      error.textContent = message;
      error.classList.add('is-visible');
    }
  };

  const updatePageInfo = () => {
    if (pageNumberEl) {
      pageNumberEl.textContent = pageNum;
    }
    if (pageCountEl && pdfDoc) {
      pageCountEl.textContent = pdfDoc.numPages;
    }
    if (prevBtn) {
      prevBtn.disabled = pageNum <= 1;
    }
    if (nextBtn && pdfDoc) {
      nextBtn.disabled = pageNum >= pdfDoc.numPages;
    }
  };

  const renderPage = (num) => {
    if (!pdfDoc) {
      return;
    }
    pageRendering = true;
    showLoading();
    pdfDoc.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      return renderTask.promise;
    }).then(() => {
      pageRendering = false;
      hideLoading();
      updatePageInfo();
      if (pageNumPending !== null) {
        const pendingNum = pageNumPending;
        pageNumPending = null;
        renderPage(pendingNum);
      }
    }).catch(() => {
      pageRendering = false;
      hideLoading();
      showError('Het laden van de PDF is mislukt. Probeer de PDF direct te openen.');
    });
  };

  const queueRenderPage = (num) => {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  };

  const fitToWidth = () => {
    if (!pdfDoc) {
      return;
    }
    pdfDoc.getPage(pageNum).then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const availableWidth = canvasWrap.clientWidth - 2;
      const nextScale = availableWidth / viewport.width;
      scale = Math.max(0.65, Math.min(nextScale, 2.4));
      queueRenderPage(pageNum);
    }).catch(() => {
      showError('Het laden van de PDF is mislukt. Probeer de PDF direct te openen.');
    });
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (pageNum <= 1) {
        return;
      }
      pageNum -= 1;
      queueRenderPage(pageNum);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!pdfDoc || pageNum >= pdfDoc.numPages) {
        return;
      }
      pageNum += 1;
      queueRenderPage(pageNum);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      scale = Math.max(0.6, scale / 1.15);
      queueRenderPage(pageNum);
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      scale = Math.min(3, scale * 1.15);
      queueRenderPage(pageNum);
    });
  }

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      fitToWidth();
    }, 180);
  });

  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  pdfjsLib.getDocument(pdfSource).promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;
    updatePageInfo();
    fitToWidth();
  }).catch(() => {
    showError('Het laden van de PDF is mislukt. Probeer de PDF direct te openen.');
  });
});
