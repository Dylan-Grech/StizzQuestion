import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { questions } from './questions';
import { getPastizzResult, getPastizzResultById } from './results';

const letters = ['A', 'B', 'C', 'D'];
function Brand() { return <div className="brand"><span>WHAT PASTIZZ</span><i>ARE YOU?</i></div>; }
function Progress({ value }) { return <div className="progress"><span style={{ width: `${value}%` }} /></div>; }

function HandScan({ onDone }) {
  const [handDetected, setHandDetected] = useState(false); const [handState, setHandState] = useState('searching'); const [progress, setProgress] = useState(0); const [camera, setCamera] = useState('loading'); const video = useRef(null); const seenFrames = useRef(0); const missedFrames = useRef(0);
  useEffect(() => {
    let stream; let detector; let frame; let active = true;
    const openScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (!active || !video.current) return;
        video.current.srcObject = stream; await video.current.play();
        setCamera('detecting');
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task', delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: .65, minHandPresenceConfidence: .65, minTrackingConfidence: .6 });
        if (!active) return;
        setCamera('ready');
        const detect = () => {
          if (!active || !video.current) return;
          const result = detector.detectForVideo(video.current, performance.now());
          const confidence = result.handednesses?.[0]?.[0]?.score ?? 0;
          const handVisible = result.landmarks.length > 0 && confidence >= .65;
          if (handVisible) {
            seenFrames.current += 1; missedFrames.current = 0;
            if (seenFrames.current < 6) setHandState('locking');
            if (seenFrames.current >= 6) { setHandDetected(true); setHandState('detected'); }
          } else {
            seenFrames.current = 0; missedFrames.current += 1;
            if (missedFrames.current >= 10) { setHandDetected(false); setHandState('searching'); }
          }
          frame = requestAnimationFrame(detect);
        };
        detect();
      } catch { if (active) setCamera('denied'); }
    };
    openScanner();
    return () => { active = false; cancelAnimationFrame(frame); detector?.close(); stream?.getTracks().forEach(track => track.stop()); };
  }, []);
  useEffect(() => { if (!handDetected || camera !== 'ready') return; const id = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(id); setTimeout(onDone, 650); return 100; } return p + 2; }), 45); return () => clearInterval(id); }, [handDetected, camera, onDone]);
  const scanning = handDetected && camera === 'ready';
  const scannerMessage = camera === 'loading' || camera === 'detecting' ? 'OPENING HAND SCANNER…' : camera === 'denied' ? <>CAMERA ACCESS<br />IS NEEDED</> : handState === 'locking' ? 'HAND FOUND · HOLD STEADY' : handState === 'searching' ? 'SHOW YOUR HAND' : null;
  return <main className="screen scan-screen"><Brand /><div className="scan-copy"><p className="eyebrow">FINAL CALIBRATION</p><h1>Let us read<br />your pastry aura.</h1><p>Hold your hand up to the camera, inside the scan area.</p></div><div className={`scanner ${scanning ? 'active' : ''} ${handState === 'locking' ? 'locking' : ''}`}><video ref={video} className="camera-feed" autoPlay muted playsInline /><div className="scan-grid" />{scannerMessage && <span className="camera-message">{scannerMessage}</span>}{scanning && <div className="scan-line" />}</div><div className="scan-status"><span>{scanning ? `HAND LOCKED · ${progress}%` : handState === 'locking' ? 'VERIFYING HAND' : camera === 'ready' ? 'AWAITING HAND' : 'CAMERA REQUIRED'}</span><Progress value={progress} /></div><p className="small-note">{scanning ? 'Perfect. Keep your hand in view…' : handState === 'locking' ? 'Almost there — hold still for a moment' : camera === 'ready' ? 'Place your hand in the circle to begin automatically' : 'Allow camera access in your browser to continue'}</p></main>;
}

function Paywall({ result }) {
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const pay = async () => { setLoading(true); setError(''); try { const r = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resultId: result.id }) }); const data = await r.json(); if (!r.ok || !data.url) throw new Error(data.error || 'Unable to open checkout.'); window.location.href = data.url; } catch (error) { setError(error.message); setLoading(false); } };
  return <main className="screen paywall"><Brand /><div className="peek"><span className="spark">✦</span><p>WE FOUND YOUR MATCH</p><div className="blurred">{result.name.toUpperCase()}</div></div><section className="offer"><p className="eyebrow">YOUR RESULT IS READY</p><h1>One tiny treat<br />for the big reveal.</h1><p>Unlock your complete pastizz profile, including your deliciously accurate personality read.</p><div className="price"><strong>€0.99</strong><span>one-time payment<br />no subscriptions, ever</span></div><button className="primary" onClick={pay} disabled={loading}>{loading ? 'Opening secure checkout…' : 'UNLOCK MY RESULT'} <b>→</b></button>{error && <p className="payment-error">{error}</p>}<small>Secure checkout powered by <strong>stripe</strong></small></section></main>;
}

function Result({ result }) { return <main className="screen result"><Brand /><div className="result-top"><p className="eyebrow">YOUR PASTIZZ IS</p><img src={result.image} alt={result.name} /><h1 className="result-name">{result.name}</h1><p className="result-type">{result.subtitle}</p></div><section className="result-card"><p>{result.text}</p><div>{result.traits.map(t => <span key={t}>{t}</span>)}</div></section></main>; }

function Quiz({ onComplete }) { const [step, setStep] = useState(0); const [answers, setAnswers] = useState([]); const q = questions[step]; const pick = answer => { const selections = [...answers, answer]; setAnswers(selections); setTimeout(() => step === questions.length - 1 ? onComplete(selections) : setStep(step + 1), 220); }; return <main className="screen quiz"><div className="quiz-head"><Brand /><span>{String(step + 1).padStart(2, '0')} / 15</span></div><Progress value={(step / 15) * 100} /><section className="question"><p className="eyebrow">QUESTION {String(step + 1).padStart(2, '0')}</p><h1>{q.title}</h1><div className="answers">{q.answers.map((a, i) => <button key={a} onClick={() => pick(i)}><b>{letters[i]}</b><span>{a}</span><i>→</i></button>)}</div></section></main>; }

function Landing({ start }) {
  const [launching, setLaunching] = useState(false);
  const launch = () => { if (launching) return; setLaunching(true); setTimeout(start, 520); };
  return <main className={`screen landing ${launching ? 'launching' : ''}`}><nav><Brand /><span>EST. 2026 · MALTA</span></nav><section className="hero"><div className="hero-art"><img src="/pastizz-hero.png" alt="Golden Maltese pastizz" /></div><p className="eyebrow">A VERY IMPORTANT QUESTION</p><h1>What pastizz<br /><em>are you?</em></h1><p className="lead">Fifteen questions. One flaky truth.<br />Find out what’s inside.</p><button className="primary" onClick={launch} disabled={launching}>{launching ? 'LET’S GO…' : <>FIND MY PASTIZZ <b>→</b></>}</button><p className="time">Takes about 2 minutes <span>•</span> 100% scientifically unscientific</p></section><footer><span>MADE WITH ♥ IN MALTA</span></footer></main>;
}

export default function App() {
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const [view, setView] = useState(sessionId ? 'verifying' : 'landing'); const [result, setResult] = useState(() => getPastizzResult());
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`).then(response => response.json().then(data => ({ response, data }))).then(({ response, data }) => {
      if (!response.ok || !data.paid) throw new Error('Payment could not be verified.');
      setResult(getPastizzResultById(data.resultId)); setView('result'); window.history.replaceState({}, '', '/');
    }).catch(() => { setView('landing'); window.history.replaceState({}, '', '/'); });
  }, [sessionId]);
  const finishQuiz = answers => { setResult(getPastizzResult(answers)); setView('scan'); };
  if (view === 'verifying') return <main className="screen scan-screen"><Brand /><div className="scan-copy"><p className="eyebrow">PAYMENT RECEIVED</p><h1>Unlocking your<br />pastizz result…</h1><p>We’re securely confirming your purchase.</p></div></main>;
  return view === 'landing' ? <Landing start={() => setView('quiz')} /> : view === 'quiz' ? <Quiz onComplete={finishQuiz} /> : view === 'scan' ? <HandScan onDone={() => setView('paywall')} /> : view === 'paywall' ? <Paywall result={result} /> : <Result result={result} />;
}
