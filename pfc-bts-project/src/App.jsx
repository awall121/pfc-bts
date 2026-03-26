import { useState, useEffect, useMemo } from "react";
import { loadData, saveData, onDataChange } from "./firebase.js";

const PAR = [4,4,3,5,4,3,4,4,5,4,4,3,5,4,4,3,4,5];
const PT = PAR.reduce((a,b)=>a+b,0);
const FP = PAR.slice(0,9).reduce((a,b)=>a+b,0);
const BP = PAR.slice(9).reduce((a,b)=>a+b,0);
const fD = d => new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fS = d => new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const isP = d => new Date(d+"T23:59:59") < new Date();
const ft = "'DM Sans',Calibri,sans-serif";
const sf = "'Playfair Display',Georgia,serif";

const DEF = {
  members:[
    {id:1,name:"Andrew C.",phone:"412-555-0101",email:"andrew@fcfinancial.com",hcp:12,status:"active"},
    {id:2,name:"Mike R.",phone:"412-555-0102",email:"mike.r@email.com",hcp:8,status:"active"},
    {id:3,name:"Dave P.",phone:"412-555-0103",email:"dave.p@email.com",hcp:15,status:"active"},
    {id:4,name:"Tom K.",phone:"412-555-0104",email:"tom.k@email.com",hcp:18,status:"active"},
    {id:5,name:"Chris B.",phone:"412-555-0105",email:"chris.b@email.com",hcp:10,status:"active"},
    {id:6,name:"Jim L.",phone:"412-555-0106",email:"jim.l@email.com",hcp:22,status:"active"},
    {id:7,name:"Pete S.",phone:"412-555-0107",email:"pete.s@email.com",hcp:6,status:"active"},
    {id:8,name:"Ryan M.",phone:"412-555-0108",email:"ryan.m@email.com",hcp:14,status:"active"},
  ],
  events:[
    {id:1,date:"2026-01-24",course:"Pittsburgh Field Club",time:"8:00 AM",fmt:"Best 1 of 4",max:16,ups:[1,2,3,4,5,6,7,8]},
    {id:2,date:"2026-02-07",course:"Fox Chapel Golf Club",time:"9:00 AM",fmt:"Best 1 of 4",max:16,ups:[1,2,3,4,5,6,7,8]},
    {id:3,date:"2026-03-14",course:"Shannopin CC",time:"8:30 AM",fmt:"Best 1 of 4",max:16,ups:[1,2,3]},
    {id:4,date:"2026-03-28",course:"Oakmont CC (East)",time:"10:00 AM",fmt:"Best 1 of 4",max:20,ups:[]},
    {id:5,date:"2026-04-11",course:"Longue Vue Club",time:"8:00 AM",fmt:"Best 1 of 4",max:16,ups:[]},
  ],
  rounds:[
    {eid:1,teams:[{id:"t1",pl:[1,2,7,5],sc:[5,4,3,4,5,4,3,4,4,5,4,3,4,5,4,3,4,5],tot:68},{id:"t2",pl:[3,4,6,8],sc:[4,5,4,3,5,5,4,4,5,4,5,4,4,5,4,4,5,4],tot:72}]},
    {eid:2,teams:[{id:"t3",pl:[1,3,5,7],sc:[4,4,3,5,4,3,4,4,5,4,4,3,5,4,4,3,4,5],tot:70},{id:"t4",pl:[2,4,6,8],sc:[5,4,4,4,5,4,3,5,4,5,4,4,4,5,4,3,5,4],tot:74}]},
  ],
  nid:9,neid:6,
};

// ─── Shared UI ──────────────────────────────────────────────────
function Modal({open,onClose,title,children}) {
  if(!open) return null;
  return (<div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)"}}/>
    <div style={{position:"relative",background:"#fff",borderRadius:16,padding:24,maxWidth:560,width:"94%",boxShadow:"0 25px 50px -12px rgba(0,0,0,.25)",maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:18,fontWeight:700,color:"#1a2e1a",fontFamily:sf,margin:0}}>{title}</h3>
        <button onClick={onClose} style={{background:"#f3f4f6",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:14}}>✕</button>
      </div>{children}
    </div></div>);
}
function Inp({label,value,onChange,type="text",placeholder,req}) {
  return (<div style={{marginBottom:12}}>
    <label style={{display:"block",fontSize:11,fontWeight:600,color:"#4a5e4a",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>{label}{req&&<span style={{color:"#c0392b"}}> *</span>}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"8px 10px",border:"2px solid #d4dcd4",borderRadius:8,fontSize:14,outline:"none",background:"#fafbfa",boxSizing:"border-box",fontFamily:ft}}
      onFocus={e=>e.target.style.borderColor="#2d5a27"} onBlur={e=>e.target.style.borderColor="#d4dcd4"}/>
  </div>);
}
function Bg({children,color="green"}) {
  const c={green:{b:"#e8f5e3",t:"#2d5a27"},amber:{b:"#fef3c7",t:"#92400e"},red:{b:"#fee2e2",t:"#991b1b"},blue:{b:"#dbeafe",t:"#1e40af"},gray:{b:"#f3f4f6",t:"#4b5563"},gold:{b:"#fef3c7",t:"#854d0e"}}[color]||{b:"#e8f5e3",t:"#2d5a27"};
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:c.b,color:c.t,textTransform:"uppercase",letterSpacing:.5}}>{children}</span>;
}
function Bt({children,onClick,v="primary",sm,style:sx}) {
  const s={primary:{background:"#2d5a27",color:"#fff",border:"none"},secondary:{background:"#e8f5e3",color:"#2d5a27",border:"2px solid #b7d9b0"},danger:{background:"#fee2e2",color:"#991b1b",border:"2px solid #fecaca"},ghost:{background:"#f9fafb",color:"#6b7280",border:"2px solid #e5e7eb"}}[v];
  return <button onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,borderRadius:10,padding:sm?"6px 10px":"10px 16px",fontSize:sm?11:13,fontWeight:600,cursor:"pointer",fontFamily:ft,...s,...sx}}>{children}</button>;
}

// ─── SCHEDULE ───────────────────────────────────────────────────
function ScheduleTab({data:D,signUp,rmSignUp,addEv,delEv,cu}) {
  const {events:evs,members:mems,rounds:rnds}=D;
  const [show,setShow]=useState(false);
  const [nE,sNE]=useState({date:"",course:"",time:"8:00 AM",fmt:"Best 1 of 4",max:16});
  const sorted=useMemo(()=>[...evs].sort((a,b)=>new Date(a.date)-new Date(b.date)),[evs]);
  const up=sorted.filter(e=>!isP(e.date)),pa=sorted.filter(e=>isP(e.date)).reverse();
  const gN=id=>mems.find(m=>m.id===id)?.name||"?";
  const doAdd=()=>{if(!nE.date||!nE.course)return;addEv(nE);sNE({date:"",course:"",time:"8:00 AM",fmt:"Best 1 of 4",max:16});setShow(false);};

  const Card=({ev,fd})=>{
    const isIn=ev.ups.includes(cu),sp=ev.max-ev.ups.length,rnd=rnds.find(r=>r.eid===ev.id);
    return(<div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:10,border:"2px solid #e8efe8",opacity:fd?.6:1}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
        <div style={{flex:1,minWidth:180}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{background:"#2d5a27",color:"#fff",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700}}>{fS(ev.date)}</span>
            {!fd&&<Bg color={sp>4?"green":sp>0?"amber":"red"}>{sp>0?`${sp} spots`:"FULL"}</Bg>}
            {rnd&&<Bg color="blue">Scored</Bg>}
          </div>
          <h3 style={{fontSize:18,fontWeight:700,color:"#1a2e1a",margin:"6px 0 2px",fontFamily:sf}}>{ev.course}</h3>
          <p style={{color:"#6b7f6b",fontSize:13,margin:0}}>{ev.time} · {ev.fmt} · {fD(ev.date)}</p>
        </div>
        {!fd&&<div style={{display:"flex",gap:6}}>
          {isIn?<Bt v="danger" sm onClick={()=>rmSignUp(ev.id,cu)}>✕ Out</Bt>:sp>0?<Bt v="secondary" sm onClick={()=>signUp(ev.id,cu)}>✓ In</Bt>:null}
          <Bt v="ghost" sm onClick={()=>delEv(ev.id)}>🗑</Bt>
        </div>}
      </div>
      {ev.ups.length>0&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #f0f4f0"}}>
        <p style={{fontSize:11,fontWeight:600,color:"#6b7f6b",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{fd?"Played":"Signed Up"} ({ev.ups.length}/{ev.max})</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{ev.ups.map(id=><span key={id} style={{background:"#f0f7ef",color:"#2d5a27",padding:"3px 8px",borderRadius:16,fontSize:11,fontWeight:600}}>{gN(id)}</span>)}</div>
      </div>}
      {rnd&&<div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #f0f4f0"}}>
        {rnd.teams.map((t,i)=><div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0"}}>
          <span style={{fontSize:12,color:"#4a5e4a"}}>{t.pl.map(gN).join(", ")}</span>
          <span style={{fontSize:14,fontWeight:700,color:i===0?"#2d5a27":"#6b7f6b",fontFamily:sf}}>{t.tot} ({t.tot<=PT?t.tot-PT:"+"+String(t.tot-PT)})</span>
        </div>)}
      </div>}
    </div>);
  };

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h2 style={{fontSize:24,fontWeight:700,color:"#1a2e1a",margin:0,fontFamily:sf}}>SWAT Schedule</h2>
        <p style={{color:"#6b7f6b",margin:"2px 0 0",fontSize:13}}>{up.length} upcoming</p></div>
      <Bt onClick={()=>setShow(true)}>+ Add Event</Bt>
    </div>
    {up.length===0&&<div style={{textAlign:"center",padding:32,color:"#9ca3af"}}><div style={{fontSize:40,marginBottom:8}}>⛳</div><p>No upcoming events</p></div>}
    {up.map(e=><Card key={e.id} ev={e}/>)}
    {pa.length>0&&<div style={{marginTop:28}}><h3 style={{fontSize:14,fontWeight:600,color:"#9ca3af",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Past Rounds</h3>{pa.map(e=><Card key={e.id} ev={e} fd/>)}</div>}
    <Modal open={show} onClose={()=>setShow(false)} title="Add SWAT Event">
      <Inp label="Date" type="date" value={nE.date} onChange={v=>sNE(p=>({...p,date:v}))} req/>
      <Inp label="Course" value={nE.course} onChange={v=>sNE(p=>({...p,course:v}))} placeholder="Fox Chapel Golf Club" req/>
      <Inp label="Tee Time" value={nE.time} onChange={v=>sNE(p=>({...p,time:v}))} placeholder="8:00 AM"/>
      <div style={{marginBottom:12}}>
        <label style={{display:"block",fontSize:11,fontWeight:600,color:"#4a5e4a",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Format</label>
        <select value={nE.fmt} onChange={e=>sNE(p=>({...p,fmt:e.target.value}))} style={{width:"100%",padding:"8px 10px",border:"2px solid #d4dcd4",borderRadius:8,fontSize:14,background:"#fafbfa",fontFamily:ft}}>
          <option>Best 1 of 4</option><option>Individual Stroke Play</option><option>2-Man Best Ball</option><option>Scramble</option><option>Skins Game</option>
        </select></div>
      <Inp label="Max Players" type="number" value={nE.max} onChange={v=>sNE(p=>({...p,max:parseInt(v)||16}))}/>
      <Bt onClick={doAdd} style={{width:"100%",marginTop:4}}>Add Event</Bt>
    </Modal>
  </div>);
}

// ─── POST SCORES ────────────────────────────────────────────────
function ScoresTab({data:D,saveRound}) {
  const {events:evs,members:mems,rounds:rnds}=D;
  const [sel,sSel]=useState("");
  const [teams,sTeams]=useState([]);
  const [saved,sSaved]=useState(false);
  const scorable=useMemo(()=>evs.filter(e=>e.ups.length>=4).sort((a,b)=>new Date(b.date)-new Date(a.date)),[evs]);
  const gN=id=>mems.find(m=>m.id===id)?.name||"?";

  function pick(eid){
    sSel(eid);sSaved(false);
    const ev=evs.find(e=>e.id===parseInt(eid)),ex=rnds.find(r=>r.eid===parseInt(eid));
    if(ex){sTeams(ex.teams.map(t=>({...t,sc:[...t.sc]})));}
    else if(ev){const pl=[...ev.ups],nt=[];let i=1;while(pl.length>=4){nt.push({id:"n"+i,pl:pl.splice(0,4),sc:Array(18).fill(""),tot:0});i++;}if(pl.length>0)nt.push({id:"n"+i,pl,sc:Array(18).fill(""),tot:0});sTeams(nt);}
  }
  function uSc(ti,hi,val){sTeams(p=>p.map((t,i)=>{if(i!==ti)return t;const ns=[...t.sc];ns[hi]=val===""?"":parseInt(val)||"";return{...t,sc:ns,tot:ns.reduce((a,b)=>a+(typeof b==="number"?b:0),0)};}));}
  function doSave(){saveRound({eid:parseInt(sel),teams:teams.map(t=>({...t,sc:t.sc.map(s=>typeof s==="number"?s:parseInt(s)||0),tot:t.sc.reduce((a,b)=>a+(typeof b==="number"?b:parseInt(b)||0),0)}))});sSaved(true);setTimeout(()=>sSaved(false),3000);}

  const Grid=({team,ti,half})=>{
    const start=half==="front"?0:9,end=half==="front"?9:18,hp=half==="front"?FP:BP;
    const ht=team.sc.slice(start,end).reduce((a,b)=>a+(typeof b==="number"?b:0),0);
    return(<div style={{marginBottom:10}}>
      <p style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,margin:"0 0 4px"}}>{half==="front"?"Front 9":"Back 9"}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:2,minWidth:360}}>
        {Array.from({length:9},(_,i)=>i+start+1).map(h=><div key={h} style={{textAlign:"center",fontSize:10,fontWeight:600,color:"#9ca3af"}}>{h}</div>)}
        <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:"#4a5e4a"}}>{half==="front"?"OUT":"IN"}</div>
        {PAR.slice(start,end).map((p,i)=><div key={"p"+i} style={{textAlign:"center",fontSize:10,color:"#b0b8b0",background:"#f9fafb",borderRadius:4,padding:"2px 0"}}>{p}</div>)}
        <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:"#6b7f6b",background:"#f0f4f0",borderRadius:4,padding:"2px 0"}}>{hp}</div>
        {Array.from({length:9},(_,i)=>i+start).map(i=>{const v=team.sc[i],isN=typeof v==="number";
          return <input key={"i"+i} type="number" min="1" max="10" value={v===""?"":v} onChange={e=>uSc(ti,i,e.target.value)}
            style={{width:"100%",textAlign:"center",fontSize:13,fontWeight:700,padding:"4px 0",border:"2px solid #e8efe8",borderRadius:6,outline:"none",fontFamily:ft,boxSizing:"border-box",background:isN&&v<PAR[i]?"#e8f5e3":isN&&v>PAR[i]?"#fef3c7":"#fff",color:"#1a2e1a"}}
            onFocus={e=>e.target.style.borderColor="#2d5a27"} onBlur={e=>e.target.style.borderColor="#e8efe8"}/>;
        })}
        <div style={{textAlign:"center",fontSize:13,fontWeight:800,color:"#1a2e1a",background:"#f0f4f0",borderRadius:6,padding:"4px 0",fontFamily:sf,display:"flex",alignItems:"center",justifyContent:"center"}}>{ht||"—"}</div>
      </div>
    </div>);
  };

  return(<div>
    <h2 style={{fontSize:24,fontWeight:700,color:"#1a2e1a",margin:"0 0 2px",fontFamily:sf}}>Post Scores</h2>
    <p style={{color:"#6b7f6b",margin:"0 0 16px",fontSize:13}}>Best 1 ball of 4 — enter team's best score per hole.</p>
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:"#4a5e4a",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Select Round</label>
      <select value={sel} onChange={e=>pick(e.target.value)} style={{width:"100%",padding:"10px 12px",border:"2px solid #d4dcd4",borderRadius:10,fontSize:14,background:"#fafbfa",fontFamily:ft}}>
        <option value="">Choose an event...</option>
        {scorable.map(e=><option key={e.id} value={e.id}>{fS(e.date)} — {e.course} ({e.ups.length} players){rnds.find(r=>r.eid===e.id)?" ✓":""}</option>)}
      </select>
    </div>
    {sel&&teams.length>0&&<div>
      {teams.map((team,ti)=><div key={team.id} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:14,border:"2px solid #e8efe8"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><h4 style={{margin:0,fontSize:15,fontWeight:700,color:"#1a2e1a",fontFamily:sf}}>Team {ti+1}</h4>
            <p style={{margin:"2px 0 0",fontSize:12,color:"#6b7f6b"}}>{team.pl.map(gN).join(" · ")}</p></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:24,fontWeight:800,color:team.tot&&team.tot<=PT?"#2d5a27":"#1a2e1a",fontFamily:sf}}>{team.tot||"—"}</div>
            {team.tot>0&&<div style={{fontSize:11,color:team.tot<PT?"#2d5a27":team.tot>PT?"#c0392b":"#6b7f6b",fontWeight:600}}>{team.tot===PT?"E":team.tot<PT?team.tot-PT:"+"+String(team.tot-PT)}</div>}
          </div>
        </div>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}><Grid team={team} ti={ti} half="front"/><Grid team={team} ti={ti} half="back"/></div>
      </div>)}
      <Bt onClick={doSave} style={{width:"100%",marginTop:4}}>{saved?"✓ Saved!":"Save Scores"}</Bt>
    </div>}
    {!sel&&<div style={{textAlign:"center",padding:32,color:"#9ca3af"}}><div style={{fontSize:40,marginBottom:8}}>📝</div><p>Select a round to enter scores</p></div>}
  </div>);
}

// ─── LEADERBOARD ────────────────────────────────────────────────
function LeaderboardTab({data:D}) {
  const {members:mems,rounds:rnds,events:evs}=D;
  const gN=id=>mems.find(m=>m.id===id)?.name||"?";
  const medals=["🥇","🥈","🥉"],mC=["#D4AF37","#A8A9AD","#CD7F32"];
  const stats=useMemo(()=>{
    const s={};mems.forEach(m=>{s[m.id]={id:m.id,nm:m.name,hcp:m.hcp,pts:0,rds:0,best:null,tot:0,wins:0};});
    rnds.forEach(r=>{const sorted=[...r.teams].filter(t=>t.tot>0).sort((a,b)=>a.tot-b.tot);
      sorted.forEach((t,rank)=>{const pts=rank===0?4:rank===1?2:rank===2?1:0;
        t.pl.forEach(pid=>{if(s[pid]){s[pid].pts+=pts;s[pid].rds+=1;s[pid].tot+=t.tot;if(rank===0)s[pid].wins+=1;if(s[pid].best===null||t.tot<s[pid].best)s[pid].best=t.tot;}});});});
    return Object.values(s).sort((a,b)=>b.pts-a.pts||a.tot-b.tot);
  },[mems,rnds]);
  const played=stats.filter(p=>p.rds>0),unplayed=stats.filter(p=>p.rds===0),top3=played.slice(0,3);
  const rRes=useMemo(()=>rnds.map(r=>({ev:evs.find(e=>e.id===r.eid),teams:[...r.teams].filter(t=>t.tot>0).sort((a,b)=>a.tot-b.tot)})).filter(r=>r.ev).sort((a,b)=>new Date(b.ev.date)-new Date(a.ev.date)),[rnds,evs]);

  return(<div>
    <h2 style={{fontSize:24,fontWeight:700,color:"#1a2e1a",margin:"0 0 2px",fontFamily:sf}}>Leaderboard</h2>
    <p style={{color:"#6b7f6b",margin:"0 0 20px",fontSize:13}}>2026 Season · Points: 1st=4, 2nd=2, 3rd=1</p>
    {top3.length>0&&<div style={{display:"flex",gap:10,marginBottom:20,justifyContent:"center"}}>
      {top3.map((p,i)=><div key={p.id} style={{flex:1,maxWidth:150,background:"#fff",borderRadius:14,padding:14,textAlign:"center",border:`2px solid ${i===0?"#D4AF37":"#D4DCD4"}`,transform:i===0?"scale(1.05)":"none",boxShadow:i===0?"0 4px 16px rgba(212,175,55,.2)":"none"}}>
        <div style={{fontSize:28,marginBottom:2}}>{medals[i]}</div>
        <div style={{fontSize:14,fontWeight:700,color:"#1a2e1a",fontFamily:sf}}>{p.nm}</div>
        <div style={{fontSize:28,fontWeight:800,color:mC[i],fontFamily:sf,margin:"2px 0"}}>{p.pts}</div>
        <div style={{fontSize:10,color:"#6b7f6b",fontWeight:600}}>POINTS</div>
        <div style={{marginTop:6,fontSize:11,color:"#9ca3af"}}>{p.rds} rnd{p.rds!==1?"s":""} · {p.wins} win{p.wins!==1?"s":""}</div>
        {p.best&&<div style={{fontSize:11,color:"#2d5a27",fontWeight:600}}>Best: {p.best}</div>}
      </div>)}</div>}
    <div style={{background:"#fff",borderRadius:14,border:"2px solid #e8efe8",overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"36px 1fr 50px 44px 44px 50px",padding:"8px 12px",background:"#f0f4f0",fontSize:10,fontWeight:700,color:"#6b7f6b",textTransform:"uppercase",letterSpacing:.5,gap:4}}>
        <div>#</div><div>Player</div><div style={{textAlign:"center"}}>Pts</div><div style={{textAlign:"center"}}>Rds</div><div style={{textAlign:"center"}}>W</div><div style={{textAlign:"center"}}>Best</div></div>
      {played.map((p,i)=><div key={p.id} style={{display:"grid",gridTemplateColumns:"36px 1fr 50px 44px 44px 50px",padding:"8px 12px",borderTop:"1px solid #f0f4f0",alignItems:"center",gap:4,background:i<3?"#fefef5":"#fff"}}>
        <div style={{fontSize:13,fontWeight:700,color:i<3?mC[i]:"#9ca3af"}}>{i<3?medals[i]:i+1}</div>
        <div><span style={{fontSize:13,fontWeight:600,color:"#1a2e1a"}}>{p.nm}</span><span style={{fontSize:10,color:"#9ca3af",marginLeft:4}}>({p.hcp})</span></div>
        <div style={{textAlign:"center",fontSize:15,fontWeight:800,color:"#2d5a27",fontFamily:sf}}>{p.pts}</div>
        <div style={{textAlign:"center",fontSize:12,color:"#6b7f6b"}}>{p.rds}</div>
        <div style={{textAlign:"center",fontSize:12,color:"#6b7f6b"}}>{p.wins}</div>
        <div style={{textAlign:"center",fontSize:12,fontWeight:600,color:"#4a5e4a"}}>{p.best||"—"}</div>
      </div>)}
      {unplayed.length>0&&<><div style={{padding:"6px 12px",background:"#f9fafb",fontSize:10,fontWeight:600,color:"#9ca3af",textTransform:"uppercase"}}>No Rounds Yet</div>
        {unplayed.map(p=><div key={p.id} style={{display:"grid",gridTemplateColumns:"36px 1fr 50px 44px 44px 50px",padding:"6px 12px",borderTop:"1px solid #f0f4f0",opacity:.4,gap:4}}>
          <div>—</div><div style={{fontSize:13,color:"#9ca3af"}}>{p.nm}</div><div style={{textAlign:"center"}}>0</div><div style={{textAlign:"center"}}>0</div><div style={{textAlign:"center"}}>0</div><div style={{textAlign:"center"}}>—</div></div>)}</>}
    </div>
    {rRes.length>0&&<div style={{marginTop:24}}><h3 style={{fontSize:14,fontWeight:600,color:"#9ca3af",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Round Results</h3>
      {rRes.map(({ev,teams})=><div key={ev.id} style={{background:"#fff",borderRadius:12,padding:14,marginBottom:8,border:"2px solid #e8efe8"}}>
        <div style={{marginBottom:8}}><span style={{fontWeight:700,color:"#1a2e1a",fontSize:14,fontFamily:sf}}>{ev.course}</span><span style={{color:"#9ca3af",marginLeft:8,fontSize:12}}>{fS(ev.date)}</span></div>
        {teams.map((t,rank)=><div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderTop:rank>0?"1px solid #f5f5f5":"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:700,color:rank<3?mC[rank]:"#9ca3af",width:20}}>{rank<3?medals[rank]:`${rank+1}.`}</span><span style={{fontSize:12,color:"#4a5e4a"}}>{t.pl.map(gN).join(", ")}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,fontWeight:700,color:"#1a2e1a",fontFamily:sf}}>{t.tot}</span><Bg color={rank===0?"gold":rank===1?"gray":"amber"}>{rank===0?"+4":rank===1?"+2":rank===2?"+1":"0"}pts</Bg></div>
        </div>)}</div>)}</div>}
  </div>);
}

// ─── MEMBERS ────────────────────────────────────────────────────
function MembersTab({data:D,addMem,editMem,delMem}) {
  const mems=D.members;const [show,setShow]=useState(false);const [eM,sEM]=useState(null);
  const [f,sF]=useState({name:"",phone:"",email:"",hcp:"",status:"active"});const [q,sQ]=useState("");
  const fil=mems.filter(m=>m.name.toLowerCase().includes(q.toLowerCase())||m.email.toLowerCase().includes(q.toLowerCase())||m.phone.includes(q));
  const sorted=[...fil].sort((a,b)=>a.name.localeCompare(b.name));
  const doAdd=()=>{if(!f.name)return;addMem({...f,hcp:parseInt(f.hcp)||0});sF({name:"",phone:"",email:"",hcp:"",status:"active"});setShow(false);};
  const doEdit=()=>{if(!f.name)return;editMem(eM.id,{...f,hcp:parseInt(f.hcp)||0});sF({name:"",phone:"",email:"",hcp:"",status:"active"});sEM(null);};
  const openE=m=>{sF({name:m.name,phone:m.phone,email:m.email,hcp:String(m.hcp),status:m.status});sEM(m);};

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <div><h2 style={{fontSize:24,fontWeight:700,color:"#1a2e1a",margin:0,fontFamily:sf}}>Members</h2>
        <p style={{color:"#6b7f6b",margin:"2px 0 0",fontSize:13}}>{mems.filter(m=>m.status==="active").length} active · {mems.length} total</p></div>
      <Bt onClick={()=>{sF({name:"",phone:"",email:"",hcp:"",status:"active"});setShow(true);}}>+ Add</Bt>
    </div>
    <input type="text" value={q} onChange={e=>sQ(e.target.value)} placeholder="Search..." style={{width:"100%",padding:"9px 12px",border:"2px solid #d4dcd4",borderRadius:10,fontSize:14,marginBottom:12,background:"#fafbfa",boxSizing:"border-box",fontFamily:ft}}/>
    <div style={{display:"grid",gap:6}}>
      {sorted.map(m=><div key={m.id} style={{background:"#fff",borderRadius:12,padding:12,border:"2px solid #e8efe8",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{flex:1,minWidth:160}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{fontWeight:700,fontSize:15,color:"#1a2e1a"}}>{m.name}</span>
            <Bg color={m.status==="active"?"green":"gray"}>{m.status}</Bg>
            <span style={{background:"#f0f4f0",color:"#4a5e4a",padding:"1px 6px",borderRadius:10,fontSize:10,fontWeight:700}}>HCP {m.hcp}</span>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <a href={`tel:${m.phone}`} style={{display:"flex",alignItems:"center",gap:3,color:"#6b7f6b",fontSize:12,textDecoration:"none"}}>📱 {m.phone}</a>
            <a href={`mailto:${m.email}`} style={{display:"flex",alignItems:"center",gap:3,color:"#6b7f6b",fontSize:12,textDecoration:"none"}}>📧 {m.email}</a>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}><Bt v="ghost" sm onClick={()=>openE(m)}>✏️</Bt><Bt v="ghost" sm onClick={()=>delMem(m.id)}>🗑</Bt></div>
      </div>)}
    </div>
    <Modal open={show||!!eM} onClose={()=>{setShow(false);sEM(null);}} title={eM?"Edit Member":"Add Member"}>
      <Inp label="Name" value={f.name} onChange={v=>sF(p=>({...p,name:v}))} placeholder="John Smith" req/>
      <Inp label="Cell" value={f.phone} onChange={v=>sF(p=>({...p,phone:v}))} placeholder="412-555-0100" type="tel" req/>
      <Inp label="Email" value={f.email} onChange={v=>sF(p=>({...p,email:v}))} placeholder="john@email.com" type="email" req/>
      <Inp label="Handicap" value={f.hcp} onChange={v=>sF(p=>({...p,hcp:v}))} placeholder="12" type="number"/>
      <div style={{marginBottom:12}}><label style={{display:"block",fontSize:11,fontWeight:600,color:"#4a5e4a",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Status</label>
        <select value={f.status} onChange={e=>sF(p=>({...p,status:e.target.value}))} style={{width:"100%",padding:"8px 10px",border:"2px solid #d4dcd4",borderRadius:8,fontSize:14,background:"#fafbfa",fontFamily:ft}}>
          <option value="active">Active</option><option value="inactive">Inactive</option><option value="waitlist">Waitlist</option></select></div>
      <Bt onClick={eM?doEdit:doAdd} style={{width:"100%",marginTop:4}}>{eM?"Save":"Add Member"}</Bt>
    </Modal>
  </div>);
}

// ─── COMMUNICATE ────────────────────────────────────────────────
function CommTab({data:D}) {
  const {members:mems,events:evs}=D;
  const [mt,sMt]=useState("email");const [aud,sAud]=useState("all");const [se,sSe]=useState("");
  const [sub,sSub]=useState("");const [msg,sMsg]=useState("");const [sent,sSent]=useState(false);
  const active=mems.filter(m=>m.status==="active");
  const upcoming=evs.filter(e=>!isP(e.date)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  function getRec(){if(aud==="all")return active;if(aud==="event"&&se){const ev=evs.find(e=>e.id===parseInt(se));return ev?mems.filter(m=>ev.ups.includes(m.id)):active;}if(aud==="not"&&se){const ev=evs.find(e=>e.id===parseInt(se));return ev?active.filter(m=>!ev.ups.includes(m.id)):active;}return active;}
  const rec=getRec();
  const tpl=[{l:"Reminder",s:"PFC BTS — Upcoming Round",b:"Hey guys,\n\nReminder — next SWAT round is coming up. Sign up if you haven't.\n\nBack tees. No excuses.\n\n- PFC BTS"},
    {l:"Nudge",s:"Spots Open",b:"Still got spots. Get in.\n\n- PFC BTS"},
    {l:"Recap",s:"PFC BTS — Recap",b:"Great round today.\n\n1st: \n2nd: \nCTP: \nLD: \n\n- PFC BTS"},
    {l:"Custom",s:"",b:""}];
  return(<div>
    <h2 style={{fontSize:24,fontWeight:700,color:"#1a2e1a",margin:"0 0 2px",fontFamily:sf}}>Message</h2>
    <p style={{color:"#6b7f6b",margin:"0 0 16px",fontSize:13}}>Mass email or text the group.</p>
    <div style={{marginBottom:14}}><label style={{display:"block",fontSize:11,fontWeight:600,color:"#4a5e4a",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Template</label>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{tpl.map(t=><button key={t.l} onClick={()=>{sSub(t.s);sMsg(t.b);}} style={{padding:"6px 12px",borderRadius:8,border:"2px solid #d4dcd4",background:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",color:"#4a5e4a",fontFamily:ft}}>{t.l}</button>)}</div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
      <div><label style={{display:"block",fontSize:11,fontWeight:600,color:"#4a5e4a",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Via</label>
        <div style={{display:"flex",border:"2px solid #d4dcd4",borderRadius:10,overflow:"hidden"}}>{["email","text"].map(t=><button key={t} onClick={()=>sMt(t)} style={{flex:1,padding:"8px 0",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",background:mt===t?"#2d5a27":"#fff",color:mt===t?"#fff":"#6b7f6b",fontFamily:ft}}>{t==="email"?"📧 Email":"📱 Text"}</button>)}</div></div>
      <div><label style={{display:"block",fontSize:11,fontWeight:600,color:"#4a5e4a",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>To</label>
        <select value={aud} onChange={e=>sAud(e.target.value)} style={{width:"100%",padding:"8px 10px",border:"2px solid #d4dcd4",borderRadius:10,fontSize:13,background:"#fafbfa",fontFamily:ft}}><option value="all">All Active ({active.length})</option><option value="event">Signed Up</option><option value="not">NOT Signed Up</option></select></div>
    </div>
    {(aud==="event"||aud==="not")&&<select value={se} onChange={e=>sSe(e.target.value)} style={{width:"100%",padding:"8px 10px",border:"2px solid #d4dcd4",borderRadius:10,fontSize:13,marginBottom:10,background:"#fafbfa",fontFamily:ft}}><option value="">Select event...</option>{upcoming.map(e=><option key={e.id} value={e.id}>{fS(e.date)} — {e.course}</option>)}</select>}
    <div style={{background:"#f0f7ef",borderRadius:10,padding:10,marginBottom:10}}><p style={{fontSize:10,fontWeight:600,color:"#4a5e4a",marginBottom:4}}>TO ({rec.length})</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{rec.map(m=><span key={m.id} style={{background:"#fff",padding:"2px 6px",borderRadius:6,fontSize:11,color:"#2d5a27",fontWeight:500}}>{m.name}</span>)}</div></div>
    {mt==="email"&&<Inp label="Subject" value={sub} onChange={sSub} placeholder="PFC BTS — ..."/>}
    <div style={{marginBottom:12}}><label style={{display:"block",fontSize:11,fontWeight:600,color:"#4a5e4a",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Message</label>
      <textarea value={msg} onChange={e=>sMsg(e.target.value)} rows={5} placeholder="Type message..." style={{width:"100%",padding:"8px 10px",border:"2px solid #d4dcd4",borderRadius:8,fontSize:13,background:"#fafbfa",resize:"vertical",fontFamily:ft,boxSizing:"border-box"}}/></div>
    <a href={mt==="email"?`mailto:${rec.map(m=>m.email).join(",")}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(msg)}`:`sms:${rec.map(m=>m.phone).join(",")}?body=${encodeURIComponent(msg)}`}
      onClick={()=>{sSent(true);setTimeout(()=>sSent(false),3000);}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",background:sent?"#16a34a":"#2d5a27",color:"#fff",borderRadius:10,padding:"11px 0",fontSize:14,fontWeight:600,textDecoration:"none",fontFamily:ft}}>
      {sent?"✓ Opened!":mt==="email"?"📧 Open in Email":"📱 Open in Messages"}</a>
  </div>);
}

// ─── REGISTER ───────────────────────────────────────────────────
function RegTab({addMem}) {
  const [f,sF]=useState({name:"",phone:"",email:"",hcp:""});const [done,sDone]=useState(false);
  const go=()=>{if(!f.name||!f.phone||!f.email)return;addMem({...f,hcp:parseInt(f.hcp)||0,status:"active"});sDone(true);sF({name:"",phone:"",email:"",hcp:""});setTimeout(()=>sDone(false),4000);};
  return(<div>
    <h2 style={{fontSize:24,fontWeight:700,color:"#1a2e1a",margin:"0 0 2px",fontFamily:sf}}>Join the SWAT</h2>
    <p style={{color:"#6b7f6b",margin:"0 0 20px",fontSize:13}}>New? Register below.</p>
    <div style={{background:"#fff",borderRadius:14,padding:20,border:"2px solid #e8efe8",maxWidth:400}}>
      {done?<div style={{textAlign:"center",padding:"24px 0"}}><div style={{fontSize:40,marginBottom:8}}>🏌️</div><h3 style={{fontSize:18,fontWeight:700,color:"#2d5a27",fontFamily:sf}}>You're In!</h3><p style={{color:"#6b7f6b",fontSize:13}}>Welcome to PFC Back Tee SWAT.</p></div>
      :<><Inp label="Name" value={f.name} onChange={v=>sF(p=>({...p,name:v}))} placeholder="John Smith" req/>
        <Inp label="Cell" value={f.phone} onChange={v=>sF(p=>({...p,phone:v}))} placeholder="412-555-0100" type="tel" req/>
        <Inp label="Email" value={f.email} onChange={v=>sF(p=>({...p,email:v}))} placeholder="john@email.com" type="email" req/>
        <Inp label="Handicap" value={f.hcp} onChange={v=>sF(p=>({...p,hcp:v}))} placeholder="Optional" type="number"/>
        <Bt onClick={go} style={{width:"100%",marginTop:4}}>Register</Bt></>}
    </div>
  </div>);
}

// ─── MAIN APP ───────────────────────────────────────────────────
export default function App() {
  const [D,sD]=useState(DEF);const [tab,sTab]=useState("schedule");const [ok,sOk]=useState(false);const cu=1;

  // Load from Firebase on mount + listen for real-time changes
  useEffect(()=>{
    loadData().then(s=>{if(s)sD(s);sOk(true);});
    const unsub=onDataChange(data=>{sD(data);});
    return ()=>unsub();
  },[]);

  // Save to Firebase on every change
  useEffect(()=>{if(ok)saveData(D);},[D,ok]);

  const u=fn=>sD(p=>({...fn(p)}));
  const addMem=m=>u(d=>({...d,members:[...d.members,{...m,id:d.nid}],nid:d.nid+1}));
  const editMem=(id,up)=>u(d=>({...d,members:d.members.map(m=>m.id===id?{...m,...up}:m)}));
  const delMem=id=>u(d=>({...d,members:d.members.filter(m=>m.id!==id),events:d.events.map(e=>({...e,ups:e.ups.filter(s=>s!==id)}))}));
  const addEv=ev=>u(d=>({...d,events:[...d.events,{...ev,id:d.neid,max:ev.max||16,ups:[]}],neid:d.neid+1}));
  const delEv=id=>u(d=>({...d,events:d.events.filter(e=>e.id!==id),rounds:d.rounds.filter(r=>r.eid!==id)}));
  const signUp=(eid,uid)=>u(d=>({...d,events:d.events.map(e=>e.id===eid&&!e.ups.includes(uid)&&e.ups.length<e.max?{...e,ups:[...e.ups,uid]}:e)}));
  const rmSignUp=(eid,uid)=>u(d=>({...d,events:d.events.map(e=>e.id===eid?{...e,ups:e.ups.filter(i=>i!==uid)}:e)}));
  const saveRound=rnd=>u(d=>{const ei=d.rounds.findIndex(r=>r.eid===rnd.eid);const nr=ei>=0?d.rounds.map((r,i)=>i===ei?rnd:r):[...d.rounds,rnd];return{...d,rounds:nr};});

  const tabs=[{id:"schedule",l:"Schedule",e:"📅"},{id:"scores",l:"Scores",e:"📝"},{id:"leaderboard",l:"Board",e:"🏆"},{id:"members",l:"Members",e:"👥"},{id:"communicate",l:"Msg",e:"💬"},{id:"register",l:"Join",e:"⛳"}];

  return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#e8efe8 0%,#f5f8f5 100%)",fontFamily:ft}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');*{box-sizing:border-box}body{margin:0}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}`}</style>
    <div style={{background:"#1a2e1a",padding:"16px 0 0",borderBottom:"3px solid #2d5a27"}}>
      <div style={{maxWidth:800,margin:"0 auto",padding:"0 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"#2d5a27",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⛳</div>
          <div><h1 style={{fontSize:20,fontWeight:800,color:"#fff",margin:0,letterSpacing:-.5,fontFamily:sf}}>PFC BTS</h1>
            <p style={{color:"#7fa87f",margin:0,fontSize:10,fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>Back Tee Swat</p></div>
        </div>
        <div style={{display:"flex",gap:0,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {tabs.map(t=><button key={t.id} onClick={()=>sTab(t.id)} style={{flex:"0 0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"7px 11px",border:"none",cursor:"pointer",fontSize:10,fontWeight:600,borderRadius:"8px 8px 0 0",background:tab===t.id?"#f5f8f5":"transparent",color:tab===t.id?"#2d5a27":"#7fa87f",fontFamily:ft,minWidth:0}}><span style={{fontSize:15}}>{t.e}</span><span>{t.l}</span></button>)}
        </div>
      </div>
    </div>
    <div style={{maxWidth:800,margin:"0 auto",padding:"20px 16px 40px"}}>
      {tab==="schedule"&&<ScheduleTab data={D} signUp={signUp} rmSignUp={rmSignUp} addEv={addEv} delEv={delEv} cu={cu}/>}
      {tab==="scores"&&<ScoresTab data={D} saveRound={saveRound}/>}
      {tab==="leaderboard"&&<LeaderboardTab data={D}/>}
      {tab==="members"&&<MembersTab data={D} addMem={addMem} editMem={editMem} delMem={delMem}/>}
      {tab==="communicate"&&<CommTab data={D}/>}
      {tab==="register"&&<RegTab addMem={addMem}/>}
    </div>
  </div>);
}
