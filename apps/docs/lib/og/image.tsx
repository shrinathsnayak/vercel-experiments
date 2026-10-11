import { ImageResponse } from 'next/og';
import {
  categoryLabels,
  type ExperimentCategory,
  type ExperimentDifficulty,
} from '@/lib/experiments';
import { getLogoDataUrl } from '@/lib/brand-assets';
import { appName, siteUrl } from '@/lib/shared';
import {
  categoryOgColors,
  difficultyOgLabels,
  ogBrand,
  ogSize,
  truncateOgText,
} from './theme';

export type OgImageInput = {
  title: string;
  description?: string;
  category?: ExperimentCategory;
  difficulty?: ExperimentDifficulty;
  /** Small eyebrow above the title (defaults to site name). */
  eyebrow?: string;
};

function Chip({
  label,
  background,
  color,
}: {
  label: string;
  background: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 18px',
        borderRadius: 999,
        background,
        color,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: '0.02em',
        border: `1px solid ${ogBrand.line}`,
      }}
    >
      {label}
    </div>
  );
}

export function OgImageMarkup({
  title,
  description,
  category,
  difficulty,
  eyebrow,
  logoSrc,
}: OgImageInput & { logoSrc: string }) {
  const accent = category ? categoryOgColors[category] : null;
  const glow = accent?.glow ?? ogBrand.blueGlow;
  const safeTitle = truncateOgText(title, 64);
  const safeDescription = description
    ? truncateOgText(description, 140)
    : undefined;
  // Share cards should never advertise a local dev host.
  const host = (() => {
    try {
      const parsed = new URL(siteUrl);
      if (
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1'
      ) {
        return 'vercel-experiments.com';
      }
      return parsed.host;
    } catch {
      return 'vercel-experiments.com';
    }
  })();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: ogBrand.ink,
        color: ogBrand.text,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            `radial-gradient(circle at 18% 20%, ${glow} 0%, transparent 42%),` +
            `radial-gradient(circle at 86% 12%, ${ogBrand.blueGlow} 0%, transparent 34%),` +
            `radial-gradient(circle at 72% 88%, rgba(255,255,255,0.06) 0%, transparent 40%),` +
            'linear-gradient(160deg, #070A10 0%, #0B1220 48%, #05070C 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: 999,
          right: -80,
          top: -120,
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: 999,
          left: -100,
          bottom: -140,
          background: `radial-gradient(circle, ${ogBrand.blueGlow} 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 10,
          background: `linear-gradient(90deg, ${ogBrand.blue} 0%, #38BDF8 50%, ${ogBrand.blue} 100%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '56px 64px 52px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 72,
                height: 72,
                borderRadius: 18,
                background: ogBrand.panel,
                border: `1px solid ${ogBrand.line}`,
                boxShadow: `0 0 0 1px rgba(0,112,243,0.15), 0 18px 50px ${glow}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} width={48} height={48} alt="" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                {appName}
              </div>
              <div style={{ fontSize: 22, color: ogBrand.muted }}>
                {eyebrow ?? 'Deployable Next.js & Vercel labs'}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {category ? (
              <Chip
                label={categoryLabels[category]}
                background={accent?.bg ?? ogBrand.chipBg}
                color={accent?.text ?? ogBrand.text}
              />
            ) : null}
            {difficulty ? (
              <Chip
                label={difficultyOgLabels[difficulty]}
                background={ogBrand.chipBg}
                color={ogBrand.muted}
              />
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 'auto',
            gap: 22,
            maxWidth: 980,
            paddingTop: 28,
            paddingBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: safeTitle.length > 42 ? 68 : 78,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {safeTitle}
          </div>
          {safeDescription ? (
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: ogBrand.muted,
                maxWidth: 920,
              }}
            >
              {safeDescription}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: `1px solid ${ogBrand.line}`,
            paddingTop: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: ogBrand.muted,
              fontSize: 24,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: ogBrand.blue,
                boxShadow: `0 0 18px ${ogBrand.blueSoft}`,
              }}
            />
            Independent · MIT · Not affiliated with Vercel
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: ogBrand.text,
              letterSpacing: '-0.01em',
            }}
          >
            {host}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function createOgImage(input: OgImageInput) {
  const logoSrc = await getLogoDataUrl();
  return new ImageResponse(<OgImageMarkup {...input} logoSrc={logoSrc} />, {
    ...ogSize,
  });
}
