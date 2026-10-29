(() => {
  'use strict';
  const TOTAL_SECONDS = 90 * 60;
  const $ = (id) => document.getElementById(id);
  const screens = { start: $('start-screen'), quiz: $('quiz-screen'), result: $('result-screen') };
  const form = $('identity-form');
  const state = { student: null, questions: [], index: 0, answers: [], startedAt: 0, deadline: 0, timerId: null, finished: false, finishReason: 'Selesai' };

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function showScreen(name) {
    Object.entries(screens).forEach(([key, node]) => node.classList.toggle('d-none', key !== name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function safeText(value) { return String(value ?? '').trim(); }
  function formatClock(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  function formatDuration(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    if (h) return `${h} jam ${m} menit ${r} detik`;
    if (m) return `${m} menit ${r} detik`;
    return `${r} detik`;
  }
  function buildSessionQuestions() {
    return shuffle(window.QUESTION_BANK).map((q) => {
      // Setiap pilihan membawa identitas benar/salahnya sendiri sebelum diacak.
      const choices = q.options.map((text, originalIndex) => ({ text, correct: originalIndex === q.answer }));
      return { ...q, choices: shuffle(choices), answered: false, selected: null };
    });
  }
  function startAssessment(event) {
    event.preventDefault();
    form.classList.add('was-validated');
    const name = safeText($('student-name').value);
    const nis = safeText($('student-nis').value);
    const studentClass = safeText($('student-class').value);
    if (!name || !nis || !studentClass || !form.checkValidity()) {
      $('start-error').textContent = 'Lengkapi nama, NIS, dan kelas dengan benar sebelum memulai.';
      $('start-error').classList.remove('d-none');
      form.querySelector(':invalid')?.focus();
      return;
    }
    if (!Array.isArray(window.QUESTION_BANK) || window.QUESTION_BANK.length !== 25 || window.QUESTION_BANK.some(q => !Array.isArray(q.options) || q.options.length !== 5 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 4)) {
      $('start-error').textContent = 'Bank soal tidak valid. Muat ulang halaman atau hubungi pengelola asesmen.';
      $('start-error').classList.remove('d-none');
      return;
    }
    state.student = { name, nis, studentClass };
    state.questions = buildSessionQuestions();
    state.index = 0;
    state.answers = [];
    state.startedAt = Date.now();
    state.deadline = state.startedAt + TOTAL_SECONDS * 1000;
    state.finished = false;
    state.finishReason = 'Selesai';
    $('welcome-title').textContent = `Semangat, ${name}!`;
    $('start-error').classList.add('d-none');
    showScreen('quiz');
    renderQuestion();
    updateTimer();
    state.timerId = window.setInterval(updateTimer, 250);
  }
  function updateTimer() {
    if (state.finished) return;
    const remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    $('timer').textContent = formatClock(remaining);
    $('timer-box').classList.toggle('urgent', remaining <= 300);
    if (remaining <= 0) finishAssessment('Waktu habis');
  }
  function renderQuestion() {
    if (state.finished) return;
    const q = state.questions[state.index];
    if (!q) return finishAssessment('Selesai');
    $('question-counter').textContent = `Soal ${state.index + 1} dari ${state.questions.length}`;
    $('question-number').textContent = `SOAL ${String(state.index + 1).padStart(2, '0')}`;
    $('question-text').textContent = q.question;
    $('options-list').replaceChildren();
    $('feedback').className = 'feedback-box d-none mt-4';
    $('feedback').replaceChildren();
    $('next-btn').disabled = true;
    $('next-btn').textContent = state.index === state.questions.length - 1 ? 'Lihat Hasil ✓' : 'Soal Berikutnya →';
    q.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'option-btn';
      const letter = document.createElement('span'); letter.className = 'option-letter'; letter.textContent = String.fromCharCode(65 + index);
      const label = document.createElement('span'); label.textContent = choice.text;
      button.append(letter, label);
      button.addEventListener('click', () => selectAnswer(index));
      $('options-list').append(button);
    });
    updateProgress();
  }
  function updateProgress() {
    const answered = state.questions.filter(q => q.answered).length;
    const pct = Math.round(answered / state.questions.length * 100);
    $('answered-counter').textContent = `Terjawab ${answered} dari ${state.questions.length}`;
    $('progress-bar').style.width = `${pct}%`;
    $('progress-wrap').setAttribute('aria-valuenow', String(pct));
  }
  function selectAnswer(choiceIndex) {
    if (state.finished) return;
    const q = state.questions[state.index];
    if (!q || q.answered) return;
    q.answered = true;
    q.selected = choiceIndex;
    const selectedChoice = q.choices[choiceIndex];
    state.answers.push({ question: q.question, selected: selectedChoice.text, correct: selectedChoice.correct, correctAnswer: q.choices.find(c => c.correct)?.text ?? '', explanation: q.explanation });
    const buttons = [...$('options-list').querySelectorAll('button')];
    buttons.forEach((button, i) => {
      button.disabled = true;
      if (q.choices[i].correct) button.classList.add('correct');
      if (i === choiceIndex && !q.choices[i].correct) button.classList.add('incorrect');
    });
    const feedback = $('feedback');
    feedback.classList.remove('d-none');
    feedback.classList.add(selectedChoice.correct ? 'is-correct' : 'is-wrong');
    const heading = document.createElement('div'); heading.className = 'feedback-title';
    heading.textContent = selectedChoice.correct ? '😊 GOOD JOB! Jawaban benar.' : '😢 Belum tepat.';
    const answerLine = document.createElement('p');
    if (!selectedChoice.correct) {
      const strong = document.createElement('strong'); strong.textContent = 'Jawaban benar: ';
      answerLine.append(strong, document.createTextNode(`${String.fromCharCode(65 + q.choices.findIndex(c => c.correct))}. ${q.choices.find(c => c.correct)?.text ?? ''}`));
    } else {
      answerLine.textContent = 'Jawabanmu tepat. Pertahankan semangat belajarmu!';
    }
    const explanation = document.createElement('p'); explanation.className = 'mb-0';
    const explainStrong = document.createElement('strong'); explainStrong.textContent = 'Pembahasan: ';
    explanation.append(explainStrong, document.createTextNode(q.explanation));
    feedback.append(heading, answerLine, explanation);
    $('next-btn').disabled = false;
    updateProgress();
    $('next-btn').focus({ preventScroll: true });
  }
  function nextQuestion() {
    if (state.finished) return;
    const current = state.questions[state.index];
    if (!current?.answered) return;
    if (Date.now() >= state.deadline) return finishAssessment('Waktu habis');
    if (state.index >= state.questions.length - 1) return finishAssessment('Selesai');
    state.index += 1;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function finishAssessment(reason) {
    if (state.finished) return;
    state.finished = true;
    state.finishReason = reason;
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
    const elapsed = Math.min(TOTAL_SECONDS, Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000)));
    const correct = state.questions.filter(q => q.answered && q.choices[q.selected]?.correct).length;
    const answered = state.questions.filter(q => q.answered).length;
    const wrong = state.questions.filter(q => q.answered && !q.choices[q.selected]?.correct).length;
    const unanswered = state.questions.length - answered;
    const score = Math.round((correct / state.questions.length) * 100);
    $('result-emoji').textContent = score >= 80 ? '🏆' : score >= 60 ? '😊' : '💪';
    $('result-heading').textContent = reason === 'Waktu habis' ? 'Waktu Habis!' : 'Hasil Asesmen';
    $('result-message').textContent = score >= 80 ? 'Hebat! Kamu menunjukkan pemahaman yang sangat baik.' : score >= 60 ? 'Bagus! Terus tingkatkan pemahamanmu.' : 'Tetap semangat. Pelajari kembali pembahasan dan coba lagi.';
    $('final-score').textContent = String(score);
    $('correct-count').textContent = String(correct);
    $('wrong-count').textContent = String(wrong);
    $('unanswered-count').textContent = String(unanswered);
    $('result-name').textContent = state.student.name;
    $('result-nis').textContent = state.student.nis;
    $('result-class').textContent = state.student.studentClass;
    $('result-time').textContent = formatDuration(elapsed);
    $('result-status').textContent = reason === 'Waktu habis' ? 'Selesai otomatis karena waktu habis' : 'Selesai';
    showScreen('result');
  }
  function resetApp() {
    if (state.timerId) window.clearInterval(state.timerId);
    state.student = null; state.questions = []; state.index = 0; state.answers = []; state.startedAt = 0; state.deadline = 0; state.timerId = null; state.finished = false;
    form.reset(); form.classList.remove('was-validated'); $('start-error').classList.add('d-none'); $('timer-box').classList.remove('urgent');
    showScreen('start');
  }
  form.addEventListener('submit', startAssessment);
  $('next-btn').addEventListener('click', nextQuestion);
  $('print-btn').addEventListener('click', () => window.print());
  $('restart-btn').addEventListener('click', resetApp);
})();
