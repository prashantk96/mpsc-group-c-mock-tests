
let BANK = [];
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
  return paper;
}
function renderHome(){
  clearInterval(timer); active=null;
  const h=getHistory(), done=new Set(h.map(x=>x.paper));
  $('#app').innerHTML=`<header><div class="brand">MPSC <b>GROUP C</b><small>PRELIMS • MOCK TEST SERIES 2026–27</small></div><span class="badge">मराठी + English</span></header>
  <section class="hero"><div><p class="eyebrow">PREPARE • PRACTISE • IMPROVE</p><h1>Your MPSC Group C<br><em>Online Test Portal</em></h1><p>Timed mock tests, instant scoring, explanations and performance tracking.</p><button class="primary" id="startFirst">Start a mock test →</button></div><div class="hero-stat"><strong>100</strong><span>Mock test slots</span><strong>${BANK.length}</strong><span>Question bank entries</span></div></section>
  <section class="stats"><div><b>${done.size}</b><span>Tests completed</span></div><div><b>${h.length?Math.round(h.reduce((a,x)=>a+x.score,0)/h.length*10)/10:0}</b><span>Average score</span></div><div><b>${h.length?Math.max(...h.map(x=>x.score)):0}</b><span>Best score</span></div><div><b>${h.length?Math.round(h.reduce((a,x)=>a+x.accuracy,0)/h.length):0}%</b><span>Average accuracy</span></div></section>
  <div class="section-title"><div><h2>Mock test library</h2><p>Fixed subject blocks · 100 questions · 60-minute timer.</p></div><span class="muted">${done.size}/100 completed</span></div>
  <div class="grid">${Array.from({length:TEST_COUNT},(_,i)=>{let n=i+1,level=n<=20?'Foundation':n<=40?'Moderate':n<=60?'Advanced':n<=80?'PYQ pattern':'Full simulation';return `<article class="test-card"><div class="card-top"><span class="pill">${level}</span><span class="check">${done.has(n)?'✓ Completed':'100 Questions'}</span></div><h3>Mock Test ${String(n).padStart(2,'0')}</h3><p>100 marks · 60 minutes · −0.25 negative marking</p><button class="outline" data-paper="${n}">${done.has(n)?'Retake test':'Start test'} →</button></article>`}).join('')}</div>
  <section class="history"><h2>Recent attempts</h2>${h.length?h.slice(-5).reverse().map(x=>`<div class="history-row"><span>Mock Test ${String(x.paper).padStart(2,'0')}</span><b>${x.score}/100</b><span>${x.correct} correct · ${x.wrong} wrong</span><span>${x.date}</span></div>`).join(''):'<p class="muted">Your completed tests will appear here. Results are saved on this device.</p>'}</section>
  <footer>Practice resource only • Not affiliated with MPSC • Verify the latest official syllabus and exam pattern.</footer>`;
  $('#startFirst').onclick=()=>startTest(1);
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
    if(BANK.length!==10000||BANK.length!==manifest.totalRecords) throw new Error("Expected 10,000 question records; loaded "+BANK.length+".");
    if(manifest.distinctSourceQuestions!==10000) throw new Error("This question bank contains only "+manifest.distinctSourceQuestions+" distinct source questions. The portal requires 10,000 globally unique questions before the papers can be used.");
    const concepts=new Set(), english=new Set(), marathi=new Set();
    for(const q of BANK){
      const concept=String(q.conceptKey||"").normalize("NFKC").toLocaleLowerCase().replace(/[^\\p{L}\\p{N}]+/gu," ").trim();
      const en=String(q.en||"").normalize("NFKC").toLocaleLowerCase().replace(/[^\\p{L}\\p{N}]+/gu," ").trim();
      const mr=String(q.mr||"").normalize("NFKC").toLocaleLowerCase().replace(/[^\\p{L}\\p{N}]+/gu," ").trim();
      if(!concept||!en||!mr||concepts.has(concept)||english.has(en)||marathi.has(mr)) throw new Error("Duplicate or missing question/concept detected. All 10,000 questions must be globally unique.");
      if(!Array.isArray(q.optionsMr)||q.optionsMr.length!==4||q.optionsMr.some(x=>!String(x||"").trim())) throw new Error("Every question must include four Marathi answer options. Missing in question ID "+q.id+".");
      concepts.add(concept);english.add(en);marathi.add(mr);
    }
    renderHome();
  }catch(error){
    console.error(error);
    document.querySelector("#app").innerHTML='<section class="history"><h2>Question bank could not be loaded</h2><p class="muted">'+esc(error.message)+'</p><p class="muted">Open the portal through GitHub Pages or a local web server, not by opening index.html as a file.</p></section>';
  }
}
loadQuestionBank();
