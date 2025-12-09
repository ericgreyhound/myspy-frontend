import React, { createContext, useContext, useMemo, useReducer } from 'react';

const initialState = {
  userId: null,
  completed: false,
  preferences: {
    address: '',
    cuisine: [],
    meals: [],
    frequency: '',
    cost: '',
    motivation: [],
    companionship: '',
    kids_area: '',
    pet_friendly: '',
    plan: '',
    special_needs: '',
    special_needs_detail: '',
    languages: [],
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, userId: action.userId };
    case 'UPDATE_PREFS':
      return { ...state, preferences: { ...state.preferences, ...action.preferences } };
    case 'SET_COMPLETED':
      return { ...state, completed: Boolean(action.completed) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const UserProfileContext = createContext(null);

export function UserProfileProvider({ children, initialUserId }) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, userId: initialUserId || null });

  const value = useMemo(
    () => ({
      state,
      setUserId: (userId) => dispatch({ type: 'SET_USER', userId }),
      updatePreferences: (preferences) => dispatch({ type: 'UPDATE_PREFS', preferences }),
      setCompleted: (completed) => dispatch({ type: 'SET_COMPLETED', completed }),
      resetProfile: () => dispatch({ type: 'RESET' }),
    }),
    [state]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}


