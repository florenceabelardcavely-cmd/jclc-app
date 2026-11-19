
// ══════════════════════════════════════════════════
//  CSS COMPLET v2
// ══════════════════════════════════════════════════
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,600;1,400&family=Courier+Prime:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#F0EFF8;--sur:#FFFFFF;--sur2:#F4F3FA;
  --bdr:#E2E0F0;--bdr2:#C8C6DC;
  --txt:#1A1830;--txt2:#6B6880;--txt3:#9B99A8;
  --ind:#4F46E5;--ind-bg:#EEEEFF;
  --amb:#D97706;--amb-bg:#FFFBEB;
  --grn:#059669;--grn-bg:#ECFDF5;
  --red:#DC2626;--red-bg:#FEF2F2;
  --gold:#D97706;--gold-bg:#FFFBEB;
  --r:14px;--rsm:10px;--rlg:20px;
  --sh:0 2px 8px rgba(79,70,229,.06),0 1px 3px rgba(0,0,0,.04);
  --shm:0 8px 24px rgba(79,70,229,.1),0 2px 8px rgba(0,0,0,.06);
}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;font-size:18px;line-height:1.5;}
button{cursor:pointer;font-family:inherit;}
input,select,textarea{font-family:inherit;}
.app{display:flex;flex-direction:column;min-height:100vh;}
.main{flex:1;padding:24px 28px;max-width:1100px;margin:0 auto;width:100%;}
.hdr{background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--bdr);padding:0 28px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;box-shadow:0 1px 0 var(--bdr),0 4px 16px rgba(79,70,229,.06);}
.hbrand{display:flex;align-items:center;gap:12px;}
.hbrand img{width:40px;height:40px;object-fit:contain;filter:drop-shadow(0 2px 8px rgba(245,158,11,.35));}
.hbrand-t{display:flex;flex-direction:column;}
.hbrand-n{font-weight:900;font-size:15px;background:linear-gradient(135deg,#1A1830,#4F46E5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-.3px;}
.hbrand-s{font-size:10px;color:var(--txt3);letter-spacing:.5px;text-transform:uppercase;}
.hrgt{display:flex;align-items:center;gap:10px;}
.husr{font-size:12px;font-weight:600;color:var(--txt2);}
.nav{background:linear-gradient(135deg,#4F46E5 0%,#6366F1 100%);padding:0 16px;display:flex;gap:3px;overflow-x:auto;box-shadow:0 4px 16px rgba(79,70,229,.35);}
.nbtn{padding:12px 16px;font-size:12px;font-weight:700;color:rgba(255,255,255,.75);background:rgba(255,255,255,.08);border:none;border-radius:10px;white-space:nowrap;transition:all .18s;letter-spacing:.2px;margin:6px 2px;}
.nbtn:hover{color:#fff;background:rgba(255,255,255,.18);}
.nbtn.on{color:#4F46E5;background:#fff;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.15);}
.card{background:var(--sur);border:1px solid var(--bdr);border-radius:var(--r);padding:20px;box-shadow:var(--sh);margin-bottom:16px;transition:box-shadow .2s,transform .2s;}
.card:hover{box-shadow:var(--shm);}
.card-t{font-weight:700;font-size:15px;margin-bottom:2px;}
.card-s{font-size:12px;color:var(--txt2);margin-bottom:14px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;}
.stat{background:var(--sur);border:1px solid var(--bdr);border-radius:var(--r);padding:16px;text-align:center;box-shadow:var(--sh);}
.statn{font-size:28px;font-weight:800;color:var(--ind);line-height:1.1;background:linear-gradient(135deg,#4F46E5,#D97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.statl{font-size:11px;color:var(--txt2);font-weight:600;margin-top:4px;}
.btn{padding:9px 18px;border-radius:var(--rsm);border:none;font-size:13px;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;gap:6px;}
.btn-p{background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.3);}.btn-p:hover{background:linear-gradient(135deg,#3730a3,#4F46E5);box-shadow:0 4px 16px rgba(99,102,241,.4);transform:translateY(-1px);}
.btn-g{background:var(--sur2);color:var(--txt);border:1px solid var(--bdr);}.btn-g:hover{background:var(--bdr);}
.btn-grn{background:linear-gradient(135deg,#059669,#10B981);color:#fff;box-shadow:0 2px 8px rgba(5,150,105,.25);}.btn-grn:hover{background:linear-gradient(135deg,#047857,#059669);transform:translateY(-1px);}
.btn-d{background:var(--red-bg);color:var(--red);border:1px solid rgba(220,38,38,.2);}.btn-d:hover{background:#fee2e2;}
.btn-amb{background:linear-gradient(135deg,#D97706,#F59E0B);color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(217,119,6,.3);}.btn-amb:hover{background:linear-gradient(135deg,#B45309,#D97706);transform:translateY(-1px);}
.btn-sm{font-size:12px;padding:7px 14px;}
.btn-xs{font-size:11px;padding:5px 10px;}
.btn-ic{padding:6px 8px;}
.btn:disabled{opacity:.45;cursor:not-allowed;}
.inp{width:100%;padding:10px 12px;border:1.5px solid var(--bdr);border-radius:var(--rsm);font-size:13px;background:var(--sur);color:var(--txt);transition:all .15s;outline:none;}
.inp:focus{border-color:var(--ind);box-shadow:0 0 0 3px rgba(79,70,229,.1);}
.sel{width:100%;padding:10px 12px;border:1.5px solid var(--bdr);border-radius:var(--rsm);font-size:13px;background:var(--sur);color:var(--txt);outline:none;}
.fld{margin-bottom:14px;}
.fld label{display:block;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;}
.modal{background:var(--sur);border-radius:var(--rlg);padding:26px;max-height:90vh;overflow-y:auto;width:560px;max-width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25);}
.modal-t{font-size:18px;font-weight:800;margin-bottom:3px;}
.modal-s{font-size:12px;color:var(--txt2);margin-bottom:18px;}
.toast{position:fixed;bottom:88px;right:16px;background:linear-gradient(135deg,#1A1830,#2D2B6B);color:#fff;padding:12px 18px;border-radius:14px;font-size:13px;font-weight:600;z-index:300;box-shadow:0 8px 32px rgba(79,70,229,.3),0 0 0 1px rgba(255,255,255,.1);animation:slideUp .25s cubic-bezier(.34,1.56,.64,1);backdrop-filter:blur(20px);}
@keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes tabFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.tab-content>*{animation:tabFade .2s ease forwards;}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.skeleton{background:linear-gradient(90deg,var(--sur2) 25%,var(--bdr) 50%,var(--sur2) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}
.fade-in{animation:fadeIn .3s ease forwards;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes tabFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.tab-content>*{animation:tabFade .2s ease forwards;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
.fade-in{animation:fadeIn .3s ease forwards;}
.pill{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.3px;box-shadow:0 1px 4px rgba(0,0,0,.08);}
.pill-admin{background:#EDE9FE;color:#5B21B6;}
.pill-pasteur{background:#FEF3C7;color:#92400E;}
.pill-dm{background:#DBEAFE;color:#1E40AF;}
.pill-bib{background:var(--grn-bg);color:var(--grn);}
.pill-member{background:var(--sur2);color:var(--txt2);}
.pill-tech{background:#CFFAFE;color:#155E75;}
.pill-com{background:#FCE7F3;color:#9D174D;}
.pill-musicien{background:#FCE7F3;color:#9D174D;}
.bdg{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;}
.bdg-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.bdg-val{background:var(--grn-bg);color:var(--grn);}.bdg-val .bdg-dot{background:var(--grn);}
.bdg-draft{background:var(--amb-bg);color:var(--amb);}.bdg-draft .bdg-dot{background:var(--amb);}
.bdg-new{background:#FCE7F3;color:#9D174D;}.bdg-new .bdg-dot{background:#9D174D;}
.ib{padding:10px 14px;border-radius:var(--rsm);font-size:12px;margin-bottom:14px;line-height:1.6;}
.ind{background:var(--ind-bg);color:var(--ind);border:1px solid rgba(79,70,229,.15);}
.grn{background:var(--grn-bg);color:var(--grn);}
.amb{background:var(--amb-bg);color:var(--amb);}
.red{background:var(--red-bg);color:var(--red);}
.ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;gap:12px;}
.pt{font-size:22px;font-weight:900;letter-spacing:-.5px;margin-bottom:2px;background:linear-gradient(135deg,var(--txt),#4F46E5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.ps{font-size:12px;color:var(--txt2);}
.mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.mnavt{font-size:18px;font-weight:800;letter-spacing:-.2px;}
.mrow{display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:var(--rsm);background:var(--sur2);margin-bottom:6px;}
.mav{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;}
.arow{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--rsm);background:var(--sur2);margin-bottom:6px;cursor:pointer;transition:background .12s;}
.arow:hover{background:var(--bdr);}
.chk{width:22px;height:22px;border-radius:6px;border:2px solid var(--bdr2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:transparent;transition:all .15s;flex-shrink:0;}
.chk.on{background:var(--grn);border-color:var(--grn);color:#fff;}
.atag{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;margin-top:3px;}
.t-sam{background:#EEF2FF;color:#4F46E5;}
.t-dim{background:#FEF2F2;color:#DC2626;}
.t-mer{background:#F0FDF4;color:#16A34A;}
.t-mar{background:#FFF7ED;color:#EA580C;}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.calh{text-align:center;font-size:10px;font-weight:700;color:var(--txt3);padding:4px 0;text-transform:uppercase;letter-spacing:.4px;}
.cald{border-radius:8px;padding:4px;min-height:52px;}
.calnd{font-size:12px;font-weight:700;text-align:right;padding:1px 4px;margin-bottom:2px;}
.cald.em{background:transparent;}
.cald.wk{background:#f5f4f1;}
.cald.td{background:var(--ind-bg);border:2px solid var(--ind);}
.cald.me{background:var(--grn-bg);}
.calev{font-size:9px;font-weight:700;padding:2px 4px;border-radius:4px;margin-bottom:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ev-creil{background:#EEF2FF;color:#4F46E5;}
.ev-lognes{background:#FFFBEB;color:#D97706;}
.ev-me{background:var(--grn-bg);color:var(--grn);}
.sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
.sc{background:var(--sur);border:1px solid var(--bdr);border-radius:var(--r);padding:16px;box-shadow:var(--sh);transition:all .2s;}
.sc:hover{border-color:var(--ind);box-shadow:var(--shm);transform:translateY(-2px);}
.st{font-weight:800;font-size:15px;margin-bottom:6px;}
.skb{background:var(--ind-bg);color:var(--ind);padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;}
.tc{display:inline-block;background:var(--sur2);color:var(--txt2);padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;margin-right:4px;margin-bottom:4px;}
.kgrid{display:flex;flex-wrap:wrap;gap:5px;}
.kbtn{padding:5px 10px;border-radius:var(--rsm);border:1.5px solid var(--bdr);font-size:12px;font-weight:700;background:var(--sur);color:var(--txt);transition:all .15s;}
.kbtn.on{background:var(--ind);border-color:var(--ind);color:#fff;}
.cs{font-family:'Courier Prime',monospace;font-size:13px;line-height:2;}
.cs-s{font-style:italic;font-weight:700;font-size:12px;color:var(--txt3);margin:10px 0 3px;}
.cs-c{color:#CC1F00;font-weight:700;white-space:pre;}
.cs-l{white-space:pre;}
.login{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 0%,#2D1B4E 0%,#0D0D1A 60%,#0A0A0A 100%);padding:20px;position:relative;overflow:hidden;}
.login::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(245,158,11,.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,.1) 0%,transparent 50%);pointer-events:none;}
.lcard{width:400px;background:rgba(255,255,255,.05);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border:1px solid rgba(255,255,255,.08);border-radius:32px;padding:44px 36px;text-align:center;box-shadow:0 40px 80px rgba(0,0,0,.6),0 0 0 1px rgba(245,158,11,.05),inset 0 1px 0 rgba(255,255,255,.08);position:relative;z-index:1;}
.lcard::before{content:"";position:absolute;top:-1px;left:50%;transform:translateX(-50%);width:60%;height:1px;background:linear-gradient(90deg,transparent,rgba(245,158,11,.4),transparent);}
.ltitle{font-size:28px;font-weight:900;color:#fff;margin-bottom:4px;letter-spacing:-.6px;text-shadow:0 0 40px rgba(245,158,11,.3);}
.lsub{font-size:11px;color:rgba(255,255,255,.35);margin-bottom:32px;letter-spacing:2px;text-transform:uppercase;}
.llabel{display:block;font-size:10px;font-weight:700;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;text-align:left;}
.lsel{width:100%;padding:13px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:14px;color:#fff;font-size:14px;margin-bottom:14px;outline:none;transition:border .2s;}
.lsel:focus{border-color:rgba(245,158,11,.4);background:rgba(255,255,255,.08);}
.lsel option{background:#1A1A2E;color:#fff;}
.lbtn{width:100%;padding:16px;background:linear-gradient(135deg,#D97706,#F59E0B,#FBBF24);border:none;border-radius:14px;color:#0D0D0D;font-size:15px;font-weight:900;margin-top:8px;transition:all .2s;letter-spacing:.3px;box-shadow:0 8px 32px rgba(245,158,11,.35);}
.lbtn:hover:not(:disabled){background:linear-gradient(135deg,#B45309,#D97706,#F59E0B);transform:translateY(-2px);box-shadow:0 12px 40px rgba(245,158,11,.45);}
.lbtn:active:not(:disabled){transform:translateY(0);}
.lbtn:disabled{opacity:.4;box-shadow:none;}
.lnote{font-size:10px;color:rgba(255,255,255,.15);line-height:1.7;margin-top:14px;}
.verset-banner{background:linear-gradient(135deg,rgba(79,70,229,.12) 0%,rgba(184,134,11,.08) 100%);border:1px solid rgba(79,70,229,.15);border-radius:var(--r);padding:18px 20px;margin-bottom:20px;}
.verset-label{font-size:10px;color:rgba(0,0,0,.4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;font-weight:600;}
.verset-text{font-family:'Lora',serif;font-size:15px;font-style:italic;color:var(--txt);margin-bottom:5px;line-height:1.7;}
.verset-ref{font-size:10px;font-weight:800;color:var(--gold);letter-spacing:.8px;text-transform:uppercase;}
.notif-banner{background:linear-gradient(135deg,var(--ind) 0%,#6366F1 100%);border-radius:var(--rlg);padding:18px 22px;margin-bottom:20px;display:flex;align-items:center;gap:16px;color:#fff;box-shadow:0 4px 20px rgba(79,70,229,.3);}
.nb-icon{font-size:32px;flex-shrink:0;}
.nb-title{font-weight:700;font-size:15px;margin-bottom:3px;}
.nb-sub{font-size:12px;opacity:.8;}
.nb-btn{background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.4);border-radius:var(--rsm);color:#fff;padding:8px 16px;font-size:12px;font-weight:700;flex-shrink:0;transition:all .15s;cursor:pointer;}
.nb-btn:hover{background:rgba(255,255,255,.3);}
.perm-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--rsm);background:var(--sur2);margin-bottom:6px;}
.toggle{width:40px;height:22px;border-radius:11px;border:none;position:relative;transition:background .2s;flex-shrink:0;cursor:pointer;}
.toggle.on{background:var(--ind);}.toggle.off{background:var(--bdr2);}
.toggle::after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;top:3px;transition:left .2s;}
.toggle.on::after{left:21px;}.toggle.off::after{left:3px;}
.divider{border:none;border-top:1px solid var(--bdr);margin:14px 0;}
.flex-end{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}
.scroll-list{max-height:380px;overflow-y:auto;padding-right:2px;}
.scroll-list::-webkit-scrollbar{width:4px;}
.scroll-list::-webkit-scrollbar-thumb{background:var(--bdr2);border-radius:2px;}
.empty{text-align:center;padding:40px 20px;color:var(--txt3);}
.empty-icon{font-size:36px;margin-bottom:8px;}
.notif-row{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:var(--rsm);background:var(--sur2);margin-bottom:6px;}
.csw{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.cswb{padding:10px 16px;border-radius:var(--r);border:1.5px solid var(--bdr);background:var(--sur);font-size:12px;font-weight:600;color:var(--txt2);display:flex;align-items:center;gap:8px;transition:all .15s;}
.cswb.creil{background:var(--ind-bg);border-color:var(--ind);color:var(--ind);}
.cswb.lognes{background:var(--amb-bg);border-color:var(--amb);color:var(--amb);}
.cswb.toulouse{background:var(--grn-bg);border-color:var(--grn);color:var(--grn);}
.cswb-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.cswb-cnt{background:rgba(0,0,0,.08);padding:1px 7px;border-radius:20px;font-size:10px;}
.mycard{background:var(--sur);border:1px solid var(--bdr);border-left:4px solid var(--ind);border-radius:var(--r);padding:14px 16px;margin-bottom:10px;position:relative;}
.mycard-d{font-weight:700;font-size:14px;}
.mycard-t{font-size:12px;color:var(--txt2);margin-top:3px;}
.mycard-next{position:absolute;top:12px;right:12px;background:var(--grn);color:#fff;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;}
.prog-page-sep{border:none;border-top:2px dashed var(--bdr);margin:20px 0;position:relative;}
.prog-page-sep::after{content:"Page suivante →";position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:var(--bg);padding:0 10px;font-size:10px;color:var(--txt3);font-weight:600;}
.fa-item{background:var(--sur2);border-radius:var(--rsm);padding:14px 16px;margin-bottom:10px;cursor:pointer;}
.fa-q{font-weight:700;font-size:13px;display:flex;justify-content:space-between;align-items:center;}
.fa-a{font-size:12px;color:var(--txt2);margin-top:8px;line-height:1.7;}
.assign-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--rsm);background:var(--sur2);margin-bottom:5px;cursor:pointer;transition:background .12s;}
.assign-row:hover{background:var(--bdr);}
.assign-chk{width:20px;height:20px;border-radius:5px;border:2px solid var(--bdr2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:transparent;transition:all .15s;flex-shrink:0;}
.assign-chk.on{background:var(--grn);border-color:var(--grn);color:#fff;}
.musicien-song{background:var(--sur);border:1px solid var(--bdr);border-radius:var(--r);padding:20px;margin-bottom:14px;}
.musicien-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.musicien-num{width:36px;height:36px;border-radius:50%;background:var(--ind);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0;}
.musicien-cat{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;}
.cat-Adoration{background:#EDE9FE;color:#5B21B6;}
.cat-Louange{background:#DBEAFE;color:#1E40AF;}
.cat-Sainte-Cène{background:#FCE7F3;color:#9D174D;}
.cat-Dîme-Offrandes{background:var(--grn-bg);color:var(--grn);}
.cat-default{background:var(--sur2);color:var(--txt2);}
.flyer-container{background:white;border:1px solid var(--bdr);border-radius:var(--r);overflow:hidden;}
.flyer-header{background:linear-gradient(135deg,#1A1916 0%,#2D2B6B 100%);padding:24px;display:flex;align-items:center;gap:16px;color:white;}
.flyer-body{padding:24px;}
.stat-bar{background:var(--sur2);border-radius:8px;overflow:hidden;height:8px;margin-top:4px;}
.stat-fill{height:8px;border-radius:8px;background:var(--ind);transition:width .4s ease;}
@media print{.hdr,.nav,.no-print{display:none!important;}body{background:#fff;}.cs-c{color:#CC1F00!important;}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.bottom-nav{display:none;}
@media (max-width:768px){
  .main{padding:16px 14px 90px;}
  .hdr{padding:0 14px;height:50px;}
  .hbrand-s{display:none;}
  .husr{display:none;}
  .hrgt .pill{display:none;}
  .nav{display:none;}
  .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,#4F46E5 0%,#6366F1 100%);border-top:none;z-index:100;box-shadow:0 -4px 24px rgba(79,70,229,.4);padding-bottom:env(safe-area-inset-bottom);}
  .bnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;padding:10px 2px 8px;border:none;background:none;font-size:10px;font-weight:600;color:rgba(255,255,255,.65);gap:3px;cursor:pointer;transition:all .2s;min-width:0;position:relative;}
  .bnav-btn.on{color:#fff;}
  .bnav-btn.on .bni{transform:translateY(-2px);filter:drop-shadow(0 2px 6px rgba(0,0,0,.3));}
  .bnav-btn.on::after{content:"";position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:28px;height:3px;background:#fff;border-radius:3px 3px 0 0;}
  .bnav-btn .bni{font-size:26px;line-height:1;transition:all .2s;}
  .bnav-btn .bnl{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px;font-weight:700;letter-spacing:.2px;color:inherit;}
  .card{padding:16px;border-radius:14px;}
  .g2{grid-template-columns:1fr;}
  .stats{grid-template-columns:1fr 1fr;}
  .stat{padding:12px;}
  .statn{font-size:22px;}
  .csw{flex-direction:column;gap:6px;}
  .ph{flex-direction:column;gap:8px;align-items:flex-start;}
  .pt{font-size:20px;}
  .sg{grid-template-columns:1fr;}
  .login{padding:16px;align-items:flex-start;padding-top:40px;}
  .lcard{width:100%;padding:28px 20px;border-radius:20px;}
  .ltitle{font-size:22px;}
  .overlay{padding:0;align-items:flex-end;}
  .modal{width:100%;border-radius:20px 20px 0 0;padding:22px 18px;max-height:88vh;}
  .mrow{padding:10px 12px;}
  .assign-row{padding:9px 10px;}
  .verset-banner{padding:16px 18px;}
  .verset-text{font-size:14px;}
  .notif-banner{flex-wrap:wrap;gap:10px;}
  .nb-btn{width:100%;}
}
@media (max-width:380px){
  .main{padding:12px 10px 88px;}
  .card{padding:14px;}
  .hbrand-n{font-size:13px;}
  .pt{font-size:18px;}
  .bnav-btn .bni{font-size:18px;}
  .stats{grid-template-columns:1fr 1fr;}
  .lcard{padding:24px 16px;}
  .modal{padding:18px 14px;}
  .btn{padding:8px 14px;font-size:12px;}
  .btn-sm{padding:5px 12px;font-size:11px;}
}
`;
