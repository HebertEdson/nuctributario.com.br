// MODAL DE PARCERIAS

window.openPartnershipModal = function(e) {
  if (e) e.preventDefault();
  var modal = document.getElementById('partnership-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
  }
};

window.closePartnershipModal = function() {
  var modal = document.getElementById('partnership-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
};

window.handleModalOverlayClick = function(e) {
  if (e.target === document.getElementById('partnership-modal')) {
    closePartnershipModal();
  }
};

window.openFormModal = window.openPartnershipModal;
window.closeFormModal = window.closePartnershipModal;

// INICIALIZAÇÃO
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  try {
    // Menu hamburger
    var menuToggle = document.getElementById('menu-toggle');
    var navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
      menuToggle.onclick = function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
      };

      var links = navMenu.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) {
        links[i].onclick = function() {
          menuToggle.classList.remove('active');
          navMenu.classList.remove('active');
        };
      }
    }
  } catch(err) {
    console.log('Erro na inicialização:', err);
  }
}

// ─── FORM SUBMISSIONS ───
async function submitCTA(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  const btnText = btn.textContent;

  try {
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const data = {
      email: form.email.value,
      telefone: form.telefone.value
    };

    // Track CTA click
    trackEvent('cta_submit', window.location.pathname, 'cta-form');

    const response = await fetch('/api/cta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('✅ Solicitação enviada com sucesso!');
      form.reset();
    } else {
      alert('❌ Erro ao enviar. Tente novamente.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Erro ao enviar. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = btnText;
  }
}

async function submitDocuments(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  const btnText = btn.textContent;

  try {
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const data = {
      empresa: form.empresa.value,
      cnpj: form.cnpj.value,
      responsavel: form.responsavel.value,
      email: form.email.value,
      telefone: form.telefone.value,
      faturamento: form.faturamento.value || 'Não informado'
    };

    // Track document submission
    trackEvent('document_submit', window.location.pathname, 'documents-form');

    const response = await fetch('/api/documentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('✅ Documentos enviados com sucesso!');
      form.reset();
    } else {
      alert('❌ Erro ao enviar. Tente novamente.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Erro ao enviar. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = btnText;
  }
}

async function submitPartnership(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  const btnText = btn.textContent;

  try {
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const data = {
      nome: form.nome.value,
      cpf: form.cpf.value,
      email: form.email.value,
      telefone: form.telefone.value,
      profissao: form.profissao.value,
      experiencia: form.experiencia.value,
      estado: form.estado.value,
      cidade: form.cidade.value
    };

    // Track partnership submission
    trackEvent('partnership_submit', window.location.pathname, 'partnership-form');

    const response = await fetch('/api/parcerias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert('✅ Candidatura enviada com sucesso!');
      form.reset();
      closeFormModal();
    } else {
      alert('❌ Erro ao enviar. Tente novamente.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Erro ao enviar. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = btnText;
  }
}

// ─── UTILITY ───
function trackEvent(type, page, element) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, page, element })
  }).catch(console.error);
}
