//! High-performance in-memory cache with TTL support
//!
//! Provides fast client-side caching for API responses to improve UI responsiveness.
//! This is a temporary cache for SaaS data - the cloud backend remains the source of truth.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::RwLock;
use std::time::{Duration, Instant};

/// A cache entry with expiration
#[derive(Debug)]
struct CacheEntry {
    /// The cached value as JSON string
    value: String,
    /// When this entry was created
    created_at: Instant,
    /// Time-to-live duration
    ttl: Duration,
}

impl CacheEntry {
    fn new(value: String, ttl_seconds: u64) -> Self {
        Self {
            value,
            created_at: Instant::now(),
            ttl: Duration::from_secs(ttl_seconds),
        }
    }

    fn is_expired(&self) -> bool {
        self.created_at.elapsed() > self.ttl
    }

    #[allow(dead_code)]
    fn remaining_ttl(&self) -> Option<Duration> {
        let elapsed = self.created_at.elapsed();
        if elapsed > self.ttl {
            None
        } else {
            Some(self.ttl - elapsed)
        }
    }
}

/// Thread-safe in-memory cache
pub struct RustCache {
    store: RwLock<HashMap<String, CacheEntry>>,
}

impl RustCache {
    pub fn new() -> Self {
        Self {
            store: RwLock::new(HashMap::new()),
        }
    }

    /// Get a value from the cache
    pub fn get(&self, key: &str) -> Option<String> {
        let store = self.store.read().ok()?;
        let entry = store.get(key)?;

        if entry.is_expired() {
            drop(store);
            // Clean up expired entry
            self.remove(key);
            None
        } else {
            Some(entry.value.clone())
        }
    }

    /// Set a value in the cache with TTL
    pub fn set(&self, key: &str, value: String, ttl_seconds: u64) {
        if let Ok(mut store) = self.store.write() {
            store.insert(key.to_string(), CacheEntry::new(value, ttl_seconds));
        }
    }

    /// Remove a value from the cache
    pub fn remove(&self, key: &str) -> Option<String> {
        self.store.write().ok()?.remove(key).map(|e| e.value)
    }

    /// Invalidate all entries matching a pattern
    /// Pattern supports simple prefix matching with *
    pub fn invalidate_pattern(&self, pattern: &str) -> usize {
        let mut count = 0;
        if let Ok(mut store) = self.store.write() {
            let pattern_prefix = pattern.trim_end_matches('*');
            let keys_to_remove: Vec<String> = store
                .keys()
                .filter(|k| {
                    if pattern.ends_with('*') {
                        k.starts_with(pattern_prefix)
                    } else {
                        *k == pattern
                    }
                })
                .cloned()
                .collect();

            for key in keys_to_remove {
                store.remove(&key);
                count += 1;
            }
        }
        count
    }

    /// Clear all expired entries
    pub fn cleanup_expired(&self) -> usize {
        let mut count = 0;
        if let Ok(mut store) = self.store.write() {
            let keys_to_remove: Vec<String> = store
                .iter()
                .filter(|(_, entry)| entry.is_expired())
                .map(|(key, _)| key.clone())
                .collect();

            for key in keys_to_remove {
                store.remove(&key);
                count += 1;
            }
        }
        count
    }

    /// Get the number of entries in the cache
    #[allow(dead_code)]
    pub fn len(&self) -> usize {
        self.store.read().map(|s| s.len()).unwrap_or(0)
    }

    /// Check if cache is empty
    #[allow(dead_code)]
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// Clear all entries
    pub fn clear(&self) {
        if let Ok(mut store) = self.store.write() {
            store.clear();
        }
    }

    /// Get cache statistics
    pub fn stats(&self) -> CacheStats {
        if let Ok(store) = self.store.read() {
            let total = store.len();
            let expired = store.values().filter(|e| e.is_expired()).count();
            CacheStats {
                total_entries: total,
                expired_entries: expired,
                active_entries: total - expired,
            }
        } else {
            CacheStats::default()
        }
    }
}

impl Default for RustCache {
    fn default() -> Self {
        Self::new()
    }
}

/// Cache statistics
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CacheStats {
    pub total_entries: usize,
    pub expired_entries: usize,
    pub active_entries: usize,
}

// ============================================================================
// Tauri Commands
// ============================================================================

use tauri::State;

/// Global cache state managed by Tauri
pub struct CacheState(pub RustCache);

impl Default for CacheState {
    fn default() -> Self {
        Self(RustCache::new())
    }
}

/// Get a value from the cache
#[tauri::command]
pub fn cache_get(cache: State<'_, CacheState>, key: &str) -> Option<String> {
    cache.0.get(key)
}

/// Set a value in the cache with TTL (in seconds)
#[tauri::command]
pub fn cache_set(cache: State<'_, CacheState>, key: &str, value: String, ttl_seconds: u64) {
    cache.0.set(key, value, ttl_seconds);
}

/// Remove a value from the cache
#[tauri::command]
pub fn cache_remove(cache: State<'_, CacheState>, key: &str) -> Option<String> {
    cache.0.remove(key)
}

/// Invalidate entries matching a pattern (supports * for prefix matching)
#[tauri::command]
pub fn cache_invalidate(cache: State<'_, CacheState>, pattern: &str) -> usize {
    cache.0.invalidate_pattern(pattern)
}

/// Clear all cache entries
#[tauri::command]
pub fn cache_clear(cache: State<'_, CacheState>) {
    cache.0.clear();
}

/// Get cache statistics
#[tauri::command]
pub fn cache_stats(cache: State<'_, CacheState>) -> CacheStats {
    cache.0.stats()
}

/// Cleanup expired entries (called periodically)
#[tauri::command]
pub fn cache_cleanup(cache: State<'_, CacheState>) -> usize {
    cache.0.cleanup_expired()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread::sleep;
    use std::time::Duration;

    #[test]
    fn test_cache_set_get() {
        let cache = RustCache::new();
        cache.set("key1", "value1".to_string(), 60);
        assert_eq!(cache.get("key1"), Some("value1".to_string()));
    }

    #[test]
    fn test_cache_expiration() {
        let cache = RustCache::new();
        cache.set("key1", "value1".to_string(), 1);
        assert_eq!(cache.get("key1"), Some("value1".to_string()));
        sleep(Duration::from_secs(2));
        assert_eq!(cache.get("key1"), None);
    }

    #[test]
    fn test_cache_invalidate_pattern() {
        let cache = RustCache::new();
        cache.set("plan:2026-01-13", "plan1".to_string(), 60);
        cache.set("plan:2026-01-14", "plan2".to_string(), 60);
        cache.set("email:123", "email1".to_string(), 60);

        let removed = cache.invalidate_pattern("plan:*");
        assert_eq!(removed, 2);
        assert_eq!(cache.get("plan:2026-01-13"), None);
        assert_eq!(cache.get("email:123"), Some("email1".to_string()));
    }
}
