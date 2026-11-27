
let BANK = [], QUESTION_POOL_COUNT = 0;
let HISTORY_BANK = [], historyQuestions = [], historyIndex = 0, historyAnswers = {}, historyTopic = "";
let GEOGRAPHY_BANK = [], geographyIndex = 0, geographyAnswers = {}, geographyTopic = "";
const TEST_COUNT = 100, Q_PER_TEST = 100, DURATION = 60*60, NEGATIVE = 0.25;
// Recent-paper practice blueprint: fixed section order, subject-wise random draws.
const PAPER_BLUEPRINT = [["History",10],["Geography",8],["Economy",16],["Current Affairs",16],["Polity",15],["General Science",15],["Maths",12],["Reasoning",8]];
let active = null, activePaper = [], timer = null, remaining = DURATION, answers = {}, marked = new Set(), current = 0, submitted = false;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function getHistory(){try{return JSON.parse(localStorage.getItem('mpscHistory')||'[]')}catch{return []}}
function saveHistory(h){localStorage.setItem('mpscHistory',JSON.stringify(h))}
function seededRandom(seed){
  let x = seed >>> 0;
  return function(){
    x += 0x6D2B79F5;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shufflePool(pool, random){
  const items = [...pool];
  for(let i=items.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [items[i],items[j]]=[items[j],items[i]];
  }
  return items;
}
function getPaper(n){
  const paper=BANK.filter(q=>q.paperNo===n).sort((a,b)=>a.questionNo-b.questionNo);
  if(paper.length!==Q_PER_TEST) throw new Error("Mock Test "+n+" must have exactly 100 questions; found "+paper.length+".");
  if(new Set(paper.map(q=>q.id)).size!==100) throw new Error("Duplicate question IDs in Mock Test "+n+".");
  if(new Set(paper.map(q=>q.conceptKey)).size!==100) throw new Error("Duplicate concepts in Mock Test "+n+".");
  const expectedSubjects=PAPER_BLUEPRINT.flatMap(([subject,count])=>Array(count).fill(subject));
  paper.forEach((q,index)=>{
    if(q.questionNo!==index+1) throw new Error("Mock Test "+n+" has an incorrect question sequence at position "+(index+1)+".");
    if(q.subject!==expectedSubjects[index]) throw new Error("Mock Test "+n+" has an incorrect subject sequence at question "+(index+1)+".");
  });
  return paper;
}
function renderHome(){
  clearInterval(timer); active=null;
  const h=getHistory(), done=new Set(h.map(x=>x.paper));
  $('#app').innerHTML=`<header><div class="brand">MPSC <b>GROUP C</b><small>PRELIMS • MOCK TEST SERIES 2026–27</small></div><span class="badge">मराठी + English</span></header>
  <section class="hero"><div><p class="eyebrow">PREPARE • PRACTISE • IMPROVE</p><h1>Your MPSC Group C<br><em>Online Test Portal</em></h1><p>Timed mock tests, instant scoring, explanations and performance tracking.</p><button class="primary" id="startFirst">Start a mock test →</button></div><div class="hero-stat"><strong>100</strong><span>Mock test slots</span><strong>${QUESTION_POOL_COUNT}</strong><span>Distinct source questions</span></div></section>
  <section class="subject-practice"><div class="subject-practice-copy"><span class="pill">SUBJECT-WISE PRACTICE</span><h2>History Practice</h2><p>Marathi topic-wise MCQs with instant answers and explanations.</p><small>Imported questions are drafts and still require editorial/factual review.</small></div><div class="subject-practice-action"><strong>${HISTORY_BANK.length.toLocaleString("en-IN") || "—"}</strong><span>History questions</span><button class="primary" id="startHistory" ${HISTORY_BANK.length ? "" : "disabled"}>Open History Practice →</button></div></section>
  <section class="subject-practice"><div class="subject-practice-copy"><span class="pill">SUBJECT-WISE PRACTICE</span><h2>Geography Practice</h2><p>2,000 Marathi questions with topic filters and instant explanations.</p><small>Uploaded transcript-based draft; factual and language validation is still required.</small></div><div class="subject-practice-action"><strong>${GEOGRAPHY_BANK.length.toLocaleString("en-IN") || "—"}</strong><span>Geography questions · ${new Set(GEOGRAPHY_BANK.map(q=>q.topic)).size || 19} topics</span><button class="primary" id="startGeography" ${GEOGRAPHY_BANK.length ? "" : "disabled"}>Open Geography Practice →</button></div></section>
  <section class="stats"><div><b>${done.size}</b><span>Tests completed</span></div><div><b>${h.length?Math.round(h.reduce((a,x)=>a+x.score,0)/h.length*10)/10:0}</b><span>Average score</span></div><div><b>${h.length?Math.max(...h.map(x=>x.score)):0}</b><span>Best score</span></div><div><b>${h.length?Math.round(h.reduce((a,x)=>a+x.accuracy,0)/h.length):0}%</b><span>Average accuracy</span></div></section>
  <div class="section-title"><div><h2>Mock test library</h2><p>Fixed subject blocks · 100 questions · 60-minute timer.</p></div><span class="muted">${done.size}/100 completed</span></div>
  <div class="grid">${Array.from({length:TEST_COUNT},(_,i)=>{let n=i+1,level=n<=20?'Foundation':n<=40?'Moderate':n<=60?'Advanced':n<=80?'PYQ pattern':'Full simulation';return `<article class="test-card"><div class="card-top"><span class="pill">${level}</span><span class="check">${done.has(n)?'✓ Completed':'100 Questions'}</span></div><h3>Mock Test ${String(n).padStart(2,'0')}</h3><p>100 marks · 60 minutes · −0.25 negative marking</p><button class="outline" data-paper="${n}">${done.has(n)?'Retake test':'Start test'} →</button></article>`}).join('')}</div>
  <section class="history"><h2>Recent attempts</h2>${h.length?h.slice(-5).reverse().map(x=>`<div class="history-row"><span>Mock Test ${String(x.paper).padStart(2,'0')}</span><b>${x.score}/100</b><span>${x.correct} correct · ${x.wrong} wrong</span><span>${x.date}</span></div>`).join(''):'<p class="muted">Your completed tests will appear here. Results are saved on this device.</p>'}</section>
  <footer>Practice resource only • Not affiliated with MPSC • Verify the latest official syllabus and exam pattern.</footer>`;
  $('#startFirst').onclick=()=>startTest(1);
  const historyButton=$('#startHistory'); if(historyButton) historyButton.onclick=()=>startHistoryPractice();
  const geographyButton=$('#startGeography'); if(geographyButton) geographyButton.onclick=()=>startGeographyPractice();
  document.querySelectorAll('[data-paper]').forEach(b=>b.onclick=()=>startTest(+b.dataset.paper));
}
function startTest(n){
  active=n; answers={};marked=new Set();current=0;submitted=false;remaining=DURATION;
  const paper=getPaper(n); activePaper=paper;
  $('#app').innerHTML=`<header><div class="brand">MPSC <b>GROUP C</b><small>MOCK TEST ${String(n).padStart(2,'0')}</small></div><div class="timer" id="timer">60:00</div><button class="link" id="exit">Exit test</button></header>
  <div class="exam-layout"><main class="question-panel"><div class="q-meta"><span id="qcount">Question 1 of 100</span><span class="pill" id="subject"></span></div><div class="progress"><i id="progress"></i></div><h2 id="q-en"></h2><h3 id="q-mr"></h3><div id="options" class="options"></div><div class="q-actions"><button class="soft" id="clear">Clear response</button><button class="mark" id="mark">☆ Mark for review</button><span class="spacer"></span><button class="soft" id="prev">← Previous</button><button class="primary" id="next">Save & Next →</button></div></main>
  <aside class="palette"><h3>Question palette</h3><div class="legend"><span class="answered"></span> Answered <span class="review"></span> Review</div><div class="numbers" id="numbers"></div><div class="palette-bottom"><p id="counts"></p><button class="submit" id="submit">Submit test</button></div></aside></div>`;
  $('#exit').onclick=()=>{if(confirm('Exit this test? Your current attempt will be lost.'))renderHome()};
  $('#prev').onclick=()=>{if(current>0){current--;renderQuestion()}};
  $('#next').onclick=()=>{if(current<99){current++;renderQuestion()}else{renderQuestion()}};
  $('#clear').onclick=()=>{delete answers[current];renderQuestion()};
  $('#mark').onclick=()=>{marked.has(current)?marked.delete(current):marked.add(current);renderQuestion()};
  $('#submit').onclick=()=>finishTest();
  renderQuestion(); timer=setInterval(()=>{remaining--;$('#timer').textContent=formatTime(remaining);if(remaining<=0)finishTest(true)},1000);
}
function formatTime(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function renderQuestion(){
 const q=activePaper[current];
 $('#qcount').textContent=`Question ${current+1} of 100`;$('#subject').textContent=q.subject;
 $('#q-en').textContent=q.en;$('#q-mr').textContent=q.mr;
 $('#progress').style.width=((current+1))+'%';
 $('#options').innerHTML=q.options.map((o,i)=>`<button class="option ${answers[current]===i?'selected':''}" data-opt="${i}"><span>${'ABCD'[i]}</span>${esc(o)}</button>`).join('');
 document.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>{answers[current]=+b.dataset.opt;renderQuestion()});
 $('#mark').textContent=marked.has(current)?'★ Marked for review':'☆ Mark for review';
 $('#prev').disabled=current===0;$('#next').textContent=current===99?'Review answers':'Save & Next →';
 $('#numbers').innerHTML=Array.from({length:100},(_,i)=>`<button class="num ${answers[i]!==undefined?'done':''} ${marked.has(i)?'flag':''} ${i===current?'active':''}" data-go="${i}">${i+1}</button>`).join('');
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{current=+b.dataset.go;renderQuestion()});
 $('#counts').textContent=`Answered ${Object.keys(answers).length}/100 · Marked ${marked.size}`;
}
function finishTest(auto=false){
 if(submitted)return;
 if(!auto&&!confirm('Submit your test now?'))return;
 submitted=true;clearInterval(timer);
 const paper=activePaper;let correct=0,wrong=0,blank=0;
 paper.forEach((q,i)=>{if(answers[i]===undefined)blank++;else if(answers[i]===q.answer)correct++;else wrong++});
 const score=correct-wrong*NEGATIVE,attempted=correct+wrong,accuracy=attempted?Math.round(correct/attempted*100):0;
 const result={paper:active,correct,wrong,blank,score:Math.round(score*100)/100,accuracy,date:new Date().toLocaleString()};
 const h=getHistory();h.push(result);saveHistory(h);
 renderResult(result,paper,auto);
}
function renderResult(r,paper,auto){
 $('#app').innerHTML=`<header><div class="brand">MPSC <b>GROUP C</b><small>TEST RESULT</small></div><button class="link" id="home">Dashboard</button></header>
 <section class="result-hero"><p class="eyebrow">${auto?'TIME EXPIRED':'TEST SUBMITTED'}</p><h1>Your result</h1><div class="score">${r.score}<small>/ 100</small></div><p>Mock Test ${String(r.paper).padStart(2,'0')} · ${r.date}</p></section>
 <section class="stats result-stats"><div><b>${r.correct}</b><span>Correct</span></div><div><b>${r.wrong}</b><span>Incorrect</span></div><div><b>${r.blank}</b><span>Unattempted</span></div><div><b>${r.accuracy}%</b><span>Accuracy</span></div></section>
 <div class="review-head"><h2>Answer review & explanations</h2><button class="primary" id="again">Retake test</button></div><div class="review-list">${paper.map((q,i)=>`<article class="review-item"><div class="review-q"><b>Q${i+1}. ${esc(q.en)}</b><p>${esc(q.mr)}</p></div><p class="${answers[i]===q.answer?'good':'bad'}">Your answer: ${answers[i]===undefined?'Not attempted':esc(q.options[answers[i]])}</p><p class="good">Correct answer: ${esc(q.options[q.answer])}</p><p>${esc(q.explanationEn)}</p><p class="muted">${esc(q.explanationMr)}</p></article>`).join('')}</div>`;
 $('#home').onclick=renderHome;$('#again').onclick=()=>startTest(r.paper);
}

function startHistoryPractice(topic=""){
  historyTopic=topic;
  historyIndex=0;
  historyQuestions=[];
  historyAnswers={};
  renderHistoryPractice();
}
function renderHistoryPractice(){
  const topics=[...new Set(HISTORY_BANK.map(q=>q.topic))].sort((a,b)=>a.localeCompare(b,"mr"));
  const pool=historyTopic?HISTORY_BANK.filter(q=>q.topic===historyTopic):HISTORY_BANK;
  if(!pool.length){
    $('#app').innerHTML='<section class="history"><h2>History practice unavailable</h2><p class="muted">The History question file could not be loaded. Return to the dashboard and try again.</p><button class="primary" id="historyHome">Dashboard</button></section>';
    $('#historyHome').onclick=renderHome;
    return;
  }
  if(historyIndex>=pool.length) historyIndex=pool.length-1;
  const q=pool[historyIndex];
  const selected=historyAnswers[q.sourceQuestionNo];
  const correctIndex="ABCD".indexOf(q.correctOption);
  const answered=Object.keys(historyAnswers).length;
  const optionHtml=q.optionsMr.map((option,i)=>{
    const state=selected===undefined?"":i===correctIndex?"correct":i===selected?"incorrect":"";
    return `<button class="history-option ${state}" data-history-opt="${i}" ${selected!==undefined?"disabled":""}><span>${"ABCD"[i]}</span>${esc(option)}</button>`;
  }).join("");
  const feedback=selected===undefined
    ? '<p class="muted answer-hint">पर्याय निवडा. उत्तर निवडल्यानंतर स्पष्टीकरण दिसेल.</p>'
    : `<div class="history-feedback ${selected===correctIndex?"is-correct":"is-incorrect"}"><strong>${selected===correctIndex?"बरोबर उत्तर!":"चुकीचे उत्तर."} योग्य उत्तर: ${esc(q.correctAnswerMr)}</strong><p>${esc(q.explanationMr)}</p></div>`;
  $('#app').innerHTML=`
    <header><div class="brand">MPSC <b>GROUP C</b><small>HISTORY PRACTICE</small></div><button class="link" id="historyHome">← Dashboard</button></header>
    <main class="practice-wrap">
      <section class="practice-heading"><div><p class="eyebrow">SUBJECT-WISE PRACTICE</p><h1>इतिहास सराव प्रश्नसंच</h1><p class="muted">विषयानुसार प्रश्न सोडवा आणि प्रत्येक उत्तराचे स्पष्टीकरण पाहा.</p></div><div class="practice-total"><strong>${HISTORY_BANK.length.toLocaleString("en-IN")}</strong><span>एकूण प्रश्न</span></div></section>
      <section class="practice-toolbar"><label for="historyTopic">विषय / Topic</label><select id="historyTopic"><option value="">सर्व विषय</option>${topics.map(t=>`<option value="${esc(t)}" ${historyTopic===t?"selected":""}>${esc(t)}</option>`).join("")}</select><span class="muted">${pool.length.toLocaleString("en-IN")} प्रश्न</span></section>
      <section class="history-practice-card">
        <div class="practice-q-meta"><span>प्रश्न ${(historyIndex+1).toLocaleString("en-IN")} / ${pool.length.toLocaleString("en-IN")}</span><span class="topic-pill">${esc(q.topic)}</span><span class="review-pill">पडताळणी बाकी</span></div>
        <div class="practice-progress"><i style="width:${((historyIndex+1)/pool.length*100).toFixed(2)}%"></i></div>
        <h2 class="history-question-text">${esc(q.questionMr)}</h2>
        <div class="history-practice-options">${optionHtml}</div>
        ${feedback}
        <div class="practice-navigation"><button class="soft" id="historyPrev" ${historyIndex===0?"disabled":""}>← मागील प्रश्न</button><span>${answered.toLocaleString("en-IN")} उत्तरे दिली</span><button class="primary" id="historyNext" ${historyIndex===pool.length-1?"disabled":""}>पुढील प्रश्न →</button></div>
      </section>
      <p class="practice-disclaimer">टीप: हे प्रश्नसंच स्रोतावरून तयार केलेले पुनरावलोकनासाठीचे प्रश्न आहेत. सर्व प्रश्न संपादकीय व तथ्य-पडताळणीच्या अधीन आहेत.</p>
    </main>`;
  $('#historyHome').onclick=renderHome;
  $('#historyTopic').onchange=e=>{historyTopic=e.target.value;historyIndex=0;renderHistoryPractice()};
  document.querySelectorAll('[data-history-opt]').forEach(b=>b.onclick=()=>{
    if(historyAnswers[q.sourceQuestionNo]===undefined){
      historyAnswers[q.sourceQuestionNo]=+b.dataset.historyOpt;
      renderHistoryPractice();
    }
  });
  $('#historyPrev').onclick=()=>{if(historyIndex>0){historyIndex--;renderHistoryPractice()}};
  $('#historyNext').onclick=()=>{if(historyIndex<pool.length-1){historyIndex++;renderHistoryPractice()}};
}


function startGeographyPractice(topic=""){
  geographyTopic=topic;
  geographyIndex=0;
  geographyAnswers={};
  renderGeographyPractice();
}
function renderGeographyPractice(){
  const topics=[...new Set(GEOGRAPHY_BANK.map(q=>q.topic))].sort((a,b)=>a.localeCompare(b,"mr"));
  const pool=geographyTopic?GEOGRAPHY_BANK.filter(q=>q.topic===geographyTopic):GEOGRAPHY_BANK;
  if(!pool.length){
    $('#app').innerHTML='<section class="history"><h2>Geography practice unavailable</h2><p class="muted">The Geography question file could not be loaded. Return to the dashboard and try again.</p><button class="primary" id="geographyHome">Dashboard</button></section>';
    $('#geographyHome').onclick=renderHome;
    return;
  }
  if(geographyIndex>=pool.length) geographyIndex=pool.length-1;
  const q=pool[geographyIndex];
  const selected=geographyAnswers[q.sourceQuestionNo];
  const correctIndex="ABCD".indexOf(q.correctOption);
  const answered=Object.keys(geographyAnswers).length;
  const optionHtml=q.optionsMr.map((option,i)=>{
    const state=selected===undefined?"":i===correctIndex?"correct":i===selected?"incorrect":"";
    return `<button class="history-option ${state}" data-geography-opt="${i}" ${selected!==undefined?"disabled":""}><span>${"ABCD"[i]}</span>${esc(option)}</button>`;
  }).join("");
  const feedback=selected===undefined
    ? '<p class="muted answer-hint">पर्याय निवडा. उत्तर निवडल्यानंतर स्पष्टीकरण दिसेल.</p>'
    : `<div class="history-feedback ${selected===correctIndex?"is-correct":"is-incorrect"}"><strong>${selected===correctIndex?"बरोबर उत्तर!":"चुकीचे उत्तर."} योग्य उत्तर: ${esc(q.correctAnswerMr)}</strong><p>${esc(q.explanationMr)}</p></div>`;
  $('#app').innerHTML=`
    <header><div class="brand">MPSC <b>GROUP C</b><small>GEOGRAPHY PRACTICE</small></div><button class="link" id="geographyHome">← Dashboard</button></header>
    <main class="practice-wrap">
      <section class="practice-heading"><div><p class="eyebrow">SUBJECT-WISE PRACTICE</p><h1>भूगोल सराव प्रश्नसंच</h1><p class="muted">विषयानुसार प्रश्न सोडवा आणि प्रत्येक उत्तराचे स्पष्टीकरण पाहा.</p></div><div class="practice-total"><strong>${GEOGRAPHY_BANK.length.toLocaleString("en-IN")}</strong><span>एकूण प्रश्न</span></div></section>
      <section class="practice-toolbar"><label for="geographyTopic">विषय / Topic</label><select id="geographyTopic"><option value="">सर्व विषय</option>${topics.map(t=>`<option value="${esc(t)}" ${geographyTopic===t?"selected":""}>${esc(t)}</option>`).join("")}</select><span class="muted">${pool.length.toLocaleString("en-IN")} प्रश्न</span></section>
      <section class="history-practice-card">
        <div class="practice-q-meta"><span>प्रश्न ${(geographyIndex+1).toLocaleString("en-IN")} / ${pool.length.toLocaleString("en-IN")}</span><span class="topic-pill">${esc(q.section || q.topic)}</span><span class="review-pill">पडताळणी बाकी</span></div>
        <div class="practice-progress"><i style="width:${((geographyIndex+1)/pool.length*100).toFixed(2)}%"></i></div>
        <h2 class="history-question-text">${esc(q.questionMr)}</h2>
        <div class="history-practice-options">${optionHtml}</div>
        ${feedback}
        <div class="practice-navigation"><button class="soft" id="geographyPrev" ${geographyIndex===0?"disabled":""}>← मागील प्रश्न</button><span>${answered.toLocaleString("en-IN")} उत्तरे दिली</span><button class="primary" id="geographyNext" ${geographyIndex===pool.length-1?"disabled":""}>पुढील प्रश्न →</button></div>
      </section>
      <p class="practice-disclaimer">टीप: हे प्रश्न अपलोड केलेल्या व्याख्यानाच्या आधारे तयार केलेले पुनरावलोकनासाठीचे प्रश्न आहेत. सर्व प्रश्न संपादकीय व तथ्य-पडताळणीच्या अधीन आहेत.</p>
    </main>`;
  $('#geographyHome').onclick=renderHome;
  $('#geographyTopic').onchange=e=>{geographyTopic=e.target.value;geographyIndex=0;renderGeographyPractice()};
  document.querySelectorAll('[data-geography-opt]').forEach(b=>b.onclick=()=>{
    if(geographyAnswers[q.sourceQuestionNo]===undefined){
      geographyAnswers[q.sourceQuestionNo]=+b.dataset.geographyOpt;
      renderGeographyPractice();
    }
  });
  $('#geographyPrev').onclick=()=>{if(geographyIndex>0){geographyIndex--;renderGeographyPractice()}};
  $('#geographyNext').onclick=()=>{if(geographyIndex<pool.length-1){geographyIndex++;renderGeographyPractice()}};
}

async function loadQuestionBank(){
  try{
    const manifestResponse=await fetch("./question-bank/questions.json");
    if(!manifestResponse.ok) throw new Error("Could not load question-bank/questions.json ("+manifestResponse.status+").");
    const manifest=await manifestResponse.json();
    if(manifest.format!=="mpsc-group-c-question-bank-index"||!Array.isArray(manifest.batches)){
      throw new Error("Question-bank manifest has an unsupported format.");
    }
    const batches=await Promise.all(manifest.batches.map(async batch=>{
      const response=await fetch("./question-bank/"+batch.file);
      if(!response.ok) throw new Error("Could not load "+batch.file+" ("+response.status+").");
      const rows=await response.json();
      if(!Array.isArray(rows)||rows.length!==batch.records) throw new Error("Invalid question batch: "+batch.file);
      return rows;
    }));
    BANK=batches.flat().sort((a,b)=>a.id-b.id);
    if(BANK.length!==10000||BANK.length!==manifest.totalRecords) throw new Error("Expected 10,000 paper-question records; loaded "+BANK.length+".");

    // Reuse between different papers is permitted. Uniqueness is enforced within each paper only.
    const normalize=value=>String(value??"").normalize("NFKC").toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
    const ids=new Set(), sourcePairs=new Set(), papers=new Map();
    for(const q of BANK){
      if(!q||!Number.isInteger(q.id)||ids.has(q.id)) throw new Error("Missing or duplicate global question ID detected.");
      ids.add(q.id);
      if(!Number.isInteger(q.paperNo)||q.paperNo<1||q.paperNo>100||!Number.isInteger(q.questionNo)||q.questionNo<1||q.questionNo>100){
        throw new Error("Invalid paper/question number in question ID "+q.id+".");
      }
      if(!q.subject||!q.topic||!q.difficulty||!q.conceptKey||!q.en||!q.mr||!q.explanationEn||!q.explanationMr){
        throw new Error("Missing question content in question ID "+q.id+".");
      }
      if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!String(x??"").trim())){
        throw new Error("Question ID "+q.id+" must contain four English options.");
      }
      if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3) throw new Error("Invalid correct answer index in question ID "+q.id+".");
      if(q.optionsMr!==undefined&&(!Array.isArray(q.optionsMr)||q.optionsMr.length!==4||q.optionsMr.some(x=>!String(x??"").trim()))){
        throw new Error("If Marathi options are supplied, all four must be present in question ID "+q.id+".");
      }
      if(q.subject==="Current Affairs"&&(!q.source||!q.asOfDate)){
        throw new Error("Current Affairs question ID "+q.id+" must include a source and as-of date.");
      }
      if(!papers.has(q.paperNo)) papers.set(q.paperNo,[]);
      papers.get(q.paperNo).push(q);
      sourcePairs.add(normalize(q.en)+"|"+normalize(q.mr));
    }

    const expectedSubjects=PAPER_BLUEPRINT.flatMap(([subject,count])=>Array(count).fill(subject));
    for(let paperNo=1;paperNo<=TEST_COUNT;paperNo++){
      const rows=(papers.get(paperNo)||[]).sort((a,b)=>a.questionNo-b.questionNo);
      if(rows.length!==Q_PER_TEST) throw new Error("Mock Test "+paperNo+" must contain 100 questions; found "+rows.length+".");
      const concepts=new Set(), english=new Set(), marathi=new Set(), questionNumbers=new Set();
      rows.forEach((q,index)=>{
        if(questionNumbers.has(q.questionNo)) throw new Error("Duplicate question number in Mock Test "+paperNo+".");
        questionNumbers.add(q.questionNo);
        if(q.questionNo!==index+1) throw new Error("Mock Test "+paperNo+" has a missing question number.");
        if(q.subject!==expectedSubjects[index]) throw new Error("Mock Test "+paperNo+" does not follow the configured subject sequence at question "+(index+1)+".");
        for(const [label,set,value] of [
          ["concept",concepts,normalize(q.conceptKey)],
          ["English question",english,normalize(q.en)],
          ["Marathi question",marathi,normalize(q.mr)]
        ]){
          if(!value||set.has(value)) throw new Error("Duplicate or missing "+label+" within Mock Test "+paperNo+".");
          set.add(value);
        }
      });
    }
    QUESTION_POOL_COUNT=sourcePairs.size;
    if(Number.isInteger(manifest.distinctSourceQuestions)&&manifest.distinctSourceQuestions!==QUESTION_POOL_COUNT){
      throw new Error("Manifest says "+manifest.distinctSourceQuestions+" distinct source questions, but "+QUESTION_POOL_COUNT+" were found.");
    }
    try{
      const historyResponse=await fetch("./question-bank/history-practice.json");
      if(!historyResponse.ok) throw new Error("Could not load History practice questions ("+historyResponse.status+").");
      const historyRows=await historyResponse.json();
      if(!Array.isArray(historyRows)||historyRows.length!==2000) throw new Error("History practice bank must contain 2,000 questions.");
      const historyIds=new Set();
      for(const q of historyRows){
        const correctIndex="ABCD".indexOf(q.correctOption);
        if(!q||q.subject!=="History"||!Number.isInteger(q.sourceQuestionNo)||historyIds.has(q.sourceQuestionNo)||
          !q.topic||!q.questionMr||!Array.isArray(q.optionsMr)||q.optionsMr.length!==4||
          correctIndex<0||q.optionsMr[correctIndex]!==q.correctAnswerMr||!q.explanationMr){
          throw new Error("Invalid or duplicate History question record.");
        }
        historyIds.add(q.sourceQuestionNo);
      }
      HISTORY_BANK=historyRows.sort((a,b)=>a.sourceQuestionNo-b.sourceQuestionNo);
    }catch(historyError){
      HISTORY_BANK=[];
      console.warn("History practice bank not loaded:",historyError);
    }
    try{
      const geographyManifestResponse=await fetch("./question-bank/geography-practice.json");
      if(!geographyManifestResponse.ok) throw new Error("Could not load Geography practice manifest ("+geographyManifestResponse.status+").");
      const geographyManifest=await geographyManifestResponse.json();
      if(geographyManifest.format!=="mpsc-geography-practice-index"||geographyManifest.totalRecords!==2000||!Array.isArray(geographyManifest.batches)){
        throw new Error("Invalid Geography practice manifest.");
      }
      const geographyBatches=await Promise.all(geographyManifest.batches.map(async batch=>{
        const response=await fetch("./question-bank/"+batch.file);
        if(!response.ok) throw new Error("Could not load "+batch.file+" ("+response.status+").");
        const rows=await response.json();
        if(!Array.isArray(rows)||rows.length!==batch.records) throw new Error("Invalid Geography batch: "+batch.file);
        return rows;
      }));
      const geographyRows=geographyBatches.flat().sort((a,b)=>a.sourceQuestionNo-b.sourceQuestionNo);
      if(geographyRows.length!==2000) throw new Error("Geography practice bank must contain 2,000 questions.");
      const geographyIds=new Set(), geographyConcepts=new Set(), geographyStems=new Set();
      const normalizeGeography=value=>String(value??"").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
      for(const q of geographyRows){
        const correctIndex="ABCD".indexOf(q.correctOption);
        const concept=normalizeGeography(q.conceptKey), stem=normalizeGeography(q.questionMr);
        if(!q||q.subject!=="Geography"||!Number.isInteger(q.sourceQuestionNo)||geographyIds.has(q.sourceQuestionNo)||
          !q.section||!q.topic||!concept||geographyConcepts.has(concept)||!stem||geographyStems.has(stem)||
          !Array.isArray(q.optionsMr)||q.optionsMr.length!==4||q.optionsMr.some(x=>!String(x??"").trim())||
          correctIndex<0||q.optionsMr[correctIndex]!==q.correctAnswerMr||!q.explanationMr){
          throw new Error("Invalid or duplicate Geography question record.");
        }
        geographyIds.add(q.sourceQuestionNo); geographyConcepts.add(concept); geographyStems.add(stem);
      }
      GEOGRAPHY_BANK=geographyRows;
    }catch(geographyError){
      GEOGRAPHY_BANK=[];
      console.warn("Geography practice bank not loaded:",geographyError);
    }
    renderHome();
  }catch(error){
    console.error(error);
    document.querySelector("#app").innerHTML='<section class="history"><h2>Question bank could not be loaded</h2><p class="muted">'+esc(error.message)+'</p><p class="muted">Open the portal through GitHub Pages or a local web server, not by opening index.html as a file.</p></section>';
  }
}
loadQuestionBank();
