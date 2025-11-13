// Route utilities for pattern matching and access verification
// CRITICAL: DO NOT MODIFY this implementation - it is required as-is

const customFunctions = {}; // MUST remain empty - custom functions not supported

/**
 * Get route configuration from routes.json
 */
export const getRouteConfig = (path) => {
  try {
    // Import routes configuration
    const routes = {
      "/": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Homepage requires authentication",
                "rule": "authenticated"
              }
            ]
          },
          "redirectOnDeny": "/login",
          "excludeRedirectQuery": false
        }
      },
      "/login": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Login page is public",
                "rule": "public"
              }
            ],
            "operator": "OR"
          }
        }
      },
      "/signup": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Signup page is public", 
                "rule": "public"
              }
            ],
            "operator": "OR"
          }
        }
      },
      "/callback": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Callback page is public",
                "rule": "public"
              }
            ],
            "operator": "OR"
          }
        }
      },
      "/error": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Error page is public",
                "rule": "public"
              }
            ],
            "operator": "OR"
          }
        }
      },
      "/prompt-password/*": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Prompt password is public",
                "rule": "public"
              }
            ],
            "operator": "OR"
          }
        }
      },
      "/reset-password/*": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Reset password is public", 
                "rule": "public"
              }
            ],
            "operator": "OR"
          }
        }
      },
      "/category/*": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Category pages require authentication",
                "rule": "authenticated"
              }
            ]
          },
          "redirectOnDeny": "/login"
        }
      },
      "/priority/*": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Priority pages require authentication",
                "rule": "authenticated"
              }
            ]
          },
          "redirectOnDeny": "/login"
        }
      },
      "/overdue": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Overdue page requires authentication",
                "rule": "authenticated"
              }
            ]
          },
          "redirectOnDeny": "/login"
        }
      },
      "/today": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Today page requires authentication",
                "rule": "authenticated"
              }
            ]
          },
          "redirectOnDeny": "/login"
        }
      },
      "/upcoming": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Upcoming page requires authentication",
                "rule": "authenticated"
              }
            ]
          },
          "redirectOnDeny": "/login"
        }
      },
      "/completed": {
        "allow": {
          "when": {
            "conditions": [
              {
                "label": "Completed page requires authentication",
                "rule": "authenticated"
              }
            ]
          },
          "redirectOnDeny": "/login"
        }
      }
    };

    // Find matching route pattern
    const exactMatch = routes[path];
    if (exactMatch) return exactMatch;

    // Find pattern match with highest specificity
    const patterns = Object.keys(routes);
    const matches = patterns
      .filter(pattern => matchesPattern(path, pattern))
      .map(pattern => ({ pattern, config: routes[pattern], specificity: getSpecificity(pattern) }))
      .sort((a, b) => b.specificity - a.specificity);

    return matches.length > 0 ? matches[0].config : null;
  } catch (error) {
    console.error('Error getting route config:', error);
    return null;
  }
};

/**
 * Check if path matches pattern
 */
export const matchesPattern = (path, pattern) => {
  // Exact match
  if (path === pattern) return true;
  
  // Wildcard patterns
  if (pattern.endsWith('/**/*')) {
    const base = pattern.slice(0, -5);
    return path.startsWith(base);
  }
  
  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -2);
    const remainder = path.slice(base.length);
    return path.startsWith(base) && !remainder.includes('/');
  }
  
  // Parameter patterns (:id)
  if (pattern.includes(':')) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) return false;
    
    return patternParts.every((part, i) => 
      part.startsWith(':') || part === pathParts[i]
    );
  }
  
  return false;
};

/**
 * Get pattern specificity for sorting
 */
export const getSpecificity = (pattern) => {
  let score = 0;
  
  // Exact paths get highest score
  if (!pattern.includes(':') && !pattern.includes('*')) {
    score += 1000;
  }
  
  // Count path segments
  score += pattern.split('/').length * 10;
  
  // Parameters are less specific than exact
  const paramCount = (pattern.match(/:/g) || []).length;
  score -= paramCount * 5;
  
  // Wildcards are least specific
  if (pattern.includes('/**/*')) score -= 100;
  else if (pattern.includes('/*')) score -= 50;
  
  return score;
};

/**
 * Verify if user has access to route
 */
export const verifyRouteAccess = (config, user) => {
  if (!config?.allow) {
    return { allowed: true, redirectTo: null, excludeRedirectQuery: false, failed: [] };
  }

  const { when, redirectOnDeny, excludeRedirectQuery } = config.allow;
  const conditions = when?.conditions || [];
  const operator = when?.operator || 'AND';
  
  const results = conditions.map(condition => evaluateCondition(condition, user));
  
  let allowed;
  if (operator === 'OR') {
    allowed = results.some(r => r.passed);
  } else {
    allowed = results.every(r => r.passed);
  }
  
  const failed = results.filter(r => !r.passed).map(r => r.label);
  
  return {
    allowed,
    redirectTo: allowed ? null : redirectOnDeny,
    excludeRedirectQuery: excludeRedirectQuery || false,
    failed
  };
};

/**
 * Evaluate a single condition
 */
const evaluateCondition = (condition, user) => {
  const { rule, label } = condition;
  
  let passed = false;
  
  switch (rule) {
    case 'public':
      passed = true;
      break;
    case 'authenticated':
      passed = !!user;
      break;
    default:
      console.warn(`Unknown rule: ${rule}`);
      passed = false;
  }
  
  return { passed, label };
};