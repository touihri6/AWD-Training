/**
 * ============================================================================
 *  swagger/swagger.js — Configuration OpenAPI 3 + Swagger UI
 * ============================================================================
 *
 *  Ce fichier :
 *   1. Déclare le document OpenAPI de base (métadonnées, schémas, composants
 *      réutilisables).
 *   2. Utilise swagger-jsdoc pour scanner les blocs @swagger dans les routes.
 *
 *  Résultat : une spec OpenAPI 3 complète servie par Swagger UI sur /api-docs.
 * ============================================================================
 */

'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const path         = require('path');

const openApiDefinition = {
  openapi: '3.0.3',

  info: {
    title:       'JobBoard REST API',
    version:     '1.0.0',
    description:
      'API REST pédagogique pour la plateforme JobBoard.\n\n' +
      "Ce backend accompagne le **Chapitre 2** du module *Applications Web Distribuées* " +
      "(ESPRIT — 4ème année Ingénieur). Il expose le CRUD complet des ressources " +
      "**Candidate**, **Address**, **Application**, **Job**, **Notification** et **Meeting**.",
    contact: {
      name:  'Équipe pédagogique AWD — ESPRIT',
      email: 'awd@esprit.tn'
    },
    license: { name: 'MIT' }
  },

  servers: [
    {
      url:         `http://localhost:${process.env.PORT || 3000}`,
      description: 'Serveur local de développement'
    }
  ],

  tags: [
    { name: 'Candidates', description: 'Gestion des candidats (CRUD complet).' },
    { name: 'Addresses',  description: 'Gestion des adresses postales (CRUD complet).' },
    { name: 'Applications',  description: 'Gestion des candidatures (CRUD complet).' },
    { name: 'Jobs',          description: "Gestion des offres d'emploi (CRUD, recherche, filtres)." },
    { name: 'Notifications', description: 'Gestion des notifications (CRUD, filtre par destinataire).' },
    { name: 'Meetings',      description: 'Gestion des réunions (CRUD, machine à états du statut).' },
    { name: 'System',    description: 'Endpoints techniques (santé, information).' }
  ],

  components: {

    schemas: {
      // ==================================================================
      // ADDRESS
      // ==================================================================
      Address: {
        type: 'object',
        required: ['id', 'street', 'houseNumber', 'zipCode'],
        properties: {
          id:          { type: 'integer', example: 1 },
          street:      { type: 'string',  example: 'Avenue Habib Bourguiba' },
          houseNumber: { type: 'string',  example: '25' },
          zipCode:     { type: 'string',  example: '1000' },
          created_at:  { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' },
          updated_at:  { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' }
        }
      },

      AddressInput: {
        type: 'object',
        required: ['street', 'houseNumber', 'zipCode'],
        properties: {
          street:      { type: 'string', example: 'Avenue Habib Bourguiba' },
          houseNumber: { type: 'string', example: '25' },
          zipCode:     { type: 'string', example: '1000' }
        }
      },

      AddressList: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Address' } },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },

      // ==================================================================
      // CANDIDATE
      // ==================================================================
      Candidate: {
        type: 'object',
        required: ['id', 'firstname', 'lastname', 'email'],
        properties: {
          id:         { type: 'integer', example: 1 },
          firstname:  { type: 'string',  example: 'Youssef' },
          lastname:   { type: 'string',  example: 'Mzoughi' },
          email:      { type: 'string',  format: 'email', example: 'youssef.mzoughi@example.tn' },
          address_id: { type: 'integer', example: 1, nullable: true },
          address:    { $ref: '#/components/schemas/Address' },
          created_at: { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' },
          updated_at: { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' }
        }
      },

      CandidateInput: {
        type: 'object',
        required: ['firstname', 'lastname', 'email'],
        properties: {
          firstname:  { type: 'string', example: 'Youssef' },
          lastname:   { type: 'string', example: 'Mzoughi' },
          email:      { type: 'string', format: 'email', example: 'youssef.mzoughi@example.tn' },
          address_id: { type: 'integer', example: 1, nullable: true, description: "Id de l'adresse. Doit exister et ne pas être déjà utilisée." }
        }
      },

      CandidateList: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Candidate' } },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },

      // ==================================================================
      // APPLICATION
      // ==================================================================
      Application: {
        type: 'object',
        required: ['id', 'applicationDate', 'candidate_id', 'job_id'],
        properties: {
          id:              { type: 'integer', example: 1 },
          applicationDate: { type: 'string',  format: 'date', example: '2026-02-05' },
          motivation:      { type: 'string',  example: 'Passionné par le Full-Stack, je souhaite mettre mes compétences à votre service.' },
          candidate_id:    { type: 'integer', example: 1 },
          job_id:          { type: 'integer', example: 1 },
          created_at:      { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' },
          updated_at:      { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' }
        }
      },

      ApplicationInput: {
        type: 'object',
        required: ['applicationDate', 'motivation', 'candidate_id', 'job_id'],
        properties: {
          applicationDate: { type: 'string',  format: 'date', example: '2026-02-05' },
          motivation:      { type: 'string',  example: 'Passionné par le Full-Stack, je souhaite mettre mes compétences à votre service.' },
          candidate_id:    { type: 'integer', example: 1, description: 'Id du candidat. Doit exister.' },
          job_id:          { type: 'integer', example: 1, description: "Id de l'offre. Doit exister. Un candidat ne postule qu'une fois par offre." }
        }
      },

      ApplicationList: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Application' } },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },

      // ==================================================================
      // JOB
      // ==================================================================
      Job: {
        type: 'object',
        required: ['id', 'name', 'description', 'available', 'date', 'category_id'],
        properties: {
          id:          { type: 'integer', example: 1 },
          name:        { type: 'string',  example: 'Développeur Full-Stack Node.js' },
          description: { type: 'string',  example: 'Nous recherchons un développeur Full-Stack pour rejoindre notre équipe produit.' },
          available:   { type: 'boolean', example: true },
          date:        { type: 'string',  format: 'date', example: '2026-02-01' },
          category_id: { type: 'integer', example: 1 },
          created_at:  { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' },
          updated_at:  { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' }
        }
      },

      JobInput: {
        type: 'object',
        required: ['name', 'description', 'date', 'category_id'],
        properties: {
          name:        { type: 'string',  example: 'Développeur Full-Stack Node.js' },
          description: { type: 'string',  example: 'Nous recherchons un développeur Full-Stack pour rejoindre notre équipe produit.' },
          available:   { type: 'boolean', example: true, default: true },
          date:        { type: 'string',  format: 'date', example: '2026-02-01' },
          category_id: { type: 'integer', example: 1, description: 'Id de la catégorie. Doit exister.' }
        }
      },

      JobList: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Job' } },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },

      // ==================================================================
      // NOTIFICATION
      // ==================================================================
      Notification: {
        type: 'object',
        required: ['id', 'sender', 'recipient', 'content', 'date', 'application_id'],
        properties: {
          id:             { type: 'integer', example: 1 },
          sender:         { type: 'string',  format: 'email', example: 'recruitment@jobboard.tn' },
          recipient:      { type: 'string',  format: 'email', example: 'youssef.mzoughi@example.tn' },
          content:        { type: 'string',  example: 'Votre candidature a bien été reçue.' },
          date:           { type: 'string',  format: 'date-time', example: '2026-02-05T10:30:00Z' },
          application_id: { type: 'integer', example: 1 },
          created_at:     { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' }
        }
      },

      NotificationInput: {
        type: 'object',
        required: ['sender', 'recipient', 'content', 'date', 'application_id'],
        properties: {
          sender:         { type: 'string',  format: 'email', example: 'recruitment@jobboard.tn' },
          recipient:      { type: 'string',  format: 'email', example: 'youssef.mzoughi@example.tn' },
          content:        { type: 'string',  example: 'Votre candidature a bien été reçue.' },
          date:           { type: 'string',  format: 'date-time', example: '2026-02-05T10:30:00Z' },
          application_id: { type: 'integer', example: 1, description: "Id de la candidature. Doit exister et ne pas avoir déjà une notification." }
        }
      },

      NotificationList: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },

      // ==================================================================
      // MEETING
      // ==================================================================
      Meeting: {
        type: 'object',
        required: ['id', 'reference', 'status', 'application_id'],
        properties: {
          id:             { type: 'integer', example: 1 },
          reference:      { type: 'string',  example: 'MTG-2026-001' },
          link:           { type: 'string',  format: 'uri', example: 'https://meet.jobboard.tn/mtg-2026-001', nullable: true },
          status:         { type: 'string',  enum: ['scheduled', 'held', 'cancelled'], example: 'scheduled' },
          application_id: { type: 'integer', example: 1 },
          created_at:     { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' },
          updated_at:     { type: 'string', format: 'date-time', example: '2026-01-15T09:12:00Z' }
        }
      },

      MeetingInput: {
        type: 'object',
        required: ['reference', 'application_id'],
        properties: {
          reference:      { type: 'string',  example: 'MTG-2026-001', description: 'Référence unique.' },
          link:           { type: 'string',  format: 'uri', example: 'https://meet.jobboard.tn/mtg-2026-001', nullable: true },
          status:         { type: 'string',  enum: ['scheduled', 'held', 'cancelled'], default: 'scheduled' },
          application_id: { type: 'integer', example: 1, description: "Id de la candidature. Doit exister et ne pas avoir déjà une réunion." }
        }
      },

      MeetingStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['scheduled', 'held', 'cancelled'], example: 'held' }
        }
      },

      MeetingList: {
        type: 'object',
        properties: {
          data:       { type: 'array', items: { $ref: '#/components/schemas/Meeting' } },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },

      // ==================================================================
      // Communs
      // ==================================================================
      Pagination: {
        type: 'object',
        properties: {
          total:      { type: 'integer', example: 42 },
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 3 }
        }
      },

      Error: {
        type: 'object',
        required: ['status', 'message'],
        properties: {
          status:  { type: 'integer', example: 400 },
          message: { type: 'string',  example: "Les données envoyées sont invalides." },
          errors:  {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field:   { type: 'string', example: 'email' },
                message: { type: 'string', example: "L'email n'est pas au bon format." }
              }
            }
          }
        }
      }
    },

    // -------------------------------------------------------------------
    // Réponses réutilisables
    // -------------------------------------------------------------------
    responses: {
      NotFound: {
        description: 'Ressource introuvable.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { status: 404, message: 'Ressource non trouvée' }
          }
        }
      },
      BadRequest: {
        description: 'Requête invalide (données mal formées).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              status: 400,
              message: 'Erreur de validation',
              errors: [{ field: 'email', message: "L'email n'est pas au bon format." }]
            }
          }
        }
      },
      Conflict: {
        description: 'Conflit métier (par exemple email déjà utilisé).',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { status: 409, message: "L'email est déjà utilisé par un autre candidat." }
          }
        }
      },
      ServerError: {
        description: 'Erreur interne du serveur.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { status: 500, message: 'Une erreur interne est survenue.' }
          }
        }
      }
    },

    // -------------------------------------------------------------------
    // Paramètres réutilisables
    // -------------------------------------------------------------------
    parameters: {
      CandidateId: {
        name: 'id', in: 'path', required: true,
        description: "Identifiant d'un candidat.",
        schema: { type: 'integer', minimum: 1, example: 1 }
      },
      AddressId: {
        name: 'id', in: 'path', required: true,
        description: "Identifiant d'une adresse.",
        schema: { type: 'integer', minimum: 1, example: 1 }
      },
      ApplicationId: {
        name: 'id', in: 'path', required: true,
        description: "Identifiant d'une candidature.",
        schema: { type: 'integer', minimum: 1, example: 1 }
      },
      JobId: {
        name: 'id', in: 'path', required: true,
        description: "Identifiant d'une offre d'emploi.",
        schema: { type: 'integer', minimum: 1, example: 1 }
      },
      NotificationId: {
        name: 'id', in: 'path', required: true,
        description: "Identifiant d'une notification.",
        schema: { type: 'integer', minimum: 1, example: 1 }
      },
      MeetingId: {
        name: 'id', in: 'path', required: true,
        description: "Identifiant d'une réunion.",
        schema: { type: 'integer', minimum: 1, example: 1 }
      },
      Page: {
        name: 'page', in: 'query', required: false,
        description: 'Numéro de page (commence à 1).',
        schema: { type: 'integer', minimum: 1, default: 1 }
      },
      Limit: {
        name: 'limit', in: 'query', required: false,
        description: 'Nombre d\'éléments par page (max 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      }
    }
  }
};


// ---------------------------------------------------------------------------
// Options passées à swagger-jsdoc
// ---------------------------------------------------------------------------
const options = {
  definition: openApiDefinition,
  // ⚠️ Utiliser des chemins RELATIFS au cwd (dossier où l'on lance npm start)
  // et non path.join(__dirname, ...) qui pose problème avec le glob interne.
  apis: [
    './routes/*.js',
    './routes/**/*.js'
  ]
};

// Génération du document OpenAPI final
const swaggerSpec = swaggerJsdoc(options);

// -- DEBUG : à retirer une fois que ça marche --
console.log('🔍 Swagger paths trouvés :', Object.keys(swaggerSpec.paths || {}));

module.exports = swaggerSpec;

