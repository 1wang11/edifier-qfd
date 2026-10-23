'use strict';
(() => {
 const D=window.QFD_DATA,$=id=>document.getElementById(id);
 const pct=n=>Number(n).toFixed(2)+'%',num=n=>Number(n).toFixed(2),simple=n=>Number.isInteger(n)?String(n):String(n);
 const symbols={0:'—',1:'△',5:'○',9:'●'},relations={0:'未设关系',1:'弱关系',5:'中关系',9:'强关系'};
 let need=1,tech=1,roofPair=[1,2],planningVisible=false;const visibleBrands=new Set(D.brands.map(b=>b.key));let targetVisible=false;
 const sortedDemands=D.demands.slice().sort((a,b)=>b.weight-a.weight);
 const sortedTechs=D.techs.slice().sort((a,b)=>b.weight-a.weight);
 $('brand-sources').innerHTML=D.brands.map(b=>`<div class="source-brand"><div><strong>${b.name}</strong><small>${b.comments.toLocaleString()}评 / ${b.questions.toLocaleString()}问</small></div><div class="mini-track"><span style="width:${(b.comments+b.questions)/7247*100}%;background:${b.color}"></span></div></div>`).join('');
 $('demand-ranking').innerHTML=sortedDemands.map(d=>`<button type="button" class="demand-bar" data-demand="${d.id}" aria-pressed="${d.id===need}" aria-label="${d.name}，相对修正权重${pct(d.weight)}"><span>${d.name}</span><span class="demand-track"><span style="width:${d.weight/25*100}%"></span></span><strong>${pct(d.weight)}</strong></button>`).join('');
 $('demand-table').innerHTML=`<table><caption>需求权重测算</caption><thead><tr><th scope="col">用户需求</th><th>重要度</th><th>当前满意度</th><th>目标值</th><th>改进率</th><th>卖点系数</th><th>修正权重</th><th>相对权重</th></tr></thead><tbody>${D.demands.map(d=>`<tr><th scope="row">${d.name}</th><td>${d.importance}</td><td>${d.edifier}</td><td>${d.target}</td><td>${simple(d.improvement)}</td><td>${simple(d.selling)}</td><td>${simple(d.corrected)}</td><td>${pct(d.weight)}</td></tr>`).join('')}</tbody></table>`;
 $('benchmark-table').innerHTML=`<table><caption>需求满意度，1分最低、5分最高</caption><thead><tr><th>用户需求</th><th>漫步者</th><th>倍思</th><th>绿联</th><th>改进目标</th></tr></thead><tbody>${D.demands.map(d=>`<tr><th scope="row">${d.name}</th><td>${d.edifier}</td><td>${d.baseus}</td><td>${d.ugreen}</td><td>${d.target}</td></tr>`).join('')}</tbody></table>`;
 $('brand-toggles').innerHTML=D.brands.map(b=>`<button type="button" data-brand="${b.key}" aria-pressed="true"><i style="background:${b.color}"></i>${b.name}</button>`).join('');
 $('radar-needs').innerHTML=D.demands.map(d=>`<button type="button" data-radar-need="${d.id}" aria-pressed="${d.id===need}">${d.name}</button>`).join('');
 function demandReading(d){
  if(d.id===1)return '重要度4分、改进率1.5、卖点系数1.2，得到修正权重7.2，归一化后位居首位。';
  if(d.edifier<d.target)return `当前满意度${d.edifier}分，目标${d.target}分；把重要程度与改进空间一起纳入排序。`;
  return `当前满意度${d.edifier}分，目标${d.target}分；修正权重同时考虑需求重要度和卖点系数。`;
 }
 function updateVoice(){
  const d=D.demands[need];$('need-name').textContent=d.name;$('need-weight').innerHTML=`${num(d.weight)}<span>%</span>`;
  $('need-factors').innerHTML=[['重要度',d.importance],['改进率',simple(d.improvement)],['卖点系数',simple(d.selling)],['修正权重',simple(d.corrected)]].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
  $('need-reading').textContent=demandReading(d);
  document.querySelectorAll('[data-demand]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.demand)===need)));
 }
 function updateComparison(){
  const d=D.demands[need];$('compare-need').textContent=d.name;
  $('compare-scores').innerHTML=[...D.brands.map(b=>[b.name,d[b.key]]),['目标',d.target]].map(([name,score])=>`<div><strong>${score}<small>分</small></strong><span>${name}</span></div>`).join('');
  let sentence;
  if(d.edifier<d.baseus)sentence=`漫步者为${d.edifier}分，低于倍思的${d.baseus}分；目标设为${d.target}分，形成可识别的改进空间。`;
  else if(d.edifier>=d.baseus&&d.edifier>=d.ugreen)sentence=`漫步者为${d.edifier}分，在本次三品牌评价中表现较好；目标为${d.target}分。`;
  else sentence=`漫步者为${d.edifier}分，倍思为${d.baseus}分，绿联为${d.ugreen}分；改进目标为${d.target}分。`;
  $('compare-reading').textContent=sentence;
  $('radar-needs').querySelectorAll('[data-radar-need]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.radarNeed)===need)));
 }
 function radarPoint(i,r){const a=(-90+i*45)*Math.PI/180;return [260+Math.cos(a)*r,238+Math.sin(a)*r];}
 function points(scores){return scores.map((v,i)=>radarPoint(i,v/5*155).map(n=>n.toFixed(2)).join(',')).join(' ');}
 function renderRadar(){
  let inner='';
  for(let ring=1;ring<=5;ring++)inner+=`<polygon points="${points(Array(8).fill(ring))}" fill="none" stroke="#dbd1c2" stroke-width="${ring===5?1.2:.8}"/><text x="268" y="${238-ring/5*155-4}" font-size="9" fill="#b4a493">${ring}</text>`;
  D.demands.forEach((d,i)=>{
   const [x,y]=radarPoint(i,155),[lx,ly]=radarPoint(i,190),anchor=Math.abs(lx-260)<30?'middle':lx>260?'start':'end';
   inner+=`<path d="M260 238L${x} ${y}" stroke="${i===need?'#a385bf':'#ded4c6'}" stroke-width="${i===need?1.5:.8}"/><text data-radar-need="${i}" class="radar-axis-label" x="${lx}" y="${ly+4}" text-anchor="${anchor}" font-size="13" fill="${i===need?'#593685':'#786d65'}" font-weight="${i===need?700:400}">${d.name}</text>`;
  });
  const series=D.brands.filter(b=>visibleBrands.has(b.key));if(targetVisible)series.push({key:'target',name:'改进目标',color:'#38313c'});
  series.forEach(b=>{
   const scores=D.demands.map(d=>d[b.key]);
   inner+=`<polygon points="${points(scores)}" fill="${b.key==='target'?'none':b.color}" fill-opacity=".055" stroke="${b.color}" stroke-width="${b.key==='edifier'?2.8:2}" ${b.key==='target'?'stroke-dasharray="7 5"':''}/>`;
   scores.forEach((v,i)=>{const [x,y]=radarPoint(i,v/5*155);inner+=`<g data-radar-need="${i}" class="radar-point" role="button" tabindex="0" aria-label="${b.name}，${D.demands[i].name}，${v}分"><title>${b.name} · ${D.demands[i].name}：${v}分</title><circle cx="${x}" cy="${y}" r="${i===need?5.5:3.5}" fill="${b.color}" stroke="#faf7ed" stroke-width="1.5"/></g>`;});
  });
  $('radar-chart').innerHTML=`<svg viewBox="0 0 520 478" role="group" aria-label="三品牌8项需求满意度雷达图，得分范围1至5分">${inner}</svg>`;
 }
 const planningColumns=[['importance','重要度'],['edifier','漫步者满意度'],['baseus','倍思满意度'],['ugreen','绿联满意度'],['target','满意度目标'],['improvement','改进率'],['selling','卖点系数'],['corrected','修正权重']];
 function buildMatrix(){
  const extraHeader=planningVisible?planningColumns.map(([,label])=>`<th scope="col" class="planning-cell">${label}</th>`).join(''):'';
  const footerNote=planningVisible?'<td class="planning-footer" colspan="8" rowspan="6"><strong>从需求规划，到技术落地。</strong><p>右侧为需求规划参数；下方为技术重要度、设计目标和三品牌技术竞争评价。</p><p>点击技术名称，查看对应目标与评分解读。</p></td>':'';
  $('relationship-matrix').innerHTML=`<caption class="sr-only">完整质量屋；关系矩阵支持方向键导航。</caption><colgroup><col style="width:137px"><col style="width:74px">${D.techs.map(()=>'<col>').join('')}${planningVisible?planningColumns.map(()=>'<col style="width:64px">').join(''):''}</colgroup><thead><tr><th class="need-cell" scope="col">用户需求 ↓<br>技术特性 →</th><th class="weight-cell" scope="col">需求权重<br>（%）</th>${D.techs.map(t=>`<th scope="col" data-tech-column="${t.id}"><button type="button" data-select-tech="${t.id}" aria-pressed="false"><small>T${String(t.id+1).padStart(2,'0')}</small>${t.name}</button></th>`).join('')}${extraHeader}</tr></thead><tbody>${D.demands.map((d,i)=>`<tr data-need-row="${i}"><th class="need-cell" scope="row"><button type="button" data-select-need="${i}"><span>${String(i+1).padStart(2,'0')}</span>${d.name}</button></th><td class="weight-cell">${num(d.weight)}</td>${D.techs.map((t,j)=>`<td data-matrix-col="${j}"><button type="button" class="matrix-button" data-relation="${i},${j}" data-strength="${D.matrix[i][j]}" tabindex="-1" aria-pressed="false" aria-label="${d.name}与${t.name}：${relations[D.matrix[i][j]]}${D.matrix[i][j]?'，关系值'+D.matrix[i][j]:''}">${symbols[D.matrix[i][j]]}</button></td>`).join('')}${planningVisible?planningColumns.map(([key])=>`<td class="planning-cell">${simple(d[key])}</td>`).join(''):''}</tr>`).join('')}</tbody><tfoot><tr><th colspan="2" scope="row">技术重要度</th>${D.techs.map(t=>`<td data-matrix-col="${t.id}">${num(t.score)}</td>`).join('')}${footerNote}</tr><tr><th colspan="2" scope="row">技术相对权重（%）</th>${D.techs.map(t=>`<td class="tech-relative" data-matrix-col="${t.id}">${num(t.weight)}</td>`).join('')}</tr><tr class="technical-target-row"><th colspan="2" scope="row">技术设计目标</th>${D.techs.map(t=>`<td data-matrix-col="${t.id}">${t.goal}</td>`).join('')}</tr>${D.brands.map(b=>`<tr class="technical-benchmark-row" data-technical-brand="${b.key}"><th colspan="2" scope="row"><i style="background:${b.color}"></i>${b.name}<small>技术竞争评价 · 1—5级</small></th>${D.techs.map(t=>`<td data-matrix-col="${t.id}"><button type="button" data-select-tech="${t.id}" aria-label="${b.name}，${t.name}，技术评价${t.ratings[b.key]}分，查看技术详情">${t.ratings[b.key]}</button></td>`).join('')}</tr>`).join('')}</tfoot>`;
  $('relationship-matrix').setAttribute('aria-describedby','matrix-help');
 }
 const roofKinds={
  'strong-positive':{symbol:'●',label:'强正相关',reading:'两项技术为强正相关，设计改善存在协同关系。'},
  'weak-positive':{symbol:'○',label:'弱正相关',reading:'两项技术为弱正相关，设计改善存在一定协同关系。'},
  'strong-negative':{symbol:'✚',label:'强负相关',reading:'两项技术为强负相关，优化时需要同时权衡。'},
  'weak-negative':{symbol:'＋',label:'弱负相关',reading:'两项技术为弱负相关，优化时存在一定制约关系。'},
  'unmarked':{symbol:'·',label:'—',reading:'选择带有符号的菱格，查看技术之间的关联。'}
 };
 function roofType(a,b){return D.roofRelations.find(r=>r.a===a&&r.b===b)?.type||'unmarked';}
 function buildRoof(){
  let cells='';
  for(let a=0;a<9;a++)for(let b=a+1;b<10;b++){
   const x=(a+b+1)*50,y=250-(b-a)*25,type=roofType(a,b),info=roofKinds[type];
   cells+=`<g class="roof-button ${type}" data-roof-pair="${a},${b}" role="button" tabindex="-1" aria-pressed="false" aria-label="${D.techs[a].name}与${D.techs[b].name}：${info.label}"><title>${D.techs[a].name} ↔ ${D.techs[b].name}：${info.label}</title><polygon points="${x},${y-25} ${x+50},${y} ${x},${y+25} ${x-50},${y}"/><text x="${x}" y="${y+7}" text-anchor="middle">${info.symbol}</text></g>`;
  }
  $('correlation-roof').innerHTML=`<svg viewBox="0 0 1000 274" role="group" aria-label="技术自相关屋顶，45组技术组合中9组有标记；左右方向键可切换菱格"><path class="roof-outline" d="M0 250 500 0 1000 250Z"/>${cells}${D.techs.map(t=>`<text class="roof-axis-id" x="${t.id*100+50}" y="269" text-anchor="middle">T${String(t.id+1).padStart(2,'0')}</text>`).join('')}</svg>`;
  $('roof-relation-list').innerHTML=D.roofRelations.map(r=>`<button type="button" data-roof-link="${r.a},${r.b}" aria-pressed="false"><span>${D.techs[r.a].name} ↔ ${D.techs[r.b].name}</span><small class="${r.type.includes('negative')?'is-negative':''}">${roofKinds[r.type].symbol} ${roofKinds[r.type].label}</small></button>`).join('');
 }
 function updateRoof(focus=false){
  if(!roofPair.includes(tech)){
   const link=D.roofRelations.find(r=>r.a===tech||r.b===tech);
   roofPair=link?[link.a,link.b]:[Math.max(0,tech-1),tech];
  }
  const [a,b]=roofPair,type=roofType(a,b),info=roofKinds[type];
  $('correlation-roof').querySelectorAll('[data-roof-pair]').forEach(cell=>{
   const [i,j]=cell.dataset.roofPair.split(',').map(Number),selected=i===a&&j===b;
   cell.setAttribute('aria-pressed',String(selected));cell.tabIndex=selected?0:-1;cell.classList.toggle('touches-tech',i===tech||j===tech);if(selected&&focus)cell.focus();
  });
  $('roof-pair-name').textContent=`${D.techs[a].name} ↔ ${D.techs[b].name}`;
  $('roof-reading-mark').textContent=info.symbol;$('roof-kind').textContent=info.label;$('roof-reading-text').textContent=info.reading;$('roof-kind').hidden=type==='unmarked';
  $('roof-reading-mark').classList.toggle('is-negative',type.includes('negative'));$('roof-kind').classList.toggle('is-negative',type.includes('negative'));
  $('roof-relation-list').querySelectorAll('[data-roof-link]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.roofLink===a+','+b)));
 }
 function selectRoof(a,b,{focus=false}={}){roofPair=[a,b];selectTech(b);if(focus)updateRoof(true);}
 function updateTechnicalDetail(){
  const t=D.techs[tech];$('selected-tech-name').textContent=t.name;$('selected-tech-goal').textContent=t.goal;
  $('technical-score-bars').innerHTML=D.brands.map(b=>`<div class="technical-score-bar"><span>${b.name}</span><span class="score-steps" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i style="background:${i<t.ratings[b.key]?b.color:'#e6dfd5'}"></i>`).join('')}</span><strong>${t.ratings[b.key]}<small>分</small></strong></div>`).join('');
  const higher=D.brands.filter(b=>t.ratings[b.key]>t.ratings.edifier),same=D.brands.filter(b=>b.key!=='edifier'&&t.ratings[b.key]===t.ratings.edifier);
  $('technical-score-reading').textContent=higher.length?`漫步者该项技术评价为${t.ratings.edifier}分，低于${higher.map(b=>b.name+'的'+t.ratings[b.key]+'分').join('、')}，可结合技术目标进行对标。`:same.length?`漫步者该项技术评价为${t.ratings.edifier}分，与${same.map(b=>b.name).join('、')}持平。`:`漫步者该项技术评价为${t.ratings.edifier}分，高于本次对标的另外两个品牌。`;
 }
 function updateMatrix(focus=false){
  const d=D.demands[need],t=D.techs[tech],r=D.matrix[need][tech],contribution=d.weight*r;
  $('relationship-matrix').querySelectorAll('[data-relation]').forEach(b=>{const [i,j]=b.dataset.relation.split(',').map(Number),selected=i===need&&j===tech;b.setAttribute('aria-pressed',String(selected));b.tabIndex=selected?0:-1;if(selected&&focus)b.focus();});
  $('relationship-matrix').querySelectorAll('[data-need-row]').forEach(row=>row.classList.toggle('is-row',Number(row.dataset.needRow)===need));
  $('relationship-matrix').querySelectorAll('[data-tech-column]').forEach(cell=>cell.classList.toggle('is-column',Number(cell.dataset.techColumn)===tech));
  $('relationship-matrix').querySelectorAll('[data-matrix-col]').forEach(cell=>cell.classList.toggle('is-column',Number(cell.dataset.matrixCol)===tech));
  $('relationship-matrix').querySelectorAll('[data-select-tech]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.selectTech)===tech)));
  $('matrix-need-name').textContent=d.name;$('matrix-tech-name').textContent=t.name;
  $('matrix-explanation').textContent=r?`两者为${relations[r]}（${r}）。以${num(d.weight)}的需求权重乘以关系值，得到${num(contribution)}的技术重要度贡献。`:'这项需求与该技术未设置关系值。可点选其他关系点，查看需求与技术的联系。';
  $('inspector-numbers').innerHTML=[['关系值',r],['需求权重',num(d.weight)+'%'],['贡献分',num(contribution)],['技术总分',num(t.score)]].map(([name,value])=>`<div><span>${name}</span><strong>${value}</strong></div>`).join('');
  $('contribution-title').textContent=`${t.name}的权重来源`;
  const parts=D.demands.map((item,i)=>({name:item.name,id:i,value:item.weight*D.matrix[i][tech]})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
  $('tech-contributions').innerHTML=parts.map(part=>`<div class="contribution-row ${part.id===need?'is-selected':''}"><span>${part.name}</span><span class="contribution-track"><i style="width:${part.value/t.score*100}%"></i></span><strong>${num(part.value)}</strong></div>`).join('');
 }
 function setSelection(i,j,{focus=false}={}){need=Math.max(0,Math.min(7,i));tech=Math.max(0,Math.min(9,j));updateVoice();updateComparison();renderRadar();updateMatrix(focus);updateRoof();updateTechnicalDetail();}
 function selectNeed(i){const row=D.matrix[i];setSelection(i,row[tech]?tech:row.indexOf(Math.max(...row)));}
 function selectTech(j,{scroll=false}={}){
  const i=D.matrix[need][j]?need:D.demands.reduce((best,d,index)=>d.weight*D.matrix[index][j]>D.demands[best].weight*D.matrix[best][j]?index:best,0);
  setSelection(i,j);if(scroll){$('house').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});history.replaceState(null,'','#house');setActiveNav('house');}
 }
 $('demand-ranking').addEventListener('click',e=>{const b=e.target.closest('[data-demand]');if(b)selectNeed(Number(b.dataset.demand));});
 $('radar-needs').addEventListener('click',e=>{const b=e.target.closest('[data-radar-need]');if(b)selectNeed(Number(b.dataset.radarNeed));});
 $('radar-chart').addEventListener('click',e=>{const b=e.target.closest('[data-radar-need]');if(b)selectNeed(Number(b.dataset.radarNeed));});
 $('radar-chart').addEventListener('keydown',e=>{const b=e.target.closest('[data-radar-need]');if(b&&['Enter',' '].includes(e.key)){e.preventDefault();selectNeed(Number(b.dataset.radarNeed));}});
 $('brand-toggles').addEventListener('click',e=>{const b=e.target.closest('[data-brand]');if(!b)return;const key=b.dataset.brand;if(visibleBrands.has(key)){if(visibleBrands.size===1){notify('至少保留一个品牌，便于读取对比图。');return;}visibleBrands.delete(key);}else visibleBrands.add(key);$('brand-toggles').querySelectorAll('[data-brand]').forEach(button=>button.setAttribute('aria-pressed',String(visibleBrands.has(button.dataset.brand))));renderRadar();});
 $('show-target').addEventListener('change',e=>{targetVisible=e.target.checked;renderRadar();});
 $('toggle-planning').addEventListener('click',()=>{planningVisible=!planningVisible;$('house-sheet').classList.toggle('is-full',planningVisible);$('toggle-planning').setAttribute('aria-pressed',String(planningVisible));$('toggle-planning').textContent=planningVisible?'收起右侧需求规划 −':'展开右侧需求规划 ＋';buildMatrix();updateMatrix();});
 $('correlation-roof').addEventListener('click',e=>{const cell=e.target.closest('[data-roof-pair]');if(cell)selectRoof(...cell.dataset.roofPair.split(',').map(Number));});
 $('roof-relation-list').addEventListener('click',e=>{const button=e.target.closest('[data-roof-link]');if(button)selectRoof(...button.dataset.roofLink.split(',').map(Number));});
 $('correlation-roof').addEventListener('keydown',e=>{
  const cell=e.target.closest('[data-roof-pair]');if(!cell)return;
  if(['Enter',' '].includes(e.key)){e.preventDefault();selectRoof(...cell.dataset.roofPair.split(',').map(Number));return;}
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
  const cells=[...$('correlation-roof').querySelectorAll('[data-roof-pair]')],index=cells.indexOf(cell),next=e.key==='Home'?0:e.key==='End'?cells.length-1:Math.max(0,Math.min(cells.length-1,index+(e.key==='ArrowLeft'?-1:1)));
  selectRoof(...cells[next].dataset.roofPair.split(',').map(Number),{focus:true});
 });
 $('relationship-matrix').addEventListener('click',e=>{const cell=e.target.closest('[data-relation]'),header=e.target.closest('[data-select-tech]'),row=e.target.closest('[data-select-need]');if(cell)setSelection(...cell.dataset.relation.split(',').map(Number));else if(header)selectTech(Number(header.dataset.selectTech));else if(row)selectNeed(Number(row.dataset.selectNeed));});
 $('relationship-matrix').addEventListener('keydown',e=>{const b=e.target.closest('[data-relation]');if(!b||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();let [i,j]=b.dataset.relation.split(',').map(Number);if(e.key==='ArrowLeft')j--;if(e.key==='ArrowRight')j++;if(e.key==='ArrowUp')i--;if(e.key==='ArrowDown')i++;if(e.key==='Home'){j=0;if(e.ctrlKey)i=0;}if(e.key==='End'){j=9;if(e.ctrlKey)i=7;}setSelection(i,j,{focus:true});});
 $('technical-ranking').innerHTML=sortedTechs.map((t,i)=>`<button type="button" class="technical-row" data-tech-link="${t.id}" aria-label="第${i+1}名，${t.name}，技术相对权重${pct(t.weight)}，在质量屋中查看"><span class="tech-rank-num">${i+1}</span><span>${t.name}</span><span class="tech-rank-track"><i style="width:${t.weight/22*100}%"></i></span><strong>${pct(t.weight)}</strong></button>`).join('');
 document.querySelectorAll('[data-tech-link]').forEach(b=>b.addEventListener('click',()=>selectTech(Number(b.dataset.techLink),{scroll:true})));
 $('export-matrix').addEventListener('click',()=>{
  const rows=[['用户需求','需求相对权重（%）',...D.techs.map(t=>t.name)],...D.demands.map((d,i)=>[d.name,num(d.weight),...D.matrix[i]]),['技术重要度','',...D.techs.map(t=>num(t.score))],['技术相对权重（%）','',...D.techs.map(t=>num(t.weight))],[],['需求规划'],['需求','重要度','漫步者满意度','倍思满意度','绿联满意度','满意度目标','改进率','卖点系数','修正权重','相对修正权重（%）'],...D.demands.map(d=>[d.name,d.importance,d.edifier,d.baseus,d.ugreen,d.target,d.improvement,d.selling,d.corrected,num(d.weight)]),[],['技术目标与技术竞争评价'],['技术特性','技术重要度','技术相对权重（%）','设计目标','漫步者技术评分','倍思技术评分','绿联技术评分'],...D.techs.map(t=>[t.name,num(t.score),num(t.weight),t.goal,t.ratings.edifier,t.ratings.baseus,t.ratings.ugreen]),[],['屋顶技术自相关'],['技术一','技术二','技术相关关系']];
  for(let a=0;a<9;a++)for(let b=a+1;b<10;b++)rows.push([D.techs[a].name,D.techs[b].name,roofKinds[roofType(a,b)].label]);
  rows.push([],['说明：需求满意度与技术竞争评价为不同维度，评分均沿用原报告。'],['兼容性设计重要度采用表13的81.54，图2为81.57；技术权重沿用表14。'],['电池目标原图标为200MA，单位待核实；第9项原文为Soft and transparent technology，暂译柔软工艺。']);
  const csv='\uFEFF'+rows.map(row=>[...row,...Array(Math.max(0,12-row.length)).fill('')].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='漫步者耳机-完整质量屋数据.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('完整质量屋数据已导出。');
 });
 let toastTimer;function notify(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3200);}
 function setActiveNav(id){document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)setActiveNav(entry.target.id);});},{rootMargin:'-15% 0px -65% 0px',threshold:0});document.querySelectorAll('.section-anchor').forEach(s=>observer.observe(s));}
 document.querySelectorAll('[data-nav]').forEach(a=>a.addEventListener('click',()=>setActiveNav(a.dataset.nav)));
 let scrollRequest=0;function progress(){scrollRequest=0;const range=document.documentElement.scrollHeight-window.innerHeight;$('reading-progress').style.width=(range>0?window.scrollY/range*100:0)+'%';}
 window.addEventListener('scroll',()=>{if(!scrollRequest)scrollRequest=requestAnimationFrame(progress);},{passive:true});window.addEventListener('resize',progress);progress();
 const art=$('hero-art'),cutout=art.querySelector('img'),reduce=window.matchMedia('(prefers-reduced-motion: reduce)'),fine=window.matchMedia('(hover:hover) and (pointer:fine)');let artFrame=0,mouse=null;
 art.addEventListener('pointermove',e=>{if(reduce.matches||!fine.matches||window.innerWidth<761)return;mouse={x:e.clientX,y:e.clientY};if(!artFrame)artFrame=requestAnimationFrame(()=>{artFrame=0;if(!mouse)return;const b=art.getBoundingClientRect(),x=(mouse.x-b.left)/b.width-.5,y=(mouse.y-b.top)/b.height-.5;cutout.style.transform=`translate(${x*12}px,${20+y*8}px) rotate(${-8+x*4}deg)`;});});
 function resetArt(){if(artFrame)cancelAnimationFrame(artFrame);artFrame=0;mouse=null;cutout.style.transform='';}
 art.addEventListener('pointerleave',resetArt);window.addEventListener('blur',resetArt);reduce.addEventListener('change',resetArt);
 buildRoof();buildMatrix();setSelection(1,1);
 window.QFD_APP={selectNeed,selectTech,selectRoof,setSelection,getState:()=>({need,tech,roofPair:[...roofPair],planningVisible,visibleBrands:[...visibleBrands],targetVisible}),technicalContribution:(i,j)=>D.demands[i].weight*D.matrix[i][j]};
})();
