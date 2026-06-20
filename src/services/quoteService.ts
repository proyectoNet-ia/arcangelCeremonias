import { supabase } from '../lib/supabase';
import { SiteConfig } from './configService';
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

            return true;
        } catch (error) {
            console.error("Error submitting quote:", error);
            return false;
        }
    }
};
