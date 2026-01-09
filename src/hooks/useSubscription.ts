/**
 * useSubscription Hook
 * 
 * Manages user subscription state and billing operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { backendFetch, post, get } from '../services/backend/api';

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
      const successUrl = 'rainy-day://billing/success';
      const cancelUrl = 'rainy-day://billing/cancel';

      const response = await post<{ sessionId: string; url: string }>('/billing/checkout', {
        plan,
        successUrl,
        cancelUrl,
      });

      if (!response.ok || !response.data) {
        throw new Error(response.error || 'Failed to create checkout session');
      }
      
      // Open Stripe checkout in browser
      if (response.data.url) {
        window.open(response.data.url, '_blank');
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
        returnUrl: 'rainy-day://settings',
      });

      if (!response.ok || !response.data) {
        throw new Error(response.error || 'Failed to open billing portal');
      }
      
      if (response.data.url) {
        window.open(response.data.url, '_blank');
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

  // Initial fetch
  useEffect(() => {
    fetchPlan();
    fetchLimits();
  }, [fetchPlan, fetchLimits]);

  return {
    ...state,
    limits,
    refresh: fetchPlan,
    setModel,
    startCheckout,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
  };
}
