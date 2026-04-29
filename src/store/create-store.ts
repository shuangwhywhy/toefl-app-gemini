import { useState, useEffect } from "react";

export function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<(state: T) => void>();

  const getState = () => state;

  const setState = (updates: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof updates === "function" ? updates(state) : updates;
    state = { ...state, ...nextState };
    listeners.forEach((listener) => listener(state));
  };

  const useStore = () => {
    const [currState, setCurrState] = useState(state);

    useEffect(() => {
      const listener = (s: T) => setCurrState(s);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, []);

    return currState;
  };

  return { getState, setState, useStore };
}
