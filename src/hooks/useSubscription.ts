/**
 * useSubscription Hook
 * 
 * Manages user subscription state and billing operations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { backendFetch, post, get } from '../services/backend/api';
import { openUrl } from '@tauri-apps/plugin-opener';

export type PlanTier = 'free' | 'plus' | 'pro';

export interface AvailableModel {
  id: string;
  name: string;
}

export interface PlanResponse {
  plan: PlanTier;
  planName: string;
  price: number;
  selectedModel: string;
  availableModels: AvailableModel[];
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionState {
  plan: PlanTier;
  planName: string;
  price: number;
  selectedModel: string;
  availableModels: AvailableModel[];
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UsageLimits {
  planGeneration: {
    allowed: boolean;
    remaining: number;
    limit: number;
  };
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    planName: 'Free',
    price: 0,
    selectedModel: 'gemini-2.5-flash-lite',
    availableModels: [],
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    isLoading: true,
    error: null,
  });

  const [limits, setLimits] = useState<UsageLimits | null>(null);
  const [isPollingPlan, setIsPollingPlan] = useState(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch current plan
  const fetchPlan = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await get<PlanResponse>('/billing/plan');
      if (!response.ok || !response.data) {
        throw new Error(response.error || 'Failed to fetch plan');
      }
      
      setState({
        plan: response.data.plan,
        planName: response.data.planName,
        price: response.data.price,
        selectedModel: response.data.selectedModel,
        availableModels: response.data.availableModels,
        currentPeriodEnd: response.data.currentPeriodEnd,
        cancelAtPeriodEnd: response.data.cancelAtPeriodEnd,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  // Fetch usage limits
  const fetchLimits = useCallback(async () => {
    try {
      const response = await get<UsageLimits>('/billing/limits');
      if (response.ok && response.data) {
        setLimits(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch usage limits:', error);
    }
  }, []);

  // Update selected model
  const setModel = useCallback(async (modelId: string) => {
    try {
      const response = await backendFetch<{ success: boolean; selectedModel: string }>('/billing/model', {
        method: 'PUT',
        body: JSON.stringify({ model: modelId }),
      });

      if (!response.ok) {
        throw new Error(response.error || 'Failed to update model');
      }

      setState(prev => ({ ...prev, selectedModel: modelId }));
    } catch (error) {
      console.error('Failed to update model:', error);
      throw error;
    }
  }, []);

  // Start checkout for upgrade
  const startCheckout = useCallback(async (plan: 'plus' | 'pro') => {
    try {
      // Use rainyday:// scheme (matches Tauri config)
      const successUrl = 'rainyday://billing/success';
      const cancelUrl = 'rainyday://billing/cancel';

      const response = await post<{ sessionId: string; url: string }>('/billing/checkout', {
        plan,
        successUrl,
        cancelUrl,
      });

      if (!response.ok || !response.data) {
        throw new Error(response.error || 'Failed to create checkout session');
      }
      
      // Open Stripe checkout in browser using Tauri's opener plugin
      if (response.data.url) {
        await openUrl(response.data.url);
      }

      return response.data;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }, []);

  // Open billing portal
  const openBillingPortal = useCallback(async () => {
    try {
      const response = await post<{ url: string }>('/billing/portal', {
        returnUrl: 'rainyday://settings',
      });

      if (!response.ok || !response.data) {
        throw new Error(response.error || 'Failed to open billing portal');
      }
      
      if (response.data.url) {
        await openUrl(response.data.url);
      }
    } catch (error) {
      console.error('Portal error:', error);
      throw error;
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    try {
      const response = await post('/billing/cancel');

      if (!response.ok) {
        throw new Error(response.error || 'Failed to cancel subscription');
      }

      setState(prev => ({ ...prev, cancelAtPeriodEnd: true }));
    } catch (error) {
      console.error('Cancel error:', error);
      throw error;
    }
  }, []);

  // Reactivate subscription
  const reactivateSubscription = useCallback(async () => {
    try {
      const response = await post('/billing/reactivate');

      if (!response.ok) {
        throw new Error(response.error || 'Failed to reactivate subscription');
      }

      setState(prev => ({ ...prev, cancelAtPeriodEnd: false }));
    } catch (error) {
      console.error('Reactivate error:', error);
      throw error;
    }
  }, []);

  // Poll for plan updates after payment (called when returning from Stripe)
  const pollForPlanUpdate = useCallback(async (expectedPlan?: 'plus' | 'pro'): Promise<boolean> => {
    console.log('[Subscription] Starting plan update polling...');
    setIsPollingPlan(true);
    
    const maxAttempts = 12; // 60 seconds max (12 attempts x 5 seconds)
    let attempts = 0;
    const originalPlan = state.plan;

    return new Promise((resolve) => {
      const poll = async () => {
        attempts++;
        console.log(`[Subscription] Poll attempt ${attempts}/${maxAttempts}`);
        
        try {
          const response = await get<PlanResponse>('/billing/plan');
          
          if (response.ok && response.data) {
            const newPlan = response.data.plan;
            
            // Check if plan changed
            if (newPlan !== originalPlan) {
              console.log(`[Subscription] Plan updated: ${originalPlan} -> ${newPlan}`);
              setState({
                plan: response.data.plan,
                planName: response.data.planName,
                price: response.data.price,
                selectedModel: response.data.selectedModel,
                availableModels: response.data.availableModels,
                currentPeriodEnd: response.data.currentPeriodEnd,
                cancelAtPeriodEnd: response.data.cancelAtPeriodEnd,
                isLoading: false,
                error: null,
              });
              setIsPollingPlan(false);
              resolve(true);
              return;
            }
            
            // Check if expected plan matches (webhook processed)
            if (expectedPlan && newPlan === expectedPlan) {
              console.log(`[Subscription] Expected plan ${expectedPlan} confirmed`);
              setIsPollingPlan(false);
              resolve(true);
              return;
            }
          }
        } catch (error) {
          console.error('[Subscription] Poll error:', error);
        }
        
        if (attempts < maxAttempts) {
          pollTimeoutRef.current = setTimeout(poll, 5000);
        } else {
          console.log('[Subscription] Polling timed out');
          setIsPollingPlan(false);
          // Still refresh to get latest state
          await fetchPlan();
          resolve(false);
        }
      };
      
      // Start polling after a short delay to give webhook time
      pollTimeoutRef.current = setTimeout(poll, 2000);
    });
  }, [state.plan, fetchPlan]);

  // Initial fetch
  useEffect(() => {
    fetchPlan();
    fetchLimits();
    
    // Cleanup polling on unmount
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [fetchPlan, fetchLimits]);

  return {
    ...state,
    limits,
    isPollingPlan,
    refresh: fetchPlan,
    setModel,
    startCheckout,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
    pollForPlanUpdate,
  };
}
