import { useState } from "react";
import { PhraseWord } from "../../../components/phrase-word.component";

const TARGET_URL = 'www.cadenanorte.com/epcc';
const COVER_IMAGE_URL = 'https://eduroamfiles.t3.tigrisfiles.io/ctf/step3/noticia-epcc.jpg'; // Rellena con la URL de la imagen de portada

function HomePage() {
    return (
        <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#003399', margin: '0 0 8px' }}>Bienvenido a Internet Explorer</h2>
            <p style={{ color: '#666', fontSize: 13 }}>Introduzca una dirección en la barra y pulse Ir o Enter.</p>
        </div>
    );
}

function ErrorPage({ url }: { url: string }) {
    return (
        <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#cc0000', margin: '0 0 12px' }}>No se puede mostrar la página</h2>
            <p style={{ margin: '0 0 8px' }}>Internet Explorer no puede mostrar la página web que ha solicitado.</p>
            <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '12px 0' }} />
            <p style={{ margin: '0 0 4px', fontSize: 13 }}><strong>Dirección:</strong> http://{url}</p>
            <p style={{ fontSize: 12, color: '#666', margin: '8px 0 0' }}>
                Es posible que el servidor esté caído o que la dirección no sea correcta.<br />
                Compruebe la dirección e inténtelo de nuevo.
            </p>
            <ul style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                <li>Asegúrese de que está conectado a Internet.</li>
                <li>Compruebe que la dirección no contiene errores tipográficos.</li>
                <li>Inténtelo más tarde.</li>
            </ul>
        </div>
    );
}

function ArticlePage() {
    return (
        <div style={{ fontFamily: 'Georgia, serif', maxWidth: 700, margin: '0 auto', padding: 24 }}>
            {/* Cabecera del periódico */}
            <div style={{ borderBottom: '3px solid #003366', marginBottom: 16, paddingBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#888', letterSpacing: 2, textTransform: 'uppercase' }}>
                    CadenaNorte.com
                </p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 'bold', color: '#003366', fontFamily: 'Arial, sans-serif' }}>
                    Cadena Norte
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#888' }}>El periódico del norte · 5 de abril de 2026</p>
            </div>

            {/* Sección */}
            <p style={{ margin: '0 0 8px', fontSize: 11, color: '#003366', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                Tecnología
            </p>

            {/* Titular */}
            <h1 style={{ margin: '0 0 8px', fontSize: 26, lineHeight: 1.2, color: '#111', fontFamily: 'Georgia, serif' }}>
                La Escuela Politécnica de Cáceres aprueba la instalación de antenas de Robofónica
            </h1>

            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>
                Por la Redacción · 5 de abril de 2026, 09:15
            </p>

            {/* Imagen de portada */}
            {COVER_IMAGE_URL ? (
                <img
                    src={COVER_IMAGE_URL}
                    alt="Imagen de portada"
                    style={{ width: '100%', maxHeight: 320, objectFit: 'cover', marginBottom: 8 }}
                />
            ) : (
                <div style={{
                    width: '100%', height: 220, background: '#e8e8e8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 8, border: '1px solid #ccc',
                }}>
                    <span style={{ color: '#aaa', fontSize: 13 }}>[Imagen de portada]</span>
                </div>
            )}
            <p style={{ margin: '0 0 20px', fontSize: 11, color: '#999', textAlign: 'center' }}>
                Antenas instaladas en el campus de la EPCC. / Robofónica
            </p>

            {/* Cuerpo del artículo */}
            <div style={{ fontSize: 15, lineHeight: 1.8, color: '#222' }}>
                <p>
                    La Escuela Politécnica de Cáceres (EPCC) ha dado luz verde a un ambicioso proyecto de modernización
                    de su infraestructura de comunicaciones. En una reunión extraordinaria celebrada el pasado viernes,
                    <PhraseWord word="la" /> junta directiva de la escuela aprobó por unanimidad un acuerdo con la empresa de telecomunicaciones
                    <strong> Robofónica</strong> para la instalación de antenas 5G en todo el campus universitario.
                </p>
                <p>
                    La iniciativa nace como respuesta directa a las reiteradas quejas del alumnado sobre el deficiente
                    funcionamiento de <em>eduroam</em>, la red inalámbrica institucional compartida por universidades
                    de toda Europa. "Llevamos años aguantando cortes continuos, páginas que no cargan y desconexiones
                    en mitad de los exámenes online", declaró un estudiante de Ingeniería Informática que prefirió
                    no ser identificado. "La situación es insostenible."
                </p>
                <p>
                    Robofónica, con amplia experiencia en el despliegue de redes en entornos universitarios,
                    instalará un total de doce antenas distribuidas estratégicamente por el edificio principal,
                    la biblioteca, los laboratorios y las zonas de estudio al aire libre. Según los términos del acuerdo,
                    las obras comenzarán el próximo mes y la red estará plenamente operativa antes de que
                    finalice el presente curso académico.
                </p>
                <p>
                    El director de la EPCC se mostró optimista ante el proyecto: "Este acuerdo con Robofónica
                    supone un salto cualitativo enorme para nuestra comunidad universitaria. La conectividad
                    es hoy en día tan esencial como cualquier otra infraestructura del campus, y nuestros
                    estudiantes merecen las mejores condiciones para desarrollar su formación."
                </p>
                <p>
                    Desde Robofónica aseguran que la tecnología 5G desplegada ofrecerá velocidades de descarga
                    de hasta 1 Gbps en las zonas de mayor cobertura, lo que permitirá al alumnado trabajar
                    con recursos en la nube, realizar videoconferencias y acceder a plataformas educativas
                    sin interrupciones ni caídas de señal.
                </p>
                <p>
                    La instalación, que se financiará parcialmente mediante fondos europeos de digitalización
                    universitaria, ha generado una reacción mayoritariamente positiva entre los estudiantes,
                    aunque algunos han expresado sus dudas sobre los plazos anunciados. Los representantes
                    de Robofónica han garantizado que el proyecto se ejecutará dentro de los tiempos acordados
                    y que habrá una fase de pruebas antes de la puesta en marcha definitiva. <PhraseWord word="contraseña" />
                </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '24px 0 16px' }} />
            <p style={{ fontSize: 11, color: '#aaa' }}>
                © 2026 CadenaNorte.com · Todos los derechos reservados
            </p>
        </div>
    );
}

export const BrowserRoute = () => {
    const [input, setInput] = useState('');
    const [current, setCurrent] = useState<string | null>(null);

    const navigate = async () => {
        const clean = input.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
        setCurrent(clean || null);
        if (clean === TARGET_URL) {
            fetch('/api/step2/url-accessed', {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
        }
    };

    const goHome = () => { setCurrent(null); setInput(''); };

    const statusText = current === null
        ? 'Listo'
        : current === TARGET_URL
            ? `http://${TARGET_URL}`
            : 'No se puede mostrar la página';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', fontFamily: 'Arial, sans-serif' }}>
            {/* Barra de herramientas IE */}
            <div style={{ background: '#ece9d8', borderBottom: '2px solid #aca899', padding: '3px 6px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <button style={{ fontSize: 11, padding: '1px 6px' }} onClick={goHome}>← Atrás</button>
                    <button style={{ fontSize: 11, padding: '1px 6px' }} disabled>→ Adelante</button>
                    <button style={{ fontSize: 11, padding: '1px 6px' }} onClick={goHome} title="Inicio">🏠</button>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1, marginLeft: 4 }}>
                        <span style={{ fontSize: 11, whiteSpace: 'nowrap' }}>Dirección:</span>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && navigate()}
                            style={{ flex: 1, fontSize: 11, padding: '2px 4px', border: '1px solid #7f9db9' }}
                            placeholder="http://"
                        />
                        <button style={{ fontSize: 11, padding: '1px 10px' }} onClick={navigate}>
                            Ir
                        </button>
                    </div>
                </div>
            </div>

            {/* Área de contenido */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
                {current === null && <HomePage />}
                {current !== null && current === TARGET_URL && <ArticlePage />}
                {current !== null && current !== TARGET_URL && <ErrorPage url={current} />}
            </div>

            {/* Barra de estado */}
            <div style={{
                background: '#ece9d8', borderTop: '1px solid #aca899',
                padding: '1px 8px', fontSize: 11, color: '#444', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 8,
            }}>
                <span>{statusText}</span>
            </div>
        </div>
    );
};
