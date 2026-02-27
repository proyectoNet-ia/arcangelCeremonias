import { supabase } from '../lib/supabase';

export interface ContactMessage {
    id?: string;
    created_at?: string;
    name: string;
    phone: string;
    subject: string;
    message: string;
    is_read?: boolean;
    email_sent?: boolean;
}

export const contactService = {
    async sendMessage(message: ContactMessage) {
        // 1. Guardar en Supabase
        // NOTA: Eliminamos .select() para evitar error 401 en usuarios no autenticados
        const { error } = await supabase
            .from('contact_messages')
            .insert([message]);

        if (error) throw error;

        // 2. Intentar enviar por Resend (Opcional - Lado Cliente)
        const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
        if (resendApiKey) {
            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${resendApiKey}`,
                    },
                    body: JSON.stringify({
                        from: 'Arcangel Ceremonias <onboarding@resend.dev>',
                        to: ['ventas@arcangelceremonias.com'],
                        subject: `Nuevo Mensaje: ${message.subject}`,
                        html: `
                            <h1>Nuevo mensaje de contacto</h1>
                            <p><strong>De:</strong> ${message.name}</p>
                            <p><strong>Teléfono:</strong> ${message.phone}</p>
                            <p><strong>Asunto:</strong> ${message.subject}</p>
                            <p><strong>Mensaje:</strong></p>
                            <p>${message.message}</p>
                        `,
                    }),
                });
            } catch (err) {
                console.error('Error enviando email via Resend:', err);
            }
        }

        return { success: true };
    },

    async getMessages() {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as ContactMessage[];
    },

    async markAsRead(id: string) {
        const { error } = await supabase
            .from('contact_messages')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteMessage(id: string) {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
