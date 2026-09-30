import { Router } from 'express';
import { z } from 'zod';
import { objectIdSchema } from '@gyan-chowk/shared';
import { authenticate, requireRoles, type AuthedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validate } from '../middleware/validate.js';
import { writeAudit } from '../middleware/audit.js';
import { LearningStackCardModel } from '../models/index.js';
import { badRequest, notFound } from '../utils/errors.js';

export const learningStackRouter = Router();

export const DEFAULT_LEARNING_STACK_CARDS = [
  {
    title: 'Recorded Video Learning',
    description: 'HLS lessons you can pause, resume and revisit on your own time.',
    accentColor: 'amber',
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'Structured Batches',
    description: 'Cohorts with a syllabus, schedule and faculty guidance.',
    accentColor: 'violet',
    displayOrder: 2,
    isActive: true,
  },
  {
    title: 'Study Materials',
    description: 'Notes and PDFs unlocked after verified enrollment.',
    accentColor: 'green',
    displayOrder: 3,
    isActive: true,
  },
  {
    title: 'Tests',
    description: 'Timed papers, negative marking and all-India ranks.',
    accentColor: 'coral',
    displayOrder: 4,
    isActive: true,
  },
  {
    title: 'Assignments',
    description: 'Published work evaluated rigorously on the server.',
    accentColor: 'orange',
    displayOrder: 5,
    isActive: true,
  },
  {
    title: 'Doubt Resolution',
    description: 'Async doubt engine with direct faculty replies.',
    accentColor: 'blue',
    displayOrder: 6,
    isActive: true,
  },
  {
    title: 'Mentorship',
    description: 'Guided reviews with faculty on a recorded learning cadence.',
    accentColor: 'indigo',
    displayOrder: 7,
    isActive: true,
  },
  {
    title: 'Analytics',
    description: 'Progress from actual watch and attempt data.',
    accentColor: 'teal',
    displayOrder: 8,
    isActive: true,
  },
  {
    title: 'Rankings',
    description: 'Leaderboards from submitted tests, not estimates.',
    accentColor: 'pink',
    displayOrder: 9,
    isActive: true,
  },
  {
    title: 'Certificates',
    description: 'Issued from completion rules you can verify publicly.',
    accentColor: 'indigo',
    displayOrder: 10,
    isActive: true,
  },
  {
    title: 'Career Resources',
    description: 'Roadmaps and articles from the career desk.',
    accentColor: 'teal',
    displayOrder: 11,
    isActive: true,
  },
];

async function ensureDefaultCards() {
  const count = await LearningStackCardModel.countDocuments();
  if (count === 0) {
    await LearningStackCardModel.insertMany(DEFAULT_LEARNING_STACK_CARDS);
  }
}

const accentColorSchema = z.enum([
  'amber',
  'violet',
  'green',
  'coral',
  'orange',
  'blue',
  'indigo',
  'teal',
  'pink',
]);

const cardInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  description: z.string().trim().min(1, 'Description is required').max(500),
  accentColor: accentColorSchema.default('amber'),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
});

const cardUpdateSchema = cardInputSchema.partial();

const reorderSchema = z.object({
  orders: z.array(
    z.object({
      id: objectIdSchema,
      displayOrder: z.coerce.number().int().min(0).max(9999),
    })
  ).optional(),
  cardIds: z.array(objectIdSchema).optional(),
});

// PUBLIC: GET /api/learning-stack/cards
learningStackRouter.get(
  '/cards',
  asyncHandler(async (_req, res) => {
    await ensureDefaultCards();
    const cards = await LearningStackCardModel.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    res.json({ cards });
  })
);

// ADMIN: GET /api/learning-stack/admin/cards
learningStackRouter.get(
  '/admin/cards',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (_req, res) => {
    await ensureDefaultCards();
    const cards = await LearningStackCardModel.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    res.json({ cards });
  })
);

// ADMIN: POST /api/learning-stack/admin/cards
learningStackRouter.post(
  '/admin/cards',
  authenticate,
  requireRoles('admin'),
  validate(cardInputSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const card = await LearningStackCardModel.create(req.body);
    await writeAudit({
      actor: req.user?.id,
      role: req.user?.role,
      action: 'create',
      entity: 'learning_stack_card',
      entityId: card._id.toString(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
      after: card.toObject(),
    });
    res.status(201).json({ card });
  })
);

// ADMIN: PATCH /api/learning-stack/admin/cards/reorder
learningStackRouter.patch(
  '/admin/cards/reorder',
  authenticate,
  requireRoles('admin'),
  validate(reorderSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { orders, cardIds } = req.body;
    if (Array.isArray(orders) && orders.length > 0) {
      const bulkOps = orders.map((o) => ({
        updateOne: {
          filter: { _id: o.id },
          update: { $set: { displayOrder: o.displayOrder } },
        },
      }));
      await LearningStackCardModel.bulkWrite(bulkOps);
    } else if (Array.isArray(cardIds) && cardIds.length > 0) {
      const bulkOps = cardIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { displayOrder: index + 1 } },
        },
      }));
      await LearningStackCardModel.bulkWrite(bulkOps);
    } else {
      throw badRequest('No reorder data provided');
    }

    await writeAudit({
      actor: req.user?.id,
      role: req.user?.role,
      action: 'reorder',
      entity: 'learning_stack_card',
      entityId: 'all',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      after: { orders, cardIds },
    });

    const cards = await LearningStackCardModel.find().sort({ displayOrder: 1, createdAt: 1 }).lean();
    res.json({ success: true, cards });
  })
);

// ADMIN: POST /api/learning-stack/admin/cards/reset
learningStackRouter.post(
  '/admin/cards/reset',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    await LearningStackCardModel.deleteMany({});
    await LearningStackCardModel.insertMany(DEFAULT_LEARNING_STACK_CARDS);
    await writeAudit({
      actor: req.user?.id,
      role: req.user?.role,
      action: 'reset',
      entity: 'learning_stack_card',
      entityId: 'all',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      after: { resetToDefault: true },
    });
    const cards = await LearningStackCardModel.find().sort({ displayOrder: 1, createdAt: 1 }).lean();
    res.json({ success: true, cards });
  })
);

// ADMIN: PATCH /api/learning-stack/admin/cards/:id/status
learningStackRouter.patch(
  '/admin/cards/:id/status',
  authenticate,
  requireRoles('admin'),
  validate(z.object({ isActive: z.boolean().optional() })),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = req.params.id;
    const card = await LearningStackCardModel.findById(id);
    if (!card) throw notFound('Card not found');

    const nextActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !card.isActive;
    const before = card.toObject();
    card.isActive = nextActive;
    await card.save();

    await writeAudit({
      actor: req.user?.id,
      role: req.user?.role,
      action: 'update_status',
      entity: 'learning_stack_card',
      entityId: card._id.toString(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
      before,
      after: card.toObject(),
    });
    res.json({ card });
  })
);

// ADMIN: PUT /api/learning-stack/admin/cards/:id
learningStackRouter.put(
  '/admin/cards/:id',
  authenticate,
  requireRoles('admin'),
  validate(cardInputSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = req.params.id;
    const card = await LearningStackCardModel.findById(id);
    if (!card) throw notFound('Card not found');

    const before = card.toObject();
    card.title = req.body.title;
    card.description = req.body.description;
    card.accentColor = req.body.accentColor;
    card.displayOrder = req.body.displayOrder;
    if (req.body.isActive !== undefined) card.isActive = req.body.isActive;
    await card.save();

    await writeAudit({
      actor: req.user?.id,
      role: req.user?.role,
      action: 'update',
      entity: 'learning_stack_card',
      entityId: card._id.toString(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
      before,
      after: card.toObject(),
    });
    res.json({ card });
  })
);

// ADMIN: PATCH /api/learning-stack/admin/cards/:id
learningStackRouter.patch(
  '/admin/cards/:id',
  authenticate,
  requireRoles('admin'),
  validate(cardUpdateSchema),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = req.params.id;
    const card = await LearningStackCardModel.findById(id);
    if (!card) throw notFound('Card not found');

    const before = card.toObject();
    if (req.body.title !== undefined) card.title = req.body.title;
    if (req.body.description !== undefined) card.description = req.body.description;
    if (req.body.accentColor !== undefined) card.accentColor = req.body.accentColor;
    if (req.body.displayOrder !== undefined) card.displayOrder = req.body.displayOrder;
    if (req.body.isActive !== undefined) card.isActive = req.body.isActive;
    await card.save();

    await writeAudit({
      actor: req.user?.id,
      role: req.user?.role,
      action: 'update',
      entity: 'learning_stack_card',
      entityId: card._id.toString(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
      before,
      after: card.toObject(),
    });
    res.json({ card });
  })
);

// ADMIN: DELETE /api/learning-stack/admin/cards/:id
learningStackRouter.delete(
  '/admin/cards/:id',
  authenticate,
  requireRoles('admin'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = req.params.id;
    const card = await LearningStackCardModel.findById(id);
    if (!card) throw notFound('Card not found');

    const before = card.toObject();
    await card.deleteOne();

    await writeAudit({
      actor: req.user?.id,
      role: req.user?.role,
      action: 'delete',
      entity: 'learning_stack_card',
      entityId: id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      before,
      after: null,
    });
    res.json({ success: true, message: 'Card deleted successfully' });
  })
);
