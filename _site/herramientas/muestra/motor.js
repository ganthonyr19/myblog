/* Motor de cálculo de tamaño de muestra · Anthony Romero Cerdán · MIT
   Todas las fórmulas están verificadas contra R (ver herramientas/muestra/verificacion.R). */
(function (raiz) {
  "use strict";

  // ---- funciones de distribución ------------------------------------------
  // lgamma (Lanczos), gamma y beta incompletas regularizadas (Numerical Recipes),
  // t central y t no central (Lenth, 1989, algoritmo AS 243). Coinciden con R a ~1e-11.
  // lgamma (Lanczos, g=7, n=9)
  const LG=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  function lgamma(x){ if (x<0.5) return Math.log(Math.PI/Math.abs(Math.sin(Math.PI*x)))-lgamma(1-x);
    x-=1; let a=LG[0]; const t=x+7.5; for(let i=1;i<9;i++) a+=LG[i]/(x+i);
    return 0.5*Math.log(2*Math.PI)+(x+0.5)*Math.log(t)-t+Math.log(a); }
  // regularized incomplete gamma P(a,x), Q(a,x)
  function gser(a,x){ let ap=a, sum=1/a, del=sum; for(let n=0;n<1000;n++){ ap+=1; del*=x/ap; sum+=del; if(Math.abs(del)<Math.abs(sum)*1e-16) break;}
    return sum*Math.exp(-x+a*Math.log(x)-lgamma(a)); }
  function gcf(a,x){ const FP=1e-300; let b=x+1-a, c=1/FP, d=1/b, h=d;
    for(let i=1;i<1000;i++){ const an=-i*(i-a); b+=2; d=an*d+b; if(Math.abs(d)<FP)d=FP; c=b+an/c; if(Math.abs(c)<FP)c=FP; d=1/d; const del=d*c; h*=del; if(Math.abs(del-1)<1e-16) break;}
    return Math.exp(-x+a*Math.log(x)-lgamma(a))*h; }
  function gammaQ(a,x){ if(x<=0) return 1; return x<a+1 ? 1-gser(a,x) : gcf(a,x); }
  function gammaP(a,x){ if(x<=0) return 0; return x<a+1 ? gser(a,x) : 1-gcf(a,x); }
  function pnorm(x){ const z=x*x/2; return x>=0 ? 1-0.5*gammaQ(0.5,z) : 0.5*gammaQ(0.5,z); }
  // regularized incomplete beta
  function betacf(a,b,x){ const FP=1e-300; let qab=a+b, qap=a+1, qam=a-1, c=1, d=1-qab*x/qap; if(Math.abs(d)<FP)d=FP; d=1/d; let h=d;
    for(let m=1;m<=3000;m++){ const m2=2*m; let aa=m*(b-m)*x/((qam+m2)*(a+m2)); d=1+aa*d; if(Math.abs(d)<FP)d=FP; c=1+aa/c; if(Math.abs(c)<FP)c=FP; d=1/d; h*=d*c;
      aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2)); d=1+aa*d; if(Math.abs(d)<FP)d=FP; c=1+aa/c; if(Math.abs(c)<FP)c=FP; d=1/d; const del=d*c; h*=del; if(Math.abs(del-1)<1e-16) break;}
    return h; }
  function ibeta(x,a,b){ if(x<=0) return 0; if(x>=1) return 1;
    const bt=Math.exp(lgamma(a+b)-lgamma(a)-lgamma(b)+a*Math.log(x)+b*Math.log(1-x));
    return x<(a+1)/(a+b+2) ? bt*betacf(a,b,x)/a : 1-bt*betacf(b,a,1-x)/b; }
  // central t
  function pt(t,df){ const x=df/(df+t*t); const tail=0.5*ibeta(x,df/2,0.5); return t>0?1-tail:tail; }
  function qt(p,df){ // Newton from normal start
    let t=qnormH(p); for(let i=0;i<60;i++){ const f=pt(t,df)-p; const dens=Math.exp(lgamma((df+1)/2)-lgamma(df/2)-0.5*Math.log(df*Math.PI)-(df+1)/2*Math.log(1+t*t/df));
      const step=f/dens; t-=step; if(Math.abs(step)<1e-13*Math.max(1,Math.abs(t))) break;} return t; }
  function qnormH(p){ // bisection-refined normal quantile using exact pnorm
    let lo=-40, hi=40; for(let i=0;i<200;i++){ const m=(lo+hi)/2; if(pnorm(m)<p) lo=m; else hi=m; } return (lo+hi)/2; }
  // noncentral t CDF: Lenth (1989) AS 243
  function ptnc(t,df,delta){ let negdel=false, tt=t, del=delta; if(t<0){negdel=true; tt=-t; del=-delta;}
    let tnc=0; const x=tt*tt/(tt*tt+df);
    if(x>0){ const lambda=del*del; let p=0.5*Math.exp(-0.5*lambda), q=Math.sqrt(2/Math.PI)*p*del, s=0.5-p, a=0.5; const b=0.5*df;
      const rxb=Math.pow(1-x,b), albeta=0.5*Math.log(Math.PI)+lgamma(b)-lgamma(0.5+b);
      let xodd=ibeta(x,a,b), godd=2*rxb*Math.exp(a*Math.log(x)-albeta), xeven=1-rxb, geven=b*x*rxb;
      tnc=p*xodd+q*xeven;
      for(let en=1;en<=2000;en++){ a+=1; xodd-=godd; xeven-=geven; godd*=x*(a+b-1)/a; geven*=x*(a+b-0.5)/(a+0.5);
        p*=lambda/(2*en); q*=lambda/(2*en+1); s-=p; tnc+=p*xodd+q*xeven; const errbd=2*s*(xodd-godd); if(errbd<=1e-14) break; } }
    tnc+=pnorm(-del); if(negdel) tnc=1-tnc; return tnc; }

  // Cuantil de la normal estándar (algoritmo de Acklam, error relativo < 1,2e-9).
  function qnorm(p) {
    if (p <= 0 || p >= 1) return NaN;
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
        b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
        c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
        d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var q, r, x, pl = 0.02425;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
    else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
    return x;
  }

  function za(conf) { return qnorm(1 - (1 - conf) / 2); }   // bilateral
  function zb(pot) { return qnorm(pot); }

  // ---- 1. Estimar una proporción (Lwanga y Lemeshow, 1991) -------------------
  // p: proporción esperada; d: precisión absoluta (semiamplitud del IC);
  // N: población (opcional); deff: efecto de diseño.
  function unaProporcion(o) {
    var z = za(o.conf);
    var n0 = z * z * o.p * (1 - o.p) / (o.d * o.d);
    var n = n0 * (o.deff || 1);
    var nfin = (o.N && o.N > 0) ? n / (1 + (n - 1) / o.N) : n;
    return { n0: n0, n: Math.ceil(nfin - 1e-9), crudo: nfin, z: z };
  }

  // ---- 2. Comparar dos proporciones (Fleiss, Levin y Paik, 2003) --------------
  // p1: proporción en el grupo 1 (expuestos o casos); p0: en el grupo 0;
  // r = n0/n1 (no expuestos por expuesto, o controles por caso).
  function dosProporciones(o) {
    var z1 = za(o.conf), z2 = zb(o.pot), r = o.r || 1, p1 = o.p1, p0 = o.p0;
    var pb = (p1 + r * p0) / (r + 1), qb = 1 - pb, dlt = Math.abs(p1 - p0);
    var n1 = Math.pow(z1 * Math.sqrt((r + 1) * pb * qb) + z2 * Math.sqrt(r * p1 * (1 - p1) + p0 * (1 - p0)), 2) / (r * dlt * dlt);
    if (o.cc !== false) {   // corrección de continuidad
      n1 = n1 / 4 * Math.pow(1 + Math.sqrt(1 + 2 * (r + 1) / (n1 * r * dlt)), 2);
    }
    var a = Math.ceil(n1 - 1e-9), b = Math.ceil(r * n1 - 1e-9);
    return { n1: a, n0: b, total: a + b, crudo1: n1, z1: z1, z2: z2, p1: p1, p0: p0 };
  }
  // proporción en expuestos/casos a partir de RR u OR
  function p1desdeRR(p0, rr) { return p0 * rr; }
  function p1desdeOR(p0, or) { return or * p0 / (1 + p0 * (or - 1)); }

  // ---- 3. Comparar dos medias (prueba t de Student, potencia exacta) ---------
  // dif: diferencia mínima importante; sd: desviación estándar común; r = n0/n1.
  // Resuelve n con la distribución t no central, igual que power.t.test() de R
  // (que es el caso r = 1).
  function potenciaT(n1, o) {
    var r = o.r || 1, df = n1 * (1 + r) - 2;
    var ncp = (o.dif / o.sd) / Math.sqrt(1 / n1 + 1 / (r * n1));
    return 1 - ptnc(qt(1 - (1 - o.conf) / 2, df), df, ncp);
  }
  function dosMedias(o) {
    var lo = 2, hi = 4, it;
    while (potenciaT(hi, o) < o.pot && hi < 1e7) hi *= 2;
    for (it = 0; it < 200; it++) {
      var m = (lo + hi) / 2;
      if (potenciaT(m, o) < o.pot) lo = m; else hi = m;
      if (hi - lo < 1e-9) break;
    }
    var n1 = (lo + hi) / 2, r = o.r || 1;
    var a = Math.ceil(n1 - 1e-7), b = Math.ceil(r * n1 - 1e-7);
    return { n1: a, n0: b, total: a + b, crudo1: n1 };
  }

  // ---- 4. Sensibilidad y especificidad (Buderer, 1996) -----------------------
  function diagnostica(o) {
    var z = za(o.conf);
    var nSe = z * z * o.se * (1 - o.se) / (o.d * o.d * o.prev);
    var nSp = z * z * o.sp * (1 - o.sp) / (o.d * o.d * (1 - o.prev));
    var a = Math.ceil(nSe - 1e-9), b = Math.ceil(nSp - 1e-9);
    return { nSe: a, nSp: b, n: Math.max(a, b), manda: a >= b ? "sensibilidad" : "especificidad", z: z };
  }

  // ---- 5. Correlación (transformación z de Fisher; Hulley et al.) -----------
  function correlacion(o) {
    var z1 = za(o.conf), z2 = zb(o.pot);
    var C = 0.5 * Math.log((1 + o.rho) / (1 - o.rho));
    var n = Math.pow((z1 + z2) / C, 2) + 3;
    return { n: Math.ceil(n - 1e-9), crudo: n, z1: z1, z2: z2 };
  }

  // ---- ajuste por pérdidas / no respuesta ----------------------------------
  function porPerdidas(n, L) { return L > 0 ? Math.ceil(n / (1 - L) - 1e-9) : n; }

  var M = { qnorm: qnorm, pnorm: pnorm, pt: pt, qt: qt, ptnc: ptnc, potenciaT: potenciaT, unaProporcion: unaProporcion, dosProporciones: dosProporciones,
            p1desdeRR: p1desdeRR, p1desdeOR: p1desdeOR, dosMedias: dosMedias,
            diagnostica: diagnostica, correlacion: correlacion, porPerdidas: porPerdidas };
  if (typeof module !== "undefined" && module.exports) module.exports = M; else raiz.Muestra = M;
})(this);
