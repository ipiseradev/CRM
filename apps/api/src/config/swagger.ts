import { Express, Request, Response } from 'express';

export function setupSwagger(app: Express) {
  // Swagger JSON endpoint
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'SalesCore API',
        version: '1.0.0',
        description: 'CRM API para gestión de ventas y clientes',
      },
      servers: [
        { url: 'http://localhost:4000', description: 'Development server' },
      ],
      paths: {
        '/api/auth/register': {
          post: {
            description: 'Register new user and company',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password', 'name', 'companyName'],
                    properties: {
                      email: { type: 'string' },
                      password: { type: 'string' },
                      name: { type: 'string' },
                      companyName: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
        '/api/auth/login': {
          post: {
            description: 'Login user',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string' },
                      password: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '200': { description: 'OK' } },
          },
        },
        '/api/auth/me': {
          get: {
            description: 'Get current user',
            security: [{ bearerAuth: [] }],
            responses: { '200': { description: 'OK' } },
          },
        },
        '/api/clients': {
          get: {
            description: 'List clients with pagination',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'limit', in: 'query', schema: { type: 'integer' } },
              { name: 'offset', in: 'query', schema: { type: 'integer' } },
              { name: 'search', in: 'query', schema: { type: 'string' } },
            ],
            responses: { '200': { description: 'OK' } },
          },
          post: {
            description: 'Create new client',
            security: [{ bearerAuth: [] }],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'phone'],
                    properties: {
                      name: { type: 'string' },
                      phone: { type: 'string' },
                      email: { type: 'string' },
                      notes: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
        '/api/clients/{id}': {
          get: {
            description: 'Get client by ID',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'OK' } },
          },
          patch: {
            description: 'Update client',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'OK' } },
          },
          delete: {
            description: 'Delete client',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '204': { description: 'No Content' } },
          },
        },
        '/api/deals': {
          get: {
            description: 'List deals with pagination',
            security: [{ bearerAuth: [] }],
            responses: { '200': { description: 'OK' } },
          },
          post: {
            description: 'Create new deal',
            security: [{ bearerAuth: [] }],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['title', 'value', 'client_id', 'stage'],
                    properties: {
                      title: { type: 'string' },
                      value: { type: 'number' },
                      client_id: { type: 'string' },
                      stage: { type: 'string' },
                      close_date: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
        '/api/deals/{id}': {
          get: {
            description: 'Get deal by ID',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'OK' } },
          },
          patch: {
            description: 'Update deal',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'OK' } },
          },
          delete: {
            description: 'Delete deal',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '204': { description: 'No Content' } },
          },
        },
        '/api/tasks': {
          get: {
            description: 'List tasks',
            security: [{ bearerAuth: [] }],
            responses: { '200': { description: 'OK' } },
          },
          post: {
            description: 'Create new task',
            security: [{ bearerAuth: [] }],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['title', 'related_type', 'related_id', 'due_date'],
                    properties: {
                      title: { type: 'string' },
                      related_type: { type: 'string', enum: ['CLIENT', 'DEAL'] },
                      related_id: { type: 'string' },
                      due_date: { type: 'string' },
                      done: { type: 'boolean' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
        '/api/tasks/{id}': {
          get: {
            description: 'Get task by ID',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'OK' } },
          },
          patch: {
            description: 'Update task',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'OK' } },
          },
          delete: {
            description: 'Delete task',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '204': { description: 'No Content' } },
          },
        },
        '/api/activities': {
          get: {
            description: 'List activities',
            security: [{ bearerAuth: [] }],
            responses: { '200': { description: 'OK' } },
          },
        },
        '/api/metrics/summary': {
          get: {
            description: 'Get metrics summary',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'period', in: 'query', schema: { type: 'string', enum: ['today', 'week', 'month', 'year'] } },
            ],
            responses: { '200': { description: 'OK' } },
          },
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    });
  });

  // Swagger UI endpoint
  app.get('/api-docs', (req: Request, res: Response) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SalesCore API - Documentación</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUI({ url: '/api-docs.json', dom_id: '#swagger-ui' });
  </script>
</body>
</html>`;
    res.send(html);
  });
}

export default setupSwagger;
