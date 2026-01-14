/**
 * Chronicle Weaver - Main tRPC Router
 * 
 * Central API router that combines all tRPC routes for the Chronicle Weaver backend.
 * Provides type-safe API endpoints for game management, authentication, and billing.
 * 
 * Routes:
 * - game.* - Game session management and turn processing
 * - auth.* - User authentication and session management  
 * - billing.* - Stripe subscription and payment management
 * 
 * Last Updated: January 2025
 */

import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createContext } from './create-context';
import superjson from 'superjson';

// Initialize tRPC
const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.code === 'BAD_REQUEST' && error.cause instanceof z.ZodError
          ? error.cause.flatten()
          : null,
      },
    };
  },
});

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now guaranteed to be non-null
    },
  });
});

// === GAME MANAGEMENT ROUTES ===
const gameRouter = router({
  // Initialize new game session
  initialize: protectedProcedure
    .input(z.object({
      era: z.string().min(1, 'Era is required'),
      theme: z.string().min(1, 'Theme is required'),
      characterName: z.string().min(1, 'Character name is required'),
      difficulty: z.number().min(0).max(1),
      generateBackstory: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create game document in Firestore
        const gameData = {
          id: gameId,
          userId: ctx.user.uid,
          era: input.era,
          theme: input.theme,
          characterName: input.characterName,
          difficulty: input.difficulty,
          generateBackstory: input.generateBackstory,
          turnCount: 0,
          createdAt: new Date(),
          lastPlayedAt: new Date(),
          status: 'active',
          backstory: '',
          characterStats: {
            influence: 50,
            knowledge: 50,
            resources: 50,
            reputation: 50,
          },
          inventory: [],
          relationships: [],
          worldSystems: {
            politics: [],
            economics: { currency: '', marketPrices: {}, tradeRoutes: [] },
            war: { conflicts: [], alliances: [] },
          },
        };

        await ctx.db.collection('games').doc(gameId).set(gameData);

        return {
          success: true,
          gameId,
          game: gameData,
        };
      } catch (error) {
        console.error('Error initializing game:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initialize game',
        });
      }
    }),

  // Process player turn and generate next segment
  processTurn: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      choiceId: z.string(),
      customInput: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get current game
        const gameDoc = await ctx.db.collection('games').doc(input.gameId).get();
        if (!gameDoc.exists) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Game not found',
          });
        }

        const gameData = gameDoc.data();
        if (gameData.userId !== ctx.user.uid) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        // Check turn limits for free users
        const userDoc = await ctx.db.collection('users').doc(ctx.user.uid).get();
        const userData = userDoc.data();
        const subscriptionTier = userData?.subscriptionTier || 'free';
        
        if (subscriptionTier === 'free' && gameData.turnCount >= 5) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Turn limit reached for free users. Upgrade to continue.',
          });
        }

        // Call AI service to generate next segment
        const aiRequest = {
          messages: [
            {
              role: 'system',
              content: `You are a master storyteller creating an interactive narrative game. Generate the next segment of the story based on the player's choice. The game is set in ${gameData.era} with a ${gameData.theme} theme. The character is ${gameData.characterName}. This is turn ${gameData.turnCount + 1}.`
            },
            {
              role: 'user',
              content: `Previous context: ${gameData.currentSegment?.text || 'Beginning of story'}. Player choice: ${input.choiceId}${input.customInput ? ` - ${input.customInput}` : ''}. Generate the next narrative segment with 3 choices.`
            }
          ],
          userId: ctx.user.uid,
          subscriptionTier: userData?.subscriptionTier || 'free'
        };

        // Call AI handler
        const aiResponse = await fetch(`${process.env.AI_HANDLER_URL || 'http://localhost:3000'}/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aiRequest)
        });

        if (!aiResponse.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'AI service unavailable',
          });
        }

        const aiResult = await aiResponse.json();
        
        // Parse AI response into game segment
        const aiText = aiResult.completion || '';
        const choices = [
          { id: '1', text: 'Choice 1' },
          { id: '2', text: 'Choice 2' },
          { id: '3', text: 'Choice 3' },
        ];

        const nextSegment = {
          id: `segment-${gameData.turnCount + 1}`,
          text: aiText,
          choices,
          customChoiceEnabled: true,
        };

        // Save turn data
        const turnData = {
          turnNumber: gameData.turnCount + 1,
          timestamp: new Date(),
          choiceId: input.choiceId,
          customInput: input.customInput,
          narrativeText: nextSegment.text,
          choices: nextSegment.choices,
          aiResponse: nextSegment,
        };

        await ctx.db.collection('games').doc(input.gameId)
          .collection('turns').doc(`turn-${gameData.turnCount + 1}`).set(turnData);

        // Update game state
        await ctx.db.collection('games').doc(input.gameId).update({
          turnCount: gameData.turnCount + 1,
          lastPlayedAt: new Date(),
          currentSegment: nextSegment,
        });

        return {
          success: true,
          nextSegment,
          turnCount: gameData.turnCount + 1,
        };
      } catch (error) {
        console.error('Error processing turn:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process turn',
        });
      }
    }),

  // Save game state
  save: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      gameState: z.any(), // Full game state object
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const gameDoc = await ctx.db.collection('games').doc(input.gameId).get();
        if (!gameDoc.exists) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Game not found',
          });
        }

        const gameData = gameDoc.data();
        if (gameData.userId !== ctx.user.uid) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        await ctx.db.collection('games').doc(input.gameId).update({
          ...input.gameState,
          lastSavedAt: new Date(),
        });

        return { success: true };
      } catch (error) {
        console.error('Error saving game:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save game',
        });
      }
    }),

  // Load saved game
  load: protectedProcedure
    .input(z.object({
      gameId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const gameDoc = await ctx.db.collection('games').doc(input.gameId).get();
        if (!gameDoc.exists) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Game not found',
          });
        }

        const gameData = gameDoc.data();
        if (gameData.userId !== ctx.user.uid) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        // Load recent turns
        const turnsSnapshot = await ctx.db.collection('games').doc(input.gameId)
          .collection('turns').orderBy('turnNumber', 'desc').limit(10).get();
        
        const turns = turnsSnapshot.docs.map(doc => doc.data());

        return {
          game: gameData,
          recentTurns: turns,
        };
      } catch (error) {
        console.error('Error loading game:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to load game',
        });
      }
    }),

  // List user's saved games
  list: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const gamesSnapshot = await ctx.db.collection('games')
          .where('userId', '==', ctx.user.uid)
          .orderBy('lastPlayedAt', 'desc')
          .get();

        const games = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        return { games };
      } catch (error) {
        console.error('Error listing games:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list games',
        });
      }
    }),

  // Delete saved game
  delete: protectedProcedure
    .input(z.object({
      gameId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const gameDoc = await ctx.db.collection('games').doc(input.gameId).get();
        if (!gameDoc.exists) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Game not found',
          });
        }

        const gameData = gameDoc.data();
        if (gameData.userId !== ctx.user.uid) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        // Delete game and all associated turns
        const batch = ctx.db.batch();
        batch.delete(ctx.db.collection('games').doc(input.gameId));
        
        // Delete turns subcollection
        const turnsSnapshot = await ctx.db.collection('games').doc(input.gameId)
          .collection('turns').get();
        turnsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();

        return { success: true };
      } catch (error) {
        console.error('Error deleting game:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete game',
        });
      }
    }),
});

// === AUTHENTICATION ROUTES ===
const authRouter = router({
  // Get current user
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        uid: ctx.user.uid,
        email: ctx.user.email,
        isAnonymous: ctx.user.isAnonymous,
        isAuthenticated: true,
      };
    }),

  // Sign out (handled by client-side Firebase Auth)
  signOut: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Firebase Auth sign out is handled client-side
      return { success: true };
    }),
});

// === BILLING ROUTES ===
const billingRouter = router({
  // Create Stripe checkout session
  createCheckoutSession: protectedProcedure
    .input(z.object({
      priceId: z.string(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Get or create Stripe customer
        let customerId = null;
        const userDoc = await ctx.db.collection('users').doc(ctx.user.uid).get();
        const userData = userDoc.data();
        
        if (userData?.stripeCustomerId) {
          customerId = userData.stripeCustomerId;
        } else {
          const customer = await stripe.customers.create({
            email: ctx.user.email,
            metadata: {
              userId: ctx.user.uid,
            },
          });
          customerId = customer.id;
          
          // Save customer ID to user document
          await ctx.db.collection('users').doc(ctx.user.uid).update({
            stripeCustomerId: customerId,
          });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          metadata: {
            userId: ctx.user.uid,
          },
        });

        return {
          success: true,
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        });
      }
    }),

  // Create Stripe customer portal session
  createPortalSession: protectedProcedure
    .input(z.object({
      returnUrl: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Get user's Stripe customer ID
        const userDoc = await ctx.db.collection('users').doc(ctx.user.uid).get();
        const userData = userDoc.data();
        
        if (!userData?.stripeCustomerId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No Stripe customer found. Please subscribe first.',
          });
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
          customer: userData.stripeCustomerId,
          return_url: input.returnUrl,
        });

        return {
          success: true,
          url: session.url,
        };
      } catch (error) {
        console.error('Error creating portal session:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create portal session',
        });
      }
    }),

  // Get subscription status
  getSubscriptionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userDoc = await ctx.db.collection('users').doc(ctx.user.uid).get();
        const userData = userDoc.data();
        
        return {
          tier: userData?.subscriptionTier || 'free',
          status: userData?.subscriptionStatus || 'inactive',
          currentPeriodEnd: userData?.currentPeriodEnd || null,
        };
      } catch (error) {
        console.error('Error getting subscription status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get subscription status',
        });
      }
    }),

  // Update usage tracking
  updateUsage: protectedProcedure
    .input(z.object({
      action: z.enum(['ai_call', 'game_save', 'feature_access']),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const usageDoc = await ctx.db.collection('users').doc(ctx.user.uid)
          .collection('usage').doc(today).get();
        
        const currentUsage = usageDoc.exists ? usageDoc.data() : { aiCalls: 0, gameSaves: 0 };
        
        const newUsage = {
          ...currentUsage,
          [input.action === 'ai_call' ? 'aiCalls' : 'gameSaves']: 
            (currentUsage[input.action === 'ai_call' ? 'aiCalls' : 'gameSaves'] || 0) + 1,
          lastUpdated: new Date(),
        };

        await ctx.db.collection('users').doc(ctx.user.uid)
          .collection('usage').doc(today).set(newUsage);

        return { success: true, usage: newUsage };
      } catch (error) {
        console.error('Error updating usage:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update usage',
        });
      }
    }),
});

// === MAIN ROUTER ===
export const appRouter = router({
  game: gameRouter,
  auth: authRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;