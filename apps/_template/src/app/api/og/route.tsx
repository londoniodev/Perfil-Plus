import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return new Response('Missing tenantId', { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
    const response = await fetch(`${apiUrl}/tenant/branding/${tenantId}`, {
      headers: {
        'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key',
      },
    });

    let design: any = {};
    if (response.ok) {
      const data = await response.json();
      const rawDesign = data?.design ?? {};
      const brand = data?.brandSettings ?? {};
      
      design = {
        name: data?.name || 'Mi Negocio',
        tagline: brand.tagline || data?.tagline || 'Visita nuestra tienda',
        logo: brand.logoUrl || brand.faviconUrl || data?.logo || null,
        primary: brand.primaryColor || rawDesign.colors?.primary || '#000000',
      };
    } else {
      design = {
        name: 'Mi Negocio',
        tagline: 'Visita nuestra tienda',
        primary: '#000000',
        logo: null
      };
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            backgroundImage: `radial-gradient(circle at center, ${design.primary}35 0%, #09090b 100%)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 25 }}>
            {design.logo ? (
              <div style={{ display: 'flex', borderRadius: '24px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', boxShadow: `0 10px 30px ${design.primary}60` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={design.logo} 
                  alt="logo" 
                  width="130"
                  height="130"
                  style={{ 
                    width: 130, 
                    height: 130, 
                    objectFit: 'cover',
                  }} 
                />
              </div>
            ) : (
              <div 
                style={{ 
                  width: 130, 
                  height: 130, 
                  backgroundColor: design.primary, 
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#fff',
                  boxShadow: `0 10px 30px ${design.primary}60`
                }}
              >
                {design.name.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div style={{ fontSize: 56, fontStyle: 'normal', fontWeight: 800, color: 'white', textAlign: 'center', letterSpacing: '-0.025em', marginBottom: 8, maxWidth: '80%' }}>
            {design.name}
          </div>
          <div style={{ fontSize: 22, fontStyle: 'normal', color: '#a1a1aa', textAlign: 'center', maxWidth: '70%' }}>
            {design.tagline}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image Generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
