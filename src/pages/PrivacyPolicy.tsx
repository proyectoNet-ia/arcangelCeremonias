import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/common/PageHero';
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-cream flex flex-col font-sans">
            <Header variant="light" />

            <PageHero 
                title="Aviso de Privacidad" 
                subtitle="Protección y tratamiento de datos personales"
                image="https://images.unsplash.com/photo-1575424909138-46b05e5919ec?q=80&w=2000&auto=format&fit=crop"
            />

            <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-20 md:py-32">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="prose prose-sm md:prose-base prose-slate max-w-none 
                               prose-headings:font-serif prose-headings:text-chocolate 
                               prose-p:text-chocolate/80 prose-li:text-chocolate/80
                               prose-strong:text-chocolate prose-strong:font-bold"
                >
                    <p className="lead text-lg md:text-xl text-chocolate/90 font-medium mb-12">
                        En cumplimiento al deber de resguardo de información y de datos personales y con fundamento en los dispuesto por los artículos 3 fracción I, 8, 12, 15, 16 y demás relativos de la Ley Federal de Protección de Datos Personales en Posesión de Particulares, GRUPO ESPINOZA BÁEZ S.A. DE C.V., con nombre comercial GRUPO ESPINOZA BÁEZ S.A. DE C.V., pone a su disposición el presente Aviso de Privacidad.
                    </p>

                    <h2 className="text-2xl mt-12 mb-6">Identidad y Domicilio del Responsable de la Protección de Datos Personales</h2>
                    <p>
                        GRUPO ESPINOZA BÁEZ S.A. DE C.V., con nombre comercial GRUPO ESPINOZA BÁEZ S.A. DE C.V., ubicado en IGUALDAD 200, EJIDO DE POTRERILLOS, LA PIEDAD MICHOACÁN, CP 59310, es la persona responsable del uso y protección de sus datos personales.
                    </p>

                    <h2 className="text-2xl mt-12 mb-6">Datos Personales Utilizados</h2>
                    <p>Para llevar a cabo las finalidades descritas en este Aviso de Privacidad, haremos uso de los siguientes datos personales:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-8">
                        <li>Datos de identificación</li>
                        <li>Datos de facturación</li>
                    </ul>

                    <h2 className="text-2xl mt-12 mb-6">Cookies, Web Beacons y Tecnologías Similares</h2>
                    <p>
                        Utilizamos cookies, web beacons y/o tecnologías similares para mejorar su experiencia en nuestro sitio web. Estas herramientas recopilan información como su dirección IP, tipo de navegador, páginas visitadas y la duración de su visita. Esta información se puede utilizar para analizar tendencias, administrar el sitio y mejorar nuestros servicios. Puede deshabilitar estas tecnologías en la configuración de su navegador, pero tenga en cuenta que esto podría afectar la funcionalidad del sitio.
                    </p>

                    <h2 className="text-2xl mt-12 mb-6">Medidas de Seguridad y Tiempo de Conservación</h2>
                    <p>
                        Hemos implementado medidas de seguridad técnicas, administrativas y físicas para resguardar la seguridad de sus datos personales, cumpliendo con los estándares legales.
                    </p>
                    <p>
                        La retención de sus datos se extenderá por un periodo de 5 años, en consonancia con los propósitos expuestos en este aviso y los plazos legales correspondientes.
                    </p>

                    <h2 className="text-2xl mt-12 mb-6">Finalidades del Tratamiento de Datos Personales</h2>
                    <p>Utilizaremos los datos recabados para las siguientes finalidades, que son necesarias para el servicio solicitado:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>Finalidad de contacto, aclaraciones y comunicación</li>
                        <li>Finalidad de facturación y cobro</li>
                        <li>Finalidad de envío y entrega de productos y servicios</li>
                        <li>Finalidad de establecer una relación comercial</li>
                    </ul>
                    <p>De manera adicional, utilizaremos su información personal para las siguientes finalidades, que no son necesarias para el servicio solicitado, pero que nos permiten y facilitan brindarle una mejor atención:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-8">
                        <li>Finalidad de enviar información promocional</li>
                    </ul>

                    <h2 className="text-2xl mt-12 mb-6">Transferencias de Datos que se Efectúen</h2>
                    <p>
                        No compartiremos sus datos personales con terceros, salvo por requerimientos legales. Los datos serán utilizados exclusivamente para los fines señalados en este Aviso de Privacidad.
                    </p>

                    <h2 className="text-2xl mt-12 mb-6">Medios para Ejercer los Derechos de Acceso, Rectificación, Cancelación u Oposición</h2>
                    <p>
                        Usted tiene el derecho de conocer los datos personales que tenemos sobre usted, así como su utilización y las condiciones bajo las cuales son tratados (Derecho de Acceso). De igual manera, le asiste el derecho de solicitar la corrección de su información personal en caso de estar desactualizada, inexacta o incompleta (Derecho de Rectificación); requerir la eliminación de sus datos de nuestros registros o bases de datos si considera que su uso no concuerda con los principios, deberes y obligaciones establecidos por la normativa (Derecho de Cancelación); así como oponerse al tratamiento de sus datos personales para fines específicos (Derecho de Oposición). Estos derechos son conocidos como derechos ARCO.
                    </p>
                    <p>
                        A continuación, proporcionamos los datos de contacto de la persona o departamento encargado de gestionar las solicitudes relacionadas con los derechos ARCO:
                    </p>
                    <div className="bg-white/50 p-6 border border-gold/20 my-6">
                        <ul className="space-y-2">
                            <li><strong>Nombre:</strong> JOSÉ PAULO ESPINOZA BÁEZ</li>
                            <li><strong>Domicilio:</strong> IGUALDAD 200, EJIDO DE POTRERILLOS, LA PIEDAD MICHOACÁN, CP 59310</li>
                            <li><strong>Teléfono:</strong> +52 352 526 2502</li>
                            <li><strong>Correo electrónico:</strong> grupoesbasa@gmail.com</li>
                        </ul>
                    </div>
                    <p>
                        Si desea ejercer los derechos de acceso, rectificación, cancelación u oposición del tratamiento de sus datos personales o limitar su divulgación, puede presentar la solicitud respectiva a través de la siguiente dirección electrónica: <a href="http://www.grupoesbasa.com" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">www.grupoesbasa.com</a>
                    </p>
                    <p>La respuesta a su solicitud será comunicada de la siguiente manera:</p>
                    <p>Las respuestas serán enviadas por número de teléfono o por medio de WhatsApp Business al número proporcionado por el solicitante.</p>
                    <p>El plazo para brindar respuesta a su solicitud será el siguiente: De 5 a 7 días hábiles.</p>

                    <h2 className="text-2xl mt-12 mb-6">Opciones y Medios que el Responsable Ofrezca a los Titulares para Limitar el Uso o Divulgación de los Datos</h2>
                    <p>
                        Si desea revocar el consentimiento otorgado para el tratamiento de sus datos personales o limitar su divulgación, puede presentar la solicitud respectiva a través del siguiente correo electrónico: <a href="mailto:grupoesbasa@gmail.com" className="text-gold hover:underline">grupoesbasa@gmail.com</a>
                    </p>
                    <p>La comunicación de la respuesta a la solicitud de revocación o limitación de divulgación de sus datos se llevará a cabo de la siguiente forma:</p>
                    <p>Las respuestas serán enviadas por correo electrónico a la dirección proporcionada por el solicitante.</p>
                    <p>La respuesta a la solicitud de revocación o limitación de divulgación de sus datos se proporcionará en un plazo máximo de: 10 días hábiles.</p>

                    <h2 className="text-2xl mt-12 mb-6">Cambios al Aviso de Privacidad</h2>
                    <p>
                        El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad; de cambios en nuestro modelo de negocio, o por otras causas, por lo cual, nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad, sin embargo, usted puede solicitar información sobre si el mismo ha sufrido algún cambio a través de la siguiente dirección electrónica: <a href="http://www.grupoesbasa.com/solicitud" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">www.grupoesbasa.com/solicitud</a>
                    </p>
                    
                    <p className="text-sm text-chocolate/50 mt-16 text-right font-medium">
                        Última actualización: 08 de junio de 2026
                    </p>
                </motion.div>
            </main>

            <Footer />
            <ScrollToTopButton />
        </div>
    );
};

export default PrivacyPolicy;
