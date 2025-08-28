// ====== Utilities ======
const $ = (sel) => document.querySelector(sel);
const state = { file: null, blob: null, media: null, chunks: [], items: [] };


// ====== Demo data ======
const demo = [
    { name: "Aïssata Diarra", topic: "Entrepreneuriat", title: "Lancer sa micro‑entreprise en 90 jours", url: "" },
    { name: "Moussa Cissé", topic: "Hôtellerie", title: "Réception de nuit : les réflexes", url: "" },
    { name: "Fatoumata Sy", topic: "Études", title: "Bourse en France : parcours", url: "" },
    { name: "Bakary Traoré", topic: "Transport", title: "Taxi : obtenir sa licence", url: "" },
];


function renderCards() {
    const el = $('#cards');
    el.innerHTML = demo.map((d, i) => `
<article class="speaker">
<div class="avatar" aria-hidden="true"></div>
<div>
<strong>${d.title}</strong>
<div class="topic">${d.topic} • par: ${d.name}</div>
</div>
<audio ${d.url ? ` + "src=\"${d.url}\" controls" + ` : ''} preload="none" aria-label="Lire ${d.title}"></audio>
</article>
`).join('');
}

// ====== Upload interactions ======
const dz = $('#dropzone');
const fileInput = $('#file-input');
const preview = $('#preview');
const statusEl = $('#status');


if (dz && fileInput) {
    dz.addEventListener('click', () => fileInput.click());
    dz.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', (e) => {
        e.preventDefault(); dz.classList.remove('dragover');
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    });
}


function handleFile(file) {
    if (!file.type.includes('audio')) { setStatus('Fichier non audio.'); return; }
    state.file = file;
    const url = URL.createObjectURL(file);
    preview.innerHTML = `<audio controls src="${url}"></audio>`;
    setStatus(`${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type}`);
}


// ====== Recording (MediaRecorder) ======
const recBtn = $('#btn-record');
let mediaRecorder;


if (recBtn) {
    recBtn.addEventListener('click', async () => {
        try {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                state.chunks = [];
                mediaRecorder.ondataavailable = e => e.data.size && state.chunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(state.chunks, { type: 'audio/webm' });
                    state.blob = blob;
                    const url = URL.createObjectURL(blob);
                    preview.innerHTML = `<audio controls src="${url}"></audio>`;
                    setStatus(`Enregistrement terminé • ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
                };
                mediaRecorder.start();
                recBtn.textContent = '⏹️ Stop';
                setStatus('Enregistrement…');
            } else {
                mediaRecorder.stop();
                recBtn.textContent = '⏺️ Enregistrer';
            }
        } catch (err) {
            console.error(err);
            setStatus('Micro non accessible.');
        }
    });
}


// ====== Fake Upload (replace with your backend call) ======
const uploadBtn = $('#btn-upload');
if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        try {
            const file = state.file || state.blob;
            if (!file) { setStatus("Ajoute un MP3 ou enregistre d'abord."); return; }


            // Example for a real backend:
            // const form = new FormData();
            // form.append('audio', file, state.file?.name || 'recording.webm');
            // form.append('title', $('#title').value);
            // form.append('category', $('#category').value);
            // form.append('desc', $('#desc').value);
            // const res = await fetch('/api/upload', { method: 'POST', body: form });
            // const json = await res.json();
            // setStatus('Envoyé ✅');


            await new Promise(r => setTimeout(r, 600));
            setStatus('Simulé : prêt à connecter le backend ✅');
        } catch (e) {
            setStatus("Échec de l'envoi.");
        }
    });
}


function setStatus(text) { if (statusEl) statusEl.textContent = text; }


// ====== Init ======
renderCards();
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();