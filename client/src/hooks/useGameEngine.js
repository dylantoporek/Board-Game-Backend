import { useCallback, useEffect, useReducer, useRef } from "react";
import { createInitialState, reducer, rollDie } from "../game/engine";

// Drives the turn loop: humans roll via the returned `roll()`; CPUs roll
// themselves on a timer. A roll spins the die (phase "rolling") before the
// move is applied, so the UI can animate.
const DICE_SPIN_MS = 750;
const CPU_THINK_MS = 850;

export function useGameEngine(config) {
  const [state, dispatch] = useReducer(reducer, config, createInitialState);
  const timers = useRef([]);

  const roll = useCallback(() => {
    // luck is drawn here (not in the reducer) so the reducer stays pure.
    dispatch({ type: "START_ROLL", value: rollDie(), luck: Math.random() });
    const t = setTimeout(() => dispatch({ type: "APPLY_ROLL" }), DICE_SPIN_MS);
    timers.current.push(t);
  }, []);

  const activePlayer = state.players[state.turnIndex];
  const isCpuTurn = state.phase === "ready" && activePlayer && activePlayer.isCPU;

  // Auto-roll for the CPU whose turn it is.
  useEffect(() => {
    if (!isCpuTurn) return undefined;
    const t = setTimeout(roll, CPU_THINK_MS);
    return () => clearTimeout(t);
  }, [isCpuTurn, state.turnIndex, roll]);

  // Clean up any pending dice timers on unmount.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const canRollNow = state.phase === "ready" && activePlayer && !activePlayer.isCPU;

  return { state, activePlayer, canRollNow, roll };
}
