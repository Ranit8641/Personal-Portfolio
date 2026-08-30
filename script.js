const header=document.querySelector('.site-header');
const progress=document.querySelector('.progress-line');
const reveals=document.querySelectorAll('.reveal');
const nav=document.querySelector('.nav');
const menu=document.querySelector('.menu-toggle');

window.addEventListener('scroll',()=>{
  header.classList.toggle('scrolled',window.scrollY>30);
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.width=(window.scrollY/max*100)+'%';
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})
},{threshold:.12});
reveals.forEach(el=>observer.observe(el));

document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
menu.addEventListener('click',()=>nav.classList.toggle('open'));

document.querySelectorAll('.magnetic').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.12;
    const y=(e.clientY-r.top-r.height/2)*.12;
    el.style.transform=`translate(${x}px,${y}px)`;
  });
  el.addEventListener('mouseleave',()=>el.style.transform='');
});

const ring=document.querySelector('.cursor-ring'),dot=document.querySelector('.cursor-dot');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
function cursorLoop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(cursorLoop)}
cursorLoop();
document.querySelectorAll('a,button,.skill-group,.project-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ring.style.width='62px';ring.style.height='62px'});
  el.addEventListener('mouseleave',()=>{ring.style.width='42px';ring.style.height='42px'});
});

function handleForm(e){
  e.preventDefault();
  const note=document.getElementById('form-note');
  note.textContent='Please use the email address above to send a direct message.';
  return false;
}
document.getElementById('year').textContent=new Date().getFullYear();

/* ── 3D Interactive Skill Sphere ── */
(function(){
  const canvas=document.getElementById('skill-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const container=document.getElementById('skill-sphere');

  const tags=['PYTHON','REACT.JS','NODE.JS','MONGODB','C++','JAVASCRIPT','MYSQL','FIGMA','GIT','HTML','CSS','JAVA','EXPRESS.JS','TAILWIND'];
  const count=tags.length;

  /* sphere point distribution (Fibonacci) */
  const points=[];
  const phi=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<count;i++){
    const y=1-(i/(count-1))*2;
    const r=Math.sqrt(1-y*y);
    const theta=phi*i;
    points.push({x:Math.cos(theta)*r,y:y,z:Math.sin(theta)*r});
  }

  let rotX=0,rotY=0;
  let targetRotSpeedX=0.003,targetRotSpeedY=0.005;
  let rotSpeedX=0.003,rotSpeedY=0.005;
  let mouseOver=false;

  function resize(){
    const rect=container.getBoundingClientRect();
    const dpr=window.devicePixelRatio||1;
    canvas.width=rect.width*dpr;
    canvas.height=rect.height*dpr;
    canvas.style.width=rect.width+'px';
    canvas.style.height=rect.height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  window.addEventListener('resize',resize);

  container.addEventListener('mousemove',function(e){
    mouseOver=true;
    const rect=container.getBoundingClientRect();
    const mx=(e.clientX-rect.left)/rect.width-.5;
    const my=(e.clientY-rect.top)/rect.height-.5;
    targetRotSpeedY=mx*.03;
    targetRotSpeedX=-my*.03;
  });
  container.addEventListener('mouseleave',function(){
    mouseOver=false;
    targetRotSpeedX=0.003;
    targetRotSpeedY=0.005;
  });

  /* touch support */
  container.addEventListener('touchmove',function(e){
    e.preventDefault();
    const t=e.touches[0];
    const rect=container.getBoundingClientRect();
    const mx=(t.clientX-rect.left)/rect.width-.5;
    const my=(t.clientY-rect.top)/rect.height-.5;
    targetRotSpeedY=mx*.03;
    targetRotSpeedX=-my*.03;
  },{passive:false});
  container.addEventListener('touchend',function(){
    targetRotSpeedX=0.003;
    targetRotSpeedY=0.005;
  });

  function rotateX(p,a){
    const cos=Math.cos(a),sin=Math.sin(a);
    return{x:p.x,y:p.y*cos-p.z*sin,z:p.y*sin+p.z*cos};
  }
  function rotateY(p,a){
    const cos=Math.cos(a),sin=Math.sin(a);
    return{x:p.x*cos+p.z*sin,y:p.y,z:-p.x*sin+p.z*cos};
  }

  function draw(){
    /* smooth ease rotation speed */
    rotSpeedX+=(targetRotSpeedX-rotSpeedX)*.06;
    rotSpeedY+=(targetRotSpeedY-rotSpeedY)*.06;

    rotX+=rotSpeedX;
    rotY+=rotSpeedY;

    const w=canvas.width/(window.devicePixelRatio||1);
    const h=canvas.height/(window.devicePixelRatio||1);
    ctx.clearRect(0,0,w,h);

    const cx=w/2,cy=h/2;
    const radius=Math.min(w,h)*0.36;
    const focalLen=600;

    /* project & sort by depth */
    const projected=[];
    for(let i=0;i<count;i++){
      let p=rotateX(points[i],rotX);
      p=rotateY(p,rotY);
      const scale=focalLen/(focalLen+p.z*radius);
      projected.push({
        x:cx+p.x*radius*scale,
        y:cy+p.y*radius*scale,
        z:p.z,
        scale:scale,
        alpha:0.4+0.6*((p.z+1)/2),
        tag:tags[i]
      });
    }
    projected.sort((a,b)=>a.z-b.z);

    /* draw connecting ring outlines */
    ctx.beginPath();
    ctx.arc(cx,cy,radius*.82,0,Math.PI*2);
    ctx.strokeStyle='rgba(183,238,230,0.06)';
    ctx.lineWidth=1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx,cy,radius*.5,0,Math.PI*2);
    ctx.stroke();

    /* draw tags */
    for(const p of projected){
      const fontSize=Math.max(9,12*p.scale);
      ctx.font='700 '+fontSize+'px "DM Sans",sans-serif';
      ctx.letterSpacing='1.2px';
      ctx.textAlign='center';
      ctx.textBaseline='middle';

      /* glow for front-facing tags */
      if(p.z>0.3){
        ctx.shadowColor='rgba(118,224,211,'+(.2*p.alpha)+')';
        ctx.shadowBlur=15;
      }else{
        ctx.shadowColor='transparent';
        ctx.shadowBlur=0;
      }

      ctx.fillStyle='rgba(186,216,213,'+p.alpha+')';
      ctx.fillText(p.tag,p.x,p.y);
      ctx.shadowBlur=0;
    }

    /* center core circle */
    ctx.beginPath();
    ctx.arc(cx,cy,48,0,Math.PI*2);
    ctx.fillStyle='#00342f';
    ctx.fill();
    ctx.strokeStyle='#8bd8ce';
    ctx.lineWidth=1;
    ctx.stroke();
    ctx.shadowColor='rgba(118,224,211,0.12)';
    ctx.shadowBlur=45;
    ctx.fill();
    ctx.shadowBlur=0;

    ctx.font='700 9px "DM Sans",sans-serif';
    ctx.fillStyle='#eaf5f3';
    ctx.letterSpacing='2px';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('SKILLS',cx,cy);

    requestAnimationFrame(draw);
  }
  draw();
})();
