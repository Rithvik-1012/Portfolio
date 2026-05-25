import { useEffect, useRef, useState, useCallback } from "react";
import "./App.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* ═══════════ DATA ═══════════════════════════════════════════ */
const NAV = ["about","skills","projects","experience","publications","contact"];

const SKILLS = [
  { n:"01", cat:"Languages",        tags:["Python","Java","TypeScript","C++","SQL","C"] },
  { n:"02", cat:"Backend & APIs",   tags:["Node.js","Express","Flask","REST","WebSockets","Microservices"] },
  { n:"03", cat:"Data Engineering", tags:["Kafka","Apache Spark","Airflow","ETL","Stream Processing"] },
  { n:"04", cat:"Cloud & Infra",    tags:["AWS EC2","S3","Lambda","ECS","Docker","Kubernetes"] },
  { n:"05", cat:"Databases",        tags:["PostgreSQL","Redis","MySQL","Elasticsearch"] },
  { n:"06", cat:"ML & AI",          tags:["Anomaly Detection","Deep Learning","Computer Vision","LLM APIs"] },
  { n:"07", cat:"DevOps",           tags:["CI/CD","Jenkins","GitHub Actions","Prometheus","Grafana"] },
  { n:"08", cat:"Frontend",         tags:["React","Redux","TypeScript","HTML5","CSS3"] },
];

const PROJECTS = [
  {
    n:"01", ft:true, color:"#00d4ff",
    tag:"Real-Time Infrastructure",
    title:"High-Throughput Stream Processing System",
    desc:"Event-driven architecture processing 8TB+/day with exactly-once semantics and sub-second end-to-end latency. Fault-tolerant microservices with circuit breakers, dead-letter queues, and Kubernetes HPA.",
    stack:["Kafka","Spark Streaming","Airflow","Python","Kubernetes","Docker","Grafana"],
    stats:[["8TB+","Daily Volume"],["<1s","Latency"],["50+","Custom Metrics"],["12min","Incident Detection"]],
    url:"https://github.com/Rithvik-1012",
  },
  {
    n:"02", ft:false, color:"#7b2fff",
    tag:"Full Stack · Search",
    title:"E-Commerce Product Search Platform",
    desc:"React + TypeScript frontend, Node.js/Express backend. Elasticsearch full-text search across 10K+ products with faceted filtering, JWT auth, Redis caching — sub-300ms response times.",
    stack:["React","TypeScript","Node.js","Elasticsearch","Redis","PostgreSQL","Docker"],
    stats:[["<300ms","Response Time"],["10K+","Products Indexed"]],
    url:"https://github.com/Rithvik-1012",
  },
  {
    n:"03", ft:false, color:"#ff2f6e",
    tag:"HPC · Distributed Computing",
    title:"Parallel Distributed Computing Framework",
    desc:"MPI + C++ parallel solver for 2D heat diffusion. 9× speedup with 85% parallel efficiency on 8-node cluster. Non-blocking I/O, message aggregation, benchmarked across 16M+ grid points.",
    stack:["MPI","C++","Python","HPC","Bash"],
    stats:[["9×","Speedup"],["85%","Parallel Efficiency"]],
    url:"https://github.com/Rithvik-1012",
  },
];

const EXP = [
  {
    period:"May 2025 – Sep 2025", role:"Software Engineering Intern",
    co:"Quadrant Technologies", loc:"Seattle, USA",
    pts:[
      "Optimized backend API endpoints using Python/Flask and PostgreSQL, implementing Redis caching that reduced query response times by 40% for data-heavy analytics dashboards",
      "Built end-to-end testing solution using pytest and Docker, integrated with Jenkins CI/CD, reducing manual testing workload by 60% and accelerating bug identification within development sprints",
      "Implemented production monitoring and alerting using Prometheus and Grafana, creating custom dashboards to track API performance metrics and error rates across services",
      "Contributed to microservices migration, refactoring monolithic codebase into containerized services using Docker and deploying to AWS ECS with improved scalability",
    ],
  },
  {
    period:"May 2022 – Dec 2023", role:"Software Engineer",
    co:"American Express", loc:"Bengaluru, India",
    pts:[
      "Designed and developed event-driven microservices for real-time payment processing systems using Java and Spring Boot, integrated with Kafka message queues to handle high-throughput transaction streams and reduce end-to-end processing latency by 45%",
      "Built and maintained scalable REST APIs powering customer-facing financial products including fraud detection and risk scoring services, improving system throughput by 60% and reducing deployment time from weeks to hours via automated CI/CD pipelines on AWS",
      "Engineered distributed data processing workflows using Apache Spark across multi-terabyte transaction datasets, reducing analytics pipeline turnaround by 70% and enabling near-real-time reporting for risk and compliance teams",
      "Drove platform reliability initiatives including automated regression testing, blue-green deployments, and monitoring dashboards, achieving 99.9% system uptime and reducing production incidents by 50%",
    ],
  },
  {
    period:"May 2021 – May 2022", role:"Software Development Intern",
    co:"National Atmospheric Research Laboratory", loc:"Tirupati, India",
    pts:[
      "Built batch processing framework using Apache Spark and Python, handling multi-terabyte atmospheric datasets with 85% resource utilization across distributed clusters",
      "Developed real-time analytics dashboard with React and WebSocket connections, providing live atmospheric insights that improved forecasting model accuracy by 20%",
      "Optimized data ingestion pipelines using Python, Airflow, and Bash, reducing manual processing time from 2 hours to 25 minutes and eliminating data errors",
    ],
  },
];

const CERTS = [
  {b:"AWS", n:"AWS Certified Solutions Architect", s:"Amazon Web Services · Associate"},
  {b:"OCI", n:"Oracle Cloud AI Foundations 2025", s:"Oracle · Certified Associate"},
  {b:"OCA", n:"Oracle Certified Java Programmer", s:"Oracle · Associate"},
  {b:"UB",  n:"M.S. Computer Science and Engineering", s:"University at Buffalo · 2024 to 2026"},
];

const PUBS = [
  {
    title:"Evaluation of GNSS-Based Machine Learning Techniques for Nowcasting of Storms",
    pts:[
      "Applied advanced ML techniques to GNSS datasets using TensorFlow, enabling real-time atmospheric monitoring and enhancing storm prediction accuracy by 15%",
      "Proposed a scalable deep learning framework for GNSS signal preprocessing and anomaly detection, demonstrating improved model precision through comprehensive ablation studies",
      "Conducted end-to-end experimentation with hyperparameter tuning using Optuna and custom evaluation metrics tailored for geospatial time-series data",
    ],
  },
];

/* ═══════════ WEBGL BACKGROUND ══════════════════════════════ */
function WebGLBg() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const gl = cv.getContext("webgl2") || cv.getContext("webgl");
    if (!gl) return;

    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      gl.viewport(0, 0, cv.width, cv.height);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const VS = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
    const FS = `precision highp float;
varying vec2 v;uniform float t;uniform vec2 m;uniform float vx,vy,sc;
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
float no(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(dot(h2(i),f),dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)),dot(h2(i+vec2(1)),f-vec2(1)),u.x),u.y)*.5+.5;}
float fb(vec2 p){float r=0.,a=.5;for(int i=0;i<6;i++){r+=a*no(p);p*=2.1;a*=.48;}return r;}
vec3 pal(float t){return vec3(.02,.04,.09)+vec3(.02,.04,.09)*cos(6.28*(vec3(.9,.4,.8)*t+vec3(0.,.33,.67)));}
void main(){
  vec2 uv=v,md=uv-m;
  float sp=length(vec2(vx,vy)),d=length(md*vec2(1.78,1.)),infl=smoothstep(.4,0.,d)*clamp(sp*20.,0.,1.);
  uv+=normalize(md+.001)*infl*-.05;uv.y+=sc*.00012;
  float tt=t*.11;
  vec2 q=vec2(fb(uv+tt),fb(uv+vec2(3.1,1.7)+tt*.7));
  vec2 r=vec2(fb(uv+4.*q+vec2(1.7,9.2)+tt*.3),fb(uv+4.*q+vec2(8.3,2.8)+tt*.4));
  float f=fb(uv+4.*r),ca=.005+clamp(sp*8.,0.,.018);
  vec2 cd=normalize(md+.001)*ca;
  vec3 col;
  col.r=mix(.01,.08,fb(uv+4.*r+cd*1.5));
  col.g=mix(.02,.06,f);
  col.b=mix(.03,.16,fb(uv+4.*r-cd*1.8));
  col+=pal(f+tt*.07)*(.18+.48*f);
  if(sp>.003){float h=t*.01+d*2.,k=clamp(sp*7.,0.,1.)*infl*.4;col.r=mix(col.r,sin(h)*.5+.5,k);col.g=mix(col.g,sin(h+2.094)*.5+.5,k);col.b=mix(col.b,sin(h+4.188)*.5+.5,k);}
  vec2 g=fract(uv*vec2(24.,14.));col+=(1.-min(smoothstep(0.,.03,g.x),smoothstep(0.,.03,g.y)))*.01*vec3(.3,.9,1.);
  vec2 vg=v*2.-1.;col*=1.-dot(vg,vg)*.62;
  gl_FragColor=vec4(col,1.);}`;

    const mk = (tp, src) => {
      const s = gl.createShader(tp);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const pg = gl.createProgram();
    gl.attachShader(pg, mk(gl.VERTEX_SHADER, VS));
    gl.attachShader(pg, mk(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pg);
    gl.useProgram(pg);

    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(pg, "p");
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

    const uT  = gl.getUniformLocation(pg, "t");
    const uM  = gl.getUniformLocation(pg, "m");
    const uVX = gl.getUniformLocation(pg, "vx");
    const uVY = gl.getUniformLocation(pg, "vy");
    const uSc = gl.getUniformLocation(pg, "sc");

    let mx=.5, my=.5, smx=.5, smy=.5, svx=0, svy=0, el=0, last=performance.now(), raf;

    const onMv = e => {
      mx = e.clientX / window.innerWidth;
      my = 1 - e.clientY / window.innerHeight;
    };
    document.addEventListener("mousemove", onMv, { passive: true });

    const loop = ts => {
      const dt = Math.min((ts - last) * .001, .05);
      last = ts; el += dt;
      const lf = 1 - Math.pow(.04, dt * 60);
      smx += (mx - smx) * lf; smy += (my - smy) * lf;
      svx += (mx - smx) * 8 * lf - svx * lf;
      svy += (my - smy) * 8 * lf - svy * lf;
      gl.uniform1f(uT, el);
      gl.uniform2f(uM, smx, smy);
      gl.uniform1f(uVX, svx);
      gl.uniform1f(uVY, svy);
      gl.uniform1f(uSc, window.scrollY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMv);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="bg-cv" />;
}

/* ═══════════ LENIS SMOOTH SCROLL ═══════════════════════════ */
function useLenis(cb) {
  useEffect(() => {
    let cleanup;
    (async () => {
      try {
        let L;
        try { L = (await import("lenis")).default; }
        catch { L = (await import("@studio-freight/lenis")).default; }

        const lenis = new L({
          duration: 1.15,
          easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        lenis.on("scroll", ({ scroll }) => {
          cb?.(scroll);
          ScrollTrigger.update();
        });

        // CRITICAL: GSAP ticker gives seconds, Lenis needs milliseconds
        const tick = time => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        cleanup = () => { lenis.destroy(); gsap.ticker.remove(tick); };
      } catch (e) {
        const fn = () => { cb?.(window.scrollY); };
        window.addEventListener("scroll", fn, { passive: true });
        cleanup = () => window.removeEventListener("scroll", fn);
      }
    })();
    return () => cleanup?.();
  }, [cb]);
}

/* ═══════════ GSAP SCROLL ANIMATIONS ════════════════════════ */
function useAnims(ready) {
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      // Per-character heading reveal — no external dep needed
      document.querySelectorAll("[data-split]").forEach(el => {
        el.innerHTML = el.textContent.split("").map(c =>
          c === " "
            ? `<span style="display:inline-block;width:.28em"> </span>`
            : `<span style="display:inline-block;overflow:hidden;vertical-align:top"><b style="display:block;transform:translateY(115%);font-weight:inherit">${c}</b></span>`
        ).join("");
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: () => gsap.to(el.querySelectorAll("b"), {
            y: 0, duration: .9, ease: "expo.out", stagger: .025,
          }),
        });
      });

      // Card reveals
      gsap.utils.toArray(".anim-card").forEach((c, i) => {
        gsap.from(c, {
          opacity: 0, y: 50, duration: .85, ease: "power3.out", delay: i * .07,
          scrollTrigger: { trigger: c, start: "top 87%", once: true },
        });
      });

      // Timeline items
      gsap.utils.toArray(".tl-item").forEach((item, i) => {
        gsap.from(item, {
          opacity: 0, x: -28, duration: .8, ease: "power3.out", delay: i * .1,
          scrollTrigger: { trigger: item, start: "top 86%", once: true },
          onComplete() { item.classList.add("in"); },
        });
      });

      // About text
      gsap.from(".about-p", {
        opacity: 0, y: 22, stagger: .1, duration: .8, ease: "power3.out",
        scrollTrigger: { trigger: ".about-ps", start: "top 82%", once: true },
      });

      // Cert cards
      gsap.from(".cert", {
        opacity: 0, x: 22, stagger: .09, duration: .7, ease: "power3.out",
        scrollTrigger: { trigger: ".certs", start: "top 82%", once: true },
      });

      // Stat counters
      document.querySelectorAll("[data-cnt]").forEach(el => {
        const v = +el.dataset.cnt, sx = el.dataset.sx || "";
        gsap.to({ n: 0 }, {
          n: v, duration: 2.2, ease: "power2.out", delay: .1,
          onUpdate() { el.textContent = Math.round(this.targets()[0].n) + sx; },
        });
      });
    }, 150);
    return () => clearTimeout(t);
  }, [ready]);
}

/* ═══════════ CURSOR ═════════════════════════════════════════ */
function Cursor() {
  const dot = useRef(null), ring = useRef(null);
  useEffect(() => {
    let cx=0, cy=0, rx=0, ry=0, raf;
    const mv = e => { cx = e.clientX; cy = e.clientY; };
    const dn = () => document.body.classList.add("cdn");
    const up = () => document.body.classList.remove("cdn");
    const tick = () => {
      rx += (cx - rx) * .11; ry += (cy - ry) * .11;
      if (dot.current)  dot.current.style.cssText  = `left:${cx}px;top:${cy}px`;
      if (ring.current) ring.current.style.cssText = `left:${rx}px;top:${ry}px`;
      raf = requestAnimationFrame(tick);
    };
    document.addEventListener("mousemove", mv, { passive: true });
    document.addEventListener("mousedown", dn);
    document.addEventListener("mouseup", up);
    raf = requestAnimationFrame(tick);
    setTimeout(() => {
      document.querySelectorAll("a,button").forEach(el => {
        el.addEventListener("mouseenter", () => document.body.classList.add("chv"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("chv"));
      });
    }, 900);
    return () => {
      document.removeEventListener("mousemove", mv);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div ref={dot}  className="cdot" />
      <div ref={ring} className="cring" />
    </>
  );
}

/* ═══════════ LOADER ═════════════════════════════════════════ */
function Loader({ onDone }) {
  const bar = useRef(null), pct = useRef(null), el = useRef(null);
  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 14 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        if (bar.current) bar.current.style.width = "100%";
        if (pct.current) pct.current.textContent = "100%";
        setTimeout(() => {
          el.current?.classList.add("done");
          setTimeout(onDone, 750);
        }, 280);
        return;
      }
      if (bar.current) bar.current.style.width = p + "%";
      if (pct.current) pct.current.textContent = Math.floor(p) + "%";
    }, 75);
    return () => clearInterval(id);
  }, [onDone]);
  return (
    <div ref={el} className="loader">
      <div className="lname">RITHVIK</div>
      <div className="ltrack"><div ref={bar} className="lbar" /></div>
      <div ref={pct} className="lpct">0%</div>
    </div>
  );
}

/* ═══════════ NAV ════════════════════════════════════════════ */
function Nav() {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const f = () => setSc(window.scrollY > 55);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <nav className={sc ? "nav nav-sc" : "nav"}>
      <a href="#hero" className="nlogo"><span className="ndim">~/ </span>rithvik.dev</a>
      <ul className="nlinks">
        {NAV.map(s => <li key={s}><a href={"#" + s}>{s}</a></li>)}
      </ul>
      <div className="nr">
        <span className="avail"><span className="adot" />Available Jun 2026</span>
        <a href="#contact" className="ncta">Hire Me</a>
      </div>
    </nav>
  );
}

/* ═══════════ MAGNETIC BUTTON ════════════════════════════════ */
function Btn({ href, primary, children }) {
  const r = useRef(null);
  const mv = e => {
    if (!r.current) return;
    const rc = r.current.getBoundingClientRect();
    r.current.style.transform =
      `translate(${(e.clientX - rc.left - rc.width  / 2) * .28}px,` +
               `${(e.clientY - rc.top  - rc.height / 2) * .28}px)`;
  };
  const lv = () => {
    if (!r.current) return;
    r.current.style.transition = "transform .5s cubic-bezier(.16,1,.3,1)";
    r.current.style.transform = "";
    setTimeout(() => { if (r.current) r.current.style.transition = ""; }, 500);
  };
  return (
    <a href={href} ref={r} onMouseMove={mv} onMouseLeave={lv}
       className={`btn${primary ? " btnp" : ""}`}>
      {primary && <span className="bfill" />}
      <span className="btxt">{children}</span>
    </a>
  );
}

/* ═══════════ HERO ═══════════════════════════════════════════ */
function Hero({ ready, sy }) {
  const [up, setUp] = useState(false);
  const tr = useRef(null);
  useEffect(() => { if (ready) setTimeout(() => setUp(true), 100); }, [ready]);
  useEffect(() => {
    if (tr.current) tr.current.style.transform = `translateY(${sy * .15}px)`;
  }, [sy]);
  return (
    <section id="hero" className="hero">
      <div className={`hey${up ? " up" : ""}`}>
        <span className="heyln" />
        Software Engineer · MS CS @ University at Buffalo
      </div>
      <h1 ref={tr} className="htitle">
        <span className="hw"><span className={`hl1${up ? " up" : ""}`}>SRI SAI</span></span>
        <span className="hw"><span className={`hl2${up ? " up" : ""}`}>RITHVIK</span></span>
      </h1>
      <p className={`hsub${up ? " up" : ""}`} style={{ transitionDelay: ".38s" }}>
        Backend engineer &amp; distributed systems architect.<br />
        Pipelines processing <em>8TB+/day</em>, APIs at <em>500+ QPS</em>,<br />
        systems delivering <em>9x speedups</em>.
      </p>
      <div className={`hact${up ? " up" : ""}`} style={{ transitionDelay: ".52s" }}>
        <Btn href="#projects" primary>View Work</Btn>
        <Btn href="#contact">Get In Touch</Btn>
      </div>
      <div className={`hstats${up ? " up" : ""}`} style={{ transitionDelay: ".68s" }}>
        {[[2,"+","Years Exp"],[8,"TB","Daily Volume"],[500,"+","QPS"],[9,"x","Max Speedup"]].map(([v,s,l]) => (
          <div key={l} className="hstat">
            <div className="hstatv" data-cnt={v} data-sx={s}>0{s}</div>
            <div className="hstatl">{l}</div>
          </div>
        ))}
      </div>
      <div className="shint"><div className="sln" /><span>Scroll</span></div>
    </section>
  );
}

/* ═══════════ ABOUT ══════════════════════════════════════════ */
function About() {
  return (
    <section id="about" className="sec sdk">
      <div className="sey">00 — About</div>
      <div className="agrid">
        <div>
          <h2 className="sh" data-split>Engineer. Architect. Builder.</h2>
          <div className="about-ps">
            <p className="about-p">MS Computer Science at <em>University at Buffalo</em>, graduating June 2026. Two years of production experience across distributed systems, real-time data pipelines, and cloud-native APIs.</p>
            <p className="about-p">I specialize at the <em>intersection of backend engineering and data infrastructure</em> — systems that handle millions of events, serve sub-second queries, and scale horizontally without drama.</p>
            <p className="about-p">Buffalo, NY · Open to relocation · <em>(716)-415-0990</em></p>
          </div>
        </div>
        <div className="certs">
          {CERTS.map(c => (
            <div key={c.b} className="cert anim-card">
              <div className="certb">{c.b}</div>
              <div>
                <div className="certn">{c.n}</div>
                <div className="certs2">{c.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ SKILLS ═════════════════════════════════════════ */
function Skills() {
  const glow = e => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", ((e.clientX - r.left) / r.width  * 100) + "%");
    e.currentTarget.style.setProperty("--my", ((e.clientY - r.top)  / r.height * 100) + "%");
  };
  return (
    <section id="skills" className="sec">
      <div className="sey">01 — Stack</div>
      <h2 className="sh" data-split>Core Systems</h2>
      <div className="sgrid">
        {SKILLS.map(sk => (
          <div key={sk.n} className="scard anim-card" onMouseMove={glow}>
            <div className="snum">{`// ${sk.n}`}</div>
            <div className="scat">{sk.cat}</div>
            <div className="stags">
              {sk.tags.map(t => <span key={t} className="stag">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ PROJECTS ═══════════════════════════════════════ */
function Projects() {
  return (
    <section id="projects" className="sec sdk">
      <div className="sey">02 — Work</div>
      <h2 className="sh" data-split>Selected Projects</h2>
      <div className="plist">
        {PROJECTS.map(p => (
          <div key={p.n} className={`pcard anim-card${p.ft ? " pft" : ""}`}>
            <div className="pacc" style={{ background: `linear-gradient(180deg,${p.color},transparent)` }} />
            <div className="pnum" style={{ color: p.color + "18" }}>{p.n}</div>
            <div className="pbody">
              <div className="ptag" style={{ color: p.color }}>{p.tag}</div>
              <h3 className={`ptitle${p.ft ? " pftitle" : ""}`}>{p.title}</h3>
              <p className="pdesc">{p.desc}</p>
              <div className="pstack">
                {p.stack.map(t => <span key={t} className="ptech" style={{ borderColor: p.color + "55", color: p.color }}>{t}</span>)}
              </div>
              <div className="pstats">
                {p.stats.map(([v, l]) => (
                  <div key={l} className="pst">
                    <span className="pstv" style={{ color: p.color }}>{v}</span>
                    <span className="pstl">{l}</span>
                  </div>
                ))}
              </div>
              <a href={p.url} target="_blank" rel="noopener noreferrer"
                 className="plink" style={{ "--lc": p.color }}>GitHub</a>
            </div>
            <div className="parr">↗</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ EXPERIENCE ═════════════════════════════════════ */
function Experience() {
  return (
    <section id="experience" className="sec">
      <div className="sey">03 — Experience</div>
      <h2 className="sh" data-split>Work History</h2>
      <div className="tl">
        {EXP.map((e, i) => (
          <div key={i} className="tl-item">
            <div className="tldot" />
            <div>
              <div className="tldate">{e.period}</div>
              <div className="tlrole">{e.role}</div>
              <div className="tlco">{e.co} — {e.loc}</div>
              <ul className="tlpts">
                {e.pts.map((p, j) => <li key={j}>{p}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ PUBLICATIONS ══════════════════════════════════ */
function Publications() {
  return (
    <section id="publications" className="sec sdk">
      <div className="sey">04 — Research</div>
      <h2 className="sh" data-split>Publications</h2>
      <div className="pub-list">
        {PUBS.map((p, i) => (
          <div key={i} className="pub-card anim-card">
            <div className="pub-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <div className="pub-body">
              <div className="pub-label">Peer-Reviewed Research</div>
              <h3 className="pub-title">{p.title}</h3>
              <ul className="pub-pts">
                {p.pts.map((pt, j) => <li key={j}>{pt}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ CONTACT ════════════════════════════════════════ */
function Contact() {
  return (
    <section id="contact" className="sec sdk contact">
      <h2 className="cbig" data-split>LETS WORK TOGETHER</h2>
      <p className="csub anim-card">Open to SDE · Data Engineering · Backend Infrastructure</p>
      <a href="mailto:srisairithvikthota@gmail.com" className="cemail anim-card">
        srisairithvikthota@gmail.com
      </a>
      <div className="clinks anim-card">
        {[
          ["Email",    "mailto:srisairithvikthota@gmail.com"],
          ["LinkedIn", "https://linkedin.com/in/rithvik-thota-48161b1a4"],
          ["GitHub",   "https://github.com/Rithvik-1012"],
          ["Call",     "tel:7164150990"],
        ].map(([l, h]) => (
          <a key={l} href={h}
             target={h.startsWith("http") ? "_blank" : undefined}
             rel="noopener noreferrer" className="cl">{l}</a>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ ROOT ═══════════════════════════════════════════ */
export default function App() {
  const [ready, setReady] = useState(false);
  const [sy, setSy]       = useState(0);
  const onSc = useCallback(y => setSy(y), []);
  useLenis(onSc);
  useAnims(ready);
  return (
    <>
      <WebGLBg />
      <div className="noise" />
      {!ready && <Loader onDone={() => setReady(true)} />}
      <Cursor />
      <Nav />
      <main>
        <Hero ready={ready} sy={sy} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Publications />
        <Contact />
      </main>
      <footer className="foot">
        <span>2026 Sri Sai Rithvik Thota</span>
        <span>React · Vite · WebGL · GSAP · Lenis</span>
      </footer>
    </>
  );
}
