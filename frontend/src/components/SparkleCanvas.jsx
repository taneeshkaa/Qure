import { useEffect, useRef } from 'react';

/* ── Scroll-reactive sparkle/star particle canvas ─────────── */

const SEA = 'rgba(11,158,135,';
const GOLD = 'rgba(255,210,80,';
const WHITE = 'rgba(255,255,255,';

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function spawnParticle(canvas) {
    const x = randomBetween(0, canvas.width);
    const y = randomBetween(0, canvas.height);
    const size = randomBetween(1.5, 4);
    const color = Math.random() < 0.55 ? SEA : Math.random() < 0.6 ? GOLD : WHITE;
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(0.3, 1.4);
    const twinkleSpeed = randomBetween(0.02, 0.06);
    const twinkleOffset = randomBetween(0, Math.PI * 2);
    const type = Math.random() < 0.6 ? 'star' : 'circle'; // star or dot
    return { x, y, size, color, angle, speed, twinkleSpeed, twinkleOffset, alpha: randomBetween(0.3, 0.9), age: 0, maxAge: randomBetween(180, 400), vx: 0, vy: 0, type };
}

function drawStar(ctx, x, y, r, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color + '1)';
    ctx.shadowColor = color + '0.8)';
    ctx.shadowBlur = r * 3;
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const outer = (i * Math.PI * 4) / 5 - Math.PI / 2;
        const inner = outer + Math.PI / 5;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(outer) * r, Math.sin(outer) * r);
        ctx.lineTo(Math.cos(inner) * (r * 0.42), Math.sin(inner) * (r * 0.42));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawCircle(ctx, x, y, r, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + '1)';
    ctx.shadowColor = color + '0.9)';
    ctx.shadowBlur = r * 4;
    ctx.fill();
    ctx.restore();
}

export default function SparkleCanvas() {
    const canvasRef = useRef(null);
    const scrollVelRef = useRef(0);
    const lastScrollRef = useRef(0);
    const animRef = useRef(null);
    const particlesRef = useRef([]);
    const frameRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        /* resize */
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        /* scroll velocity tracking */
        const onScroll = () => {
            const y = window.scrollY;
            scrollVelRef.current = y - lastScrollRef.current;
            lastScrollRef.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        /* seed initial particles */
        for (let i = 0; i < 55; i++) particlesRef.current.push(spawnParticle(canvas));

        /* animation loop */
        const tick = () => {
            animRef.current = requestAnimationFrame(tick);
            frameRef.current++;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const vel = scrollVelRef.current;
            /* decay scroll velocity */
            scrollVelRef.current *= 0.88;

            /* occasionally spawn burst particles when scrolling fast */
            if (Math.abs(vel) > 8 && Math.random() < 0.35) {
                for (let i = 0; i < 3; i++) {
                    const p = spawnParticle(canvas);
                    p.x = randomBetween(0, canvas.width);
                    p.y = randomBetween(0, canvas.height);
                    p.size = randomBetween(2.5, 5.5);
                    p.vy = vel * 0.25;
                    p.vx = randomBetween(-1.5, 1.5);
                    p.maxAge = 90;
                    particlesRef.current.push(p);
                }
            }

            /* cap total particles */
            if (particlesRef.current.length > 90) {
                particlesRef.current.splice(0, particlesRef.current.length - 90);
            }

            const dead = [];
            particlesRef.current.forEach((p, i) => {
                p.age++;
                const lifeRatio = p.age / p.maxAge;

                /* alpha with twinkle + fade at ends */
                const twinkle = Math.sin(p.age * p.twinkleSpeed + p.twinkleOffset);
                const basealpha = p.alpha * (lifeRatio < 0.12 ? lifeRatio / 0.12 : lifeRatio > 0.85 ? (1 - lifeRatio) / 0.15 : 1);
                const alpha = Math.max(0, basealpha * (0.7 + twinkle * 0.3));

                /* drift — blend natural drift with scroll velocity */
                const naturalVY = Math.sin(p.angle) * p.speed * 0.35;
                const naturalVX = Math.cos(p.angle) * p.speed * 0.25;
                p.vy = p.vy * 0.92 + (naturalVY + vel * 0.12) * 0.08;
                p.vx = p.vx * 0.95 + naturalVX * 0.05;
                p.x += p.vx;
                p.y += p.vy;

                /* wrap around edges */
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;

                if (p.age >= p.maxAge) { dead.push(i); return; }

                if (p.type === 'star') drawStar(ctx, p.x, p.y, p.size, alpha, p.color);
                else drawCircle(ctx, p.x, p.y, p.size * 0.7, alpha, p.color);
            });

            /* remove dead, replace with fresh */
            dead.reverse().forEach(i => particlesRef.current.splice(i, 1));
            while (particlesRef.current.length < 55) particlesRef.current.push(spawnParticle(canvas));
        };

        tick();

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1,
                pointerEvents: 'none',
                opacity: 0.9,
            }}
        />
    );
}
