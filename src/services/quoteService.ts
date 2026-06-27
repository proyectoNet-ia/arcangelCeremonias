import { supabase } from '../lib/supabase';
import { configService, SiteConfig } from './configService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuoteItem } from '../context/QuoteContext';

// Helper para convertir una URL de imagen a base64
async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Error fetching image for PDF:", e);
        return "";
    }
}

export interface QuoteUserData {
    name: string;
    company: string;
    phone: string;
    email: string;
}

export const quoteService = {
    async generateQuotePDF(
        user: QuoteUserData,
        items: QuoteItem[],
        totalAmount: number,
        config: SiteConfig | null
    ): Promise<Blob> {
        const doc = new jsPDF();
        let currentY = 20;

        // Agregar Logo si existe (usando preferentemente el logo_light_url para fondos claros/PDF)
        const logoUrl = config?.logo_light_url || config?.logo_dark_url;
        if (logoUrl) {
            const logoBase64 = await getBase64ImageFromUrl(logoUrl);
            if (logoBase64) {
                // Ajustar proporciones de la imagen (simplificado)
                doc.addImage(logoBase64, 'PNG', 14, 15, 40, 20); // asumiendo aspect ratio aprox 2:1
            }
        } else if (config?.company_name) {
            doc.setFontSize(22);
            doc.setTextColor(config.primary_color || '#000000');
            doc.text(config.company_name, 14, 25);
        }

        // Título
        doc.setFontSize(18);
        doc.setTextColor('#333333');
        doc.text("COTIZACIÓN", 140, 25);
        
        doc.setFontSize(10);
        doc.setTextColor('#666666');
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 32);

        currentY = 45;

        // Datos de la empresa (con control de ancho para evitar mezcla con datos del cliente)
        doc.setFontSize(11);
        doc.setTextColor('#333333');
        doc.text("Datos de la Empresa:", 14, currentY);
        doc.setFontSize(9);
        doc.setTextColor('#666666');
        currentY += 6;
        if (config?.company_name) {
            const lines = doc.splitTextToSize(config.company_name, 80);
            doc.text(lines, 14, currentY);
            currentY += (lines.length * 5);
        }
        if (config?.address) {
            const lines = doc.splitTextToSize(config.address, 80);
            doc.text(lines, 14, currentY);
            currentY += (lines.length * 5);
        }
        if (config?.phone || config?.whatsapp) {
            const phoneText = `Tel: ${config.phone || config.whatsapp}`;
            const lines = doc.splitTextToSize(phoneText, 80);
            doc.text(lines, 14, currentY);
            currentY += (lines.length * 5);
        }
        if (config?.email) {
            const emailText = `Email: ${config.email}`;
            const lines = doc.splitTextToSize(emailText, 80);
            doc.text(lines, 14, currentY);
            currentY += (lines.length * 5);
        }

        let userY = 45;
        // Datos del cliente (con control de ancho de 95)
        doc.setFontSize(11);
        doc.setTextColor('#333333');
        doc.text("Datos del Cliente:", 100, userY);
        doc.setFontSize(9);
        doc.setTextColor('#666666');
        userY += 6;
        
        const nameLines = doc.splitTextToSize(`Nombre: ${user.name}`, 95);
        doc.text(nameLines, 100, userY);
        userY += (nameLines.length * 5);

        if (user.company) {
            const companyLines = doc.splitTextToSize(`Empresa: ${user.company}`, 95);
            doc.text(companyLines, 100, userY);
            userY += (companyLines.length * 5);
        }

        const phoneLines = doc.splitTextToSize(`Teléfono: ${user.phone}`, 95);
        doc.text(phoneLines, 100, userY);
        userY += (phoneLines.length * 5);

        const emailLines = doc.splitTextToSize(`Email: ${user.email}`, 95);
        doc.text(emailLines, 100, userY);
        userY += (emailLines.length * 5);

        currentY = Math.max(currentY, userY) + 10;

        // Tabla de productos con Columna "Modelo"
        const tableColumn = ["Modelo", "Producto", "Cantidad", "Precio Unitario", "Total"];
        const tableRows = items.map(item => {
            let itemName = item.name;
            if (item.size || item.color) {
                itemName += `\n(${item.size ? 'Talla: ' + item.size : ''}${item.size && item.color ? ' | ' : ''}${item.color ? 'Color: ' + item.color : ''})`;
            }
            return [
                item.code || "-",
                itemName,
                item.quantity.toString(),
                `$${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `$${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ];
        });

        autoTable(doc, {
            startY: currentY,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: config?.primary_color || '#333333' },
            margin: { top: 10 }
        });

        const finalY = (doc as any).lastAutoTable.finalY || currentY;

        // Total
        doc.setFontSize(14);
        doc.setTextColor('#000000');
        doc.text(`Total Cotizado: $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 140, finalY + 15);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor('#999999');
        doc.text("Este documento es una cotización informativa y está sujeto a cambios.", 14, 280);

        return doc.output('blob');
    },

    async submitQuote(
        user: QuoteUserData,
        items: QuoteItem[],
        totalAmount: number,
        pdfBlob: Blob
    ): Promise<boolean> {
        try {
            // 1. Subir PDF al Storage
            const fileName = `cotizacion_${user.name.replace(/\\s+/g, '_')}_${Date.now()}.pdf`;
            const { data: storageData, error: storageError } = await supabase
                .storage
                .from('quotes_pdfs')
                .upload(fileName, pdfBlob, {
                    contentType: 'application/pdf',
                    cacheControl: '3600',
                    upsert: false
                });

            if (storageError) {
                console.error("Error uploading PDF:", storageError);
                throw storageError;
            }

            // 2. Obtener la URL pública
            const { data: publicUrlData } = supabase
                .storage
                .from('quotes_pdfs')
                .getPublicUrl(fileName);

            const pdfUrl = publicUrlData.publicUrl;

            // Generar UUID en el cliente
            const quoteId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });

            // 3. Guardar en la tabla quotes (sin .select().single() para evitar error 401 por falta de permisos SELECT para anon)
            const { error: quoteError } = await supabase
                .from('quotes')
                .insert({
                    id: quoteId,
                    user_name: user.name,
                    user_company: user.company,
                    user_phone: user.phone,
                    user_email: user.email,
                    total_amount: totalAmount,
                    pdf_url: pdfUrl,
                    status: 'pending'
                });

            if (quoteError) throw quoteError;

            // 4. Guardar items de la cotización
            const quoteItemsInsert = items.map(item => {
                let nameWithDetails = item.name;
                if (item.code) {
                    nameWithDetails = `[${item.code}] ${nameWithDetails}`;
                }
                if (item.size || item.color) {
                    nameWithDetails += ` (${item.size ? 'Talla: ' + item.size : ''}${item.size && item.color ? ' | ' : ''}${item.color ? 'Color: ' + item.color : ''})`;
                }
                return {
                    quote_id: quoteId,
                    product_id: item.id,
                    product_name: nameWithDetails,
                    quantity: item.quantity,
                    unit_price: item.price
                };
            });

            const { error: itemsError } = await supabase
                .from('quote_items')
                .insert(quoteItemsInsert);

            if (itemsError) throw itemsError;

            // 5. Enviar correo de notificación via Resend (Opcional - Lado Cliente)
            const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
            if (resendApiKey) {
                try {
                    // Obtener el correo configurado en el sistema
                    let businessEmail = 'ventasesbasa@gmail.com';
                    try {
                        const config = await configService.getConfig();
                        if (config?.email) {
                            businessEmail = config.email;
                        }
                    } catch (err) {
                        console.error("Error fetching config for email notification:", err);
                    }

                    const cleanPhone = user.phone.replace(/\D/g, '');
                    const waPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
                    const waMessage = encodeURIComponent(`Hola ${user.name}, gracias por cotizar con nosotros. Recibimos tu cotización por un total de $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}.`);
                    const waLink = `https://wa.me/${waPhone}?text=${waMessage}`;

                    const itemsHtml = items.map(item => {
                        let nameWithDetails = item.name;
                        if (item.size || item.color) {
                            nameWithDetails += ` (${item.size ? 'Talla: ' + item.size : ''}${item.size && item.color ? ' | ' : ''}${item.color ? 'Color: ' + item.color : ''})`;
                        }
                        return `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #EAEAEA; font-size: 14px; color: #333333;">${item.code || '-'}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #EAEAEA; font-size: 14px; color: #333333;">${nameWithDetails}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #EAEAEA; font-size: 14px; color: #333333; text-align: center;">${item.quantity}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #EAEAEA; font-size: 14px; color: #333333; text-align: right;">$${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #EAEAEA; font-size: 14px; color: #333333; text-align: right;">$${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        `;
                    }).join('');

                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${resendApiKey}`,
                        },
                        body: JSON.stringify({
                            from: import.meta.env.VITE_RESEND_FROM_EMAIL || 'Arcangel Ceremonias <onboarding@resend.dev>',
                            to: [businessEmail],
                            subject: `Nueva Cotización: ${user.name} - $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
                            html: `
                                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #EAEAEA; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                                    <!-- Header -->
                                    <div style="background-color: #3E2723; padding: 30px; text-align: center;">
                                        <h1 style="color: #C5A059; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">Arcángel Ceremonias</h1>
                                        <p style="color: #FFFFFF; margin: 5px 0 0 0; font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Notificación de Nueva Cotización</p>
                                    </div>
                                    
                                    <!-- Content -->
                                    <div style="padding: 30px; background-color: #FFFFFF;">
                                        <h2 style="color: #3E2723; font-size: 18px; margin-top: 0; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">Datos del Cliente</h2>
                                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 14px; color: #666666; width: 120px;"><strong>Nombre:</strong></td>
                                                <td style="padding: 6px 0; font-size: 14px; color: #333333;">${user.name}</td>
                                            </tr>
                                            \${user.company ? \`
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 14px; color: #666666;"><strong>Empresa:</strong></td>
                                                <td style="padding: 6px 0; font-size: 14px; color: #333333;">\${user.company}</td>
                                            </tr>
                                            \` : ''}
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 14px; color: #666666;"><strong>Teléfono:</strong></td>
                                                <td style="padding: 6px 0; font-size: 14px; color: #333333;">${user.phone}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 14px; color: #666666;"><strong>Email:</strong></td>
                                                <td style="padding: 6px 0; font-size: 14px; color: #333333;">${user.email}</td>
                                            </tr>
                                        </table>

                                        <h2 style="color: #3E2723; font-size: 18px; border-bottom: 2px solid #C5A059; padding-bottom: 10px;">Detalle de la Cotización</h2>
                                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                            <thead>
                                                <tr style="background-color: #F9F9F9;">
                                                    <th style="padding: 10px; text-align: left; font-size: 12px; color: #666666; text-transform: uppercase; border-bottom: 2px solid #EAEAEA;">Mod.</th>
                                                    <th style="padding: 10px; text-align: left; font-size: 12px; color: #666666; text-transform: uppercase; border-bottom: 2px solid #EAEAEA;">Producto</th>
                                                    <th style="padding: 10px; text-align: center; font-size: 12px; color: #666666; text-transform: uppercase; border-bottom: 2px solid #EAEAEA;">Cant.</th>
                                                    <th style="padding: 10px; text-align: right; font-size: 12px; color: #666666; text-transform: uppercase; border-bottom: 2px solid #EAEAEA;">P. Unit</th>
                                                    <th style="padding: 10px; text-align: right; font-size: 12px; color: #666666; text-transform: uppercase; border-bottom: 2px solid #EAEAEA;">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                \${itemsHtml}
                                            </tbody>
                                        </table>

                                        <div style="text-align: right; margin-bottom: 30px;">
                                            <p style="font-size: 16px; color: #666666; margin: 0;">Total Cotizado:</p>
                                            <p style="font-size: 24px; color: #3E2723; font-weight: bold; margin: 5px 0 0 0;">$${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>

                                        <!-- Acciones -->
                                        <div style="text-align: center; margin-top: 35px; margin-bottom: 10px;">
                                            <a href="\${pdfUrl}" target="_blank" style="display: block; padding: 14px 20px; background-color: #C5A059; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Descargar PDF de Cotización</a>
                                            
                                            <a href="\${waLink}" target="_blank" style="display: block; padding: 14px 20px; background-color: #25D366; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Contactar al Cliente por WhatsApp</a>
                                        </div>
                                    </div>
                                    
                                    <!-- Footer -->
                                    <div style="background-color: #F9F9F9; padding: 20px; text-align: center; border-top: 1px solid #EAEAEA;">
                                        <p style="color: #999999; font-size: 12px; margin: 0;">Este es un correo automático generado por el sitio web Arcángel Ceremonias.</p>
                                    </div>
                                </div>
                            `,
                        }),
                    });
                } catch (err) {
                    console.error('Error enviando email de cotización via Resend:', err);
                }
            }

            return true;
        } catch (error) {
            console.error("Error submitting quote:", error);
            return false;
        }
    }
};
