"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
const pool = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
});
async function seed() {
    console.log('🌱 Seeding database with demo data...\n');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // ─── Clean existing demo data ──────────────────────────────
        await client.query(`DELETE FROM activities WHERE company_id IN (SELECT id FROM companies WHERE name = 'TechVentas AR')`);
        await client.query(`DELETE FROM tasks WHERE company_id IN (SELECT id FROM companies WHERE name = 'TechVentas AR')`);
        await client.query(`DELETE FROM deals WHERE company_id IN (SELECT id FROM companies WHERE name = 'TechVentas AR')`);
        await client.query(`DELETE FROM clients WHERE company_id IN (SELECT id FROM companies WHERE name = 'TechVentas AR')`);
        await client.query(`DELETE FROM users WHERE company_id IN (SELECT id FROM companies WHERE name = 'TechVentas AR')`);
        await client.query(`DELETE FROM companies WHERE name = 'TechVentas AR'`);
        // ─── Company ──────────────────────────────────────────────
        const companyResult = await client.query(`
      INSERT INTO companies (name, primary_color)
      VALUES ('TechVentas AR', '#6366f1')
      RETURNING id
    `);
        const companyId = companyResult.rows[0].id;
        console.log(`✅ Company created: TechVentas AR (${companyId})`);
        // ─── Admin User ───────────────────────────────────────────
        const passwordHash = await bcryptjs_1.default.hash('demo1234', 12);
        const adminResult = await client.query(`
      INSERT INTO users (company_id, name, email, password_hash, role)
      VALUES ($1, 'Ignacio Martínez', 'admin@salescore.demo', $2, 'ADMIN')
      RETURNING id
    `, [companyId, passwordHash]);
        const adminId = adminResult.rows[0].id;
        console.log(`✅ Admin user created: admin@salescore.demo / demo1234`);
        // Extra user
        await client.query(`
      INSERT INTO users (company_id, name, email, password_hash, role)
      VALUES ($1, 'Valentina López', 'valen@salescore.demo', $2, 'USER')
    `, [companyId, passwordHash]);
        // ─── Clients (Argentine demo data) ───────────────────────
        const clientsData = [
            { name: 'Grupo Clarín Digital', phone: '+54 11 4309-7000', email: 'ventas@grupoclarin.com', notes: 'Interesados en plan enterprise. Contacto principal: Diego Fernández.' },
            { name: 'MercadoShops SRL', phone: '+54 11 5352-1000', email: 'compras@mercadoshops.com.ar', notes: 'Buscan integración con WhatsApp Business API.' },
            { name: 'Despegar.com Argentina', phone: '+54 11 5199-3000', email: 'b2b@despegar.com', notes: 'Evaluando CRM para equipo de 15 vendedores.' },
            { name: 'Naranja X Fintech', phone: '+54 351 410-9000', email: 'tech@naranjax.com', notes: 'Requieren multi-tenant y SSO.' },
            { name: 'OLX Argentina', phone: '+54 11 4000-1234', email: 'ops@olx.com.ar', notes: 'Piloto con 5 usuarios. Decisión en 30 días.' },
            { name: 'Rappi Argentina', phone: '+54 11 3987-5500', email: 'partners@rappi.com.ar', notes: 'Necesitan API para integrar con su sistema interno.' },
            { name: 'Ualá Finanzas', phone: '+54 11 5263-8800', email: 'ventas@uala.com.ar', notes: 'Startup en crecimiento. Presupuesto limitado pero potencial alto.' },
            { name: 'Tiendanube Argentina', phone: '+54 11 5984-2200', email: 'growth@tiendanube.com', notes: 'Quieren automatizar seguimiento de leads por WhatsApp.' },
            { name: 'Pedidos Ya Local', phone: '+54 11 4567-8900', email: 'comercial@pedidosya.com.ar', notes: 'Reunión agendada para el 15 del mes.' },
            { name: 'Banco Galicia Digital', phone: '+54 11 6329-0000', email: 'digital@bancogalicia.com.ar', notes: 'Proceso de licitación formal. Requieren SOC2.' },
            { name: 'Aerolíneas Argentinas Cargo', phone: '+54 11 4340-7777', email: 'cargo@aerolineas.com.ar', notes: 'Interesados en módulo de actividades y pipeline.' },
            { name: 'Frávega Tecnología', phone: '+54 11 5555-3333', email: 'b2b@fravega.com', notes: 'Cadena retail. 200+ vendedores potenciales.' },
            { name: 'Garbarino Online', phone: '+54 11 4444-2222', email: 'ecommerce@garbarino.com.ar', notes: 'Migración desde Salesforce. Buscan solución más económica.' },
            { name: 'Personal Flow Streaming', phone: '+54 11 4968-4000', email: 'digital@personalflow.com.ar', notes: 'Equipo de ventas B2B de 8 personas.' },
            { name: 'Coto Digital SA', phone: '+54 11 4302-5000', email: 'digital@coto.com.ar', notes: 'Supermercado. Interesados en gestión de proveedores.' },
        ];
        const clientIds = [];
        for (const c of clientsData) {
            const r = await client.query(`
        INSERT INTO clients (company_id, name, phone, email, notes)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [companyId, c.name, c.phone, c.email, c.notes]);
            clientIds.push(r.rows[0].id);
        }
        console.log(`✅ ${clientIds.length} clients created`);
        // ─── Deals ────────────────────────────────────────────────
        const now = new Date();
        const dealsData = [
            // WON deals (this month)
            { clientIdx: 0, title: 'Plan Enterprise Anual - Clarín', value: 480000, stage: 'WON', daysAgo: 5 },
            { clientIdx: 1, title: 'Integración WhatsApp API - MercadoShops', value: 120000, stage: 'WON', daysAgo: 8 },
            { clientIdx: 3, title: 'Licencias Enterprise x50 - Naranja X', value: 360000, stage: 'WON', daysAgo: 12 },
            // LOST deals
            { clientIdx: 9, title: 'Licitación CRM - Banco Galicia', value: 900000, stage: 'LOST', daysAgo: 15 },
            { clientIdx: 12, title: 'Migración Salesforce - Garbarino', value: 240000, stage: 'LOST', daysAgo: 20 },
            // Active pipeline
            { clientIdx: 2, title: 'CRM Equipo Ventas x15 - Despegar', value: 180000, stage: 'QUOTE_SENT', daysAgo: 3 },
            { clientIdx: 4, title: 'Piloto 5 usuarios - OLX', value: 45000, stage: 'CONTACTED', daysAgo: 2 },
            { clientIdx: 5, title: 'API Integration Pack - Rappi', value: 95000, stage: 'WAITING', daysAgo: 7 },
            { clientIdx: 6, title: 'Plan Startup - Ualá', value: 36000, stage: 'NEW', daysAgo: 1 },
            { clientIdx: 7, title: 'WhatsApp Automation - Tiendanube', value: 72000, stage: 'CONTACTED', daysAgo: 4 },
            { clientIdx: 8, title: 'Demo + Propuesta - Pedidos Ya', value: 60000, stage: 'QUOTE_SENT', daysAgo: 6 },
            { clientIdx: 10, title: 'Módulo Pipeline - Aerolíneas Cargo', value: 150000, stage: 'WAITING', daysAgo: 10 },
            { clientIdx: 11, title: 'CRM Retail x200 - Frávega', value: 720000, stage: 'CONTACTED', daysAgo: 3 },
            { clientIdx: 13, title: 'Equipo Ventas B2B - Personal Flow', value: 96000, stage: 'NEW', daysAgo: 1 },
            { clientIdx: 14, title: 'Gestión Proveedores - Coto Digital', value: 84000, stage: 'NEW', daysAgo: 2 },
        ];
        const dealIds = [];
        for (const d of dealsData) {
            const createdAt = new Date(now);
            createdAt.setDate(createdAt.getDate() - d.daysAgo);
            const closeDate = new Date(now);
            closeDate.setDate(closeDate.getDate() + 30);
            const r = await client.query(`
        INSERT INTO deals (company_id, client_id, title, value, stage, close_date, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [
                companyId,
                clientIds[d.clientIdx],
                d.title,
                d.value,
                d.stage,
                closeDate.toISOString().split('T')[0],
                createdAt.toISOString(),
            ]);
            dealIds.push(r.rows[0].id);
        }
        console.log(`✅ ${dealIds.length} deals created`);
        // ─── Tasks ────────────────────────────────────────────────
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const in3days = new Date(now);
        in3days.setDate(in3days.getDate() + 3);
        const in7days = new Date(now);
        in7days.setDate(in7days.getDate() + 7);
        const in14days = new Date(now);
        in14days.setDate(in14days.getDate() + 14);
        const tasksData = [
            // Overdue
            { related_type: 'DEAL', relatedIdx: 5, title: 'Enviar propuesta actualizada a Despegar', due: yesterday, done: false },
            { related_type: 'CLIENT', relatedIdx: 4, title: 'Llamar a OLX para confirmar piloto', due: yesterday, done: false },
            // Today
            { related_type: 'DEAL', relatedIdx: 7, title: 'Demo WhatsApp Automation con Tiendanube', due: now, done: false },
            { related_type: 'CLIENT', relatedIdx: 8, title: 'Reunión con Pedidos Ya - cierre de propuesta', due: now, done: false },
            // Upcoming
            { related_type: 'DEAL', relatedIdx: 10, title: 'Follow-up Aerolíneas Cargo - módulo pipeline', due: tomorrow, done: false },
            { related_type: 'CLIENT', relatedIdx: 11, title: 'Presentación ejecutiva Frávega', due: in3days, done: false },
            { related_type: 'DEAL', relatedIdx: 6, title: 'Enviar contrato a Ualá Finanzas', due: in3days, done: false },
            { related_type: 'CLIENT', relatedIdx: 5, title: 'Revisión técnica API con Rappi', due: in7days, done: false },
            { related_type: 'DEAL', relatedIdx: 12, title: 'Negociación precio Frávega x200 licencias', due: in7days, done: false },
            { related_type: 'CLIENT', relatedIdx: 13, title: 'Onboarding Personal Flow', due: in14days, done: false },
            // Done
            { related_type: 'DEAL', relatedIdx: 0, title: 'Firma contrato Clarín Digital', due: new Date(now.getTime() - 5 * 86400000), done: true },
            { related_type: 'DEAL', relatedIdx: 1, title: 'Activación cuenta MercadoShops', due: new Date(now.getTime() - 8 * 86400000), done: true },
        ];
        for (const t of tasksData) {
            const relatedId = t.related_type === 'DEAL' ? dealIds[t.relatedIdx] : clientIds[t.relatedIdx];
            await client.query(`
        INSERT INTO tasks (company_id, related_type, related_id, title, due_date, done)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [companyId, t.related_type, relatedId, t.title, t.due.toISOString(), t.done]);
        }
        console.log(`✅ ${tasksData.length} tasks created`);
        // ─── Activities ───────────────────────────────────────────
        const activitiesData = [
            { related_type: 'CLIENT', relatedIdx: 0, type: 'CALL', content: 'Llamada inicial con Diego Fernández. Muy interesado en plan enterprise. Solicita demo para la próxima semana.', daysAgo: 10 },
            { related_type: 'DEAL', relatedIdx: 0, type: 'MEETING', content: 'Demo del producto con equipo técnico de Clarín. Excelente recepción. Aprobaron presupuesto.', daysAgo: 7 },
            { related_type: 'DEAL', relatedIdx: 0, type: 'WHATSAPP', content: 'Confirmación por WhatsApp: "Perfecto, procedemos con el contrato anual. Gracias!"', daysAgo: 5 },
            { related_type: 'CLIENT', relatedIdx: 1, type: 'WHATSAPP', content: 'Primer contacto por WhatsApp. Interesados en integración con su plataforma de e-commerce.', daysAgo: 12 },
            { related_type: 'DEAL', relatedIdx: 1, type: 'CALL', content: 'Llamada técnica con CTO de MercadoShops. Validaron la API de WhatsApp. Cerramos trato.', daysAgo: 8 },
            { related_type: 'CLIENT', relatedIdx: 2, type: 'MEETING', content: 'Reunión presencial en oficinas de Despegar. Presentamos el módulo de pipeline. Muy buena recepción.', daysAgo: 5 },
            { related_type: 'DEAL', relatedIdx: 5, type: 'NOTE', content: 'Enviamos propuesta formal por email. Valor: $180.000 ARS/mes. Esperamos respuesta en 5 días hábiles.', daysAgo: 3 },
            { related_type: 'CLIENT', relatedIdx: 5, type: 'WHATSAPP', content: 'Rappi confirmó reunión técnica para revisar documentación de la API. Muy interesados.', daysAgo: 6 },
            { related_type: 'DEAL', relatedIdx: 7, type: 'CALL', content: 'Llamada con equipo de growth de Tiendanube. Quieren automatizar 500+ conversaciones diarias por WhatsApp.', daysAgo: 4 },
            { related_type: 'CLIENT', relatedIdx: 11, type: 'MEETING', content: 'Reunión con gerente comercial de Frávega. Tienen 200 vendedores en 50 sucursales. Oportunidad enorme.', daysAgo: 3 },
            { related_type: 'DEAL', relatedIdx: 12, type: 'NOTE', content: 'Frávega solicitó propuesta para 200 licencias con descuento por volumen. Preparando cotización especial.', daysAgo: 2 },
            { related_type: 'CLIENT', relatedIdx: 3, type: 'CALL', content: 'Naranja X requiere integración SSO con Azure AD. Nuestro equipo técnico confirmó viabilidad.', daysAgo: 15 },
            { related_type: 'DEAL', relatedIdx: 3, type: 'WHATSAPP', content: '¡Contrato firmado! Naranja X activa 50 licencias enterprise. Onboarding programado para la próxima semana.', daysAgo: 12 },
            { related_type: 'CLIENT', relatedIdx: 6, type: 'WHATSAPP', content: 'Ualá nos contactó por LinkedIn. Startup en etapa B. Buscan CRM económico pero escalable.', daysAgo: 2 },
            { related_type: 'CLIENT', relatedIdx: 8, type: 'CALL', content: 'Pedidos Ya quiere ver demo esta semana. Tienen equipo de 12 vendedores B2B para restaurantes.', daysAgo: 7 },
        ];
        for (const a of activitiesData) {
            const relatedId = a.related_type === 'DEAL' ? dealIds[a.relatedIdx] : clientIds[a.relatedIdx];
            const createdAt = new Date(now);
            createdAt.setDate(createdAt.getDate() - a.daysAgo);
            await client.query(`
        INSERT INTO activities (company_id, related_type, related_id, type, content, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [companyId, a.related_type, relatedId, a.type, a.content, createdAt.toISOString()]);
        }
        console.log(`✅ ${activitiesData.length} activities created`);
        await client.query('COMMIT');
        console.log('\n🎉 Seed completed successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    admin@salescore.demo');
        console.log('🔑 Password: demo1234');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seed failed:', err);
        throw err;
    }
    finally {
        client.release();
        await pool.end();
    }
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map