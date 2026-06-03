'use client';

import { useEffect, useRef } from 'react';

type NodeKind = 'core' | 'agent' | 'api';
interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  r: number;
  kind: NodeKind;
  label: string;
  hue: number;
  pulse: number;
  active: boolean;
}
interface Edge {
  a: number;
  b: number;
  flow: number;
}

const AGENT_LABELS = ['Data', 'Chain', 'Venice', 'Exec'];
const API_LABELS = [
  'DeFiLlama',
  'Etherscan',
  'CoinGecko',
  'Uniswap',
  'Venice AI',
  'Aave',
  'Compound',
  'RPC',
];

export interface AgentNetworkProps {
  className?: string;
  active?: boolean;
}

export function AgentNetwork({ className, active = true }: AgentNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const tRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const layoutNodes = (): { nodes: Node[]; edges: Edge[] } => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h * 0.55;

      const nodes: Node[] = [
        {
          x: cx,
          y: cy,
          baseX: cx,
          baseY: cy,
          r: 18,
          kind: 'core',
          label: 'DELEGATE',
          hue: 27,
          pulse: 0,
          active: true,
        },
      ];

      const agentRadius = Math.min(w, h) * 0.22;
      const apiRadius = Math.min(w, h) * 0.4;

      AGENT_LABELS.forEach((label, i) => {
        const angle = -Math.PI / 2 + (Math.PI / (AGENT_LABELS.length - 1)) * i - Math.PI / 2;
        const a = (i / (AGENT_LABELS.length - 1)) * Math.PI + Math.PI; // bottom arc
        const x = cx + Math.cos(a) * agentRadius;
        const y = cy - Math.sin(a) * agentRadius;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          r: 9,
          kind: 'agent',
          label,
          hue: 270,
          pulse: Math.random() * Math.PI * 2,
          active: true,
        });
      });

      API_LABELS.forEach((label, i) => {
        const a = (i / API_LABELS.length) * Math.PI * 2;
        const x = cx + Math.cos(a) * apiRadius;
        const y = cy + Math.sin(a) * apiRadius * 0.65;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          r: 4,
          kind: 'api',
          label,
          hue: 0,
          pulse: Math.random() * Math.PI * 2,
          active: false,
        });
      });

      const edges: Edge[] = [];
      // core → agents
      for (let i = 1; i <= AGENT_LABELS.length; i++) {
        edges.push({ a: 0, b: i, flow: 0 });
      }
      // each agent → 2 apis
      const apiOffset = 1 + AGENT_LABELS.length;
      for (let i = 0; i < AGENT_LABELS.length; i++) {
        const ai = 1 + i;
        const api1 = apiOffset + (i * 2) % API_LABELS.length;
        const api2 = apiOffset + (i * 2 + 1) % API_LABELS.length;
        edges.push({ a: ai, b: api1, flow: 0 });
        edges.push({ a: ai, b: api2, flow: 0 });
      }

      return { nodes, edges };
    };

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    let { nodes, edges } = layoutNodes();

    const onResize = () => {
      resize();
      ({ nodes, edges } = layoutNodes());
    };
    window.addEventListener('resize', onResize);

    const tick = () => {
      tRef.current += 0.012;
      const t = tRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // background gradient halo
      const grad = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.4);
      grad.addColorStop(0, 'rgba(246,133,27,0.10)');
      grad.addColorStop(0.5, 'rgba(124,58,237,0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // gently drift nodes
      for (const n of nodes) {
        n.x = n.baseX + Math.sin(t + n.pulse) * (n.kind === 'core' ? 2 : 4);
        n.y = n.baseY + Math.cos(t + n.pulse * 1.3) * (n.kind === 'core' ? 2 : 4);
      }

      // edges with flowing dashes
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const isOrange = a.kind === 'core';
        const baseAlpha = isOrange ? 0.35 : 0.18;
        const color = isOrange
          ? `rgba(246,133,27,${baseAlpha})`
          : `rgba(124,58,237,${baseAlpha})`;

        ctx.strokeStyle = color;
        ctx.lineWidth = isOrange ? 1.2 : 0.8;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -t * 30;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        if (active && Math.sin(t * 1.5 + e.a + e.b) > 0.8) {
          // flow pulse
          const pt = (Math.sin(t * 1.5 + e.a + e.b) + 1) / 2;
          const px = a.x + (b.x - a.x) * pt;
          const py = a.y + (b.y - a.y) * pt;
          ctx.beginPath();
          ctx.fillStyle = isOrange ? '#F6851B' : '#7C3AED';
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.setLineDash([]);

      // nodes
      for (const n of nodes) {
        const pulse = (Math.sin(t * 2 + n.pulse) + 1) / 2;
        const glowR = n.r + 4 + pulse * 6;
        const color =
          n.kind === 'core'
            ? '#F6851B'
            : n.kind === 'agent'
              ? '#7C3AED'
              : 'rgba(255,255,255,0.5)';

        // halo
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR * 2);
        g.addColorStop(0, color);
        g.addColorStop(0.3, color.startsWith('#') ? color + '55' : color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.globalAlpha = n.kind === 'api' ? 0.4 : 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(n.x - n.r * 0.3, n.y - n.r * 0.3, n.r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // label
        if (n.kind === 'core' || n.kind === 'agent') {
          ctx.font = `${n.kind === 'core' ? 700 : 500} ${n.kind === 'core' ? 11 : 9}px ui-sans-serif`;
          ctx.fillStyle = n.kind === 'core' ? '#fff' : 'rgba(255,255,255,0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y + n.r + 14);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? 'absolute inset-0 h-full w-full'}
    />
  );
}
