
// Export all vapi service functionality
export * from './types';
export * from './credentials';
export * from './calls';

// For backward compatibility
import { 
  fetchCredentials, 
  getApiKey, 
  getAssistantId, 
  setApiKey, 
  clearCredentials 
} from './credentials';

import {
  getCallAnalysis,
  getCallDetails,
  computeCallDuration
} from './calls';

// Main service object for backward compatibility
export const vapiService = {
  fetchCredentials,
  getApiKey,
  getAssistantId,
  setApiKey,
  clearApiKey: clearCredentials,
  getCallAnalysis,
  getCall: getCallDetails,
  computeCallDuration
};

export default vapiService;
